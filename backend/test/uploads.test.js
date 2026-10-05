import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { before, after, test } from "node:test";
import sharp from "sharp";
import app from "../src/app.js";
import { uploadsDirectory } from "../src/utils/uploads.js";

let server;
let baseUrl;
let cookie;
const originalPassword = process.env.ADMIN_PASSWORD;
const originalUsername = process.env.ADMIN_USERNAME;

before(async () => {
  process.env.ADMIN_USERNAME = "upload-test";
  process.env.ADMIN_PASSWORD = randomBytes(24).toString("hex");
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  const response = await fetch(`${baseUrl}/admin/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  });
  assert.equal(response.status, 200);
  cookie = response.headers.get("set-cookie").split(";")[0];
});

after(async () => {
  if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalPassword;
  if (originalUsername === undefined) delete process.env.ADMIN_USERNAME;
  else process.env.ADMIN_USERNAME = originalUsername;
  await new Promise((resolve) => server.close(resolve));
});

function photoForm(bytes, type = "image/png") {
  const form = new FormData();
  form.append("photo", new Blob([bytes], { type }), "photo.png");
  return form;
}

test("no acepta archivos sin sesion y rechaza archivos no imagen", async () => {
  assert.equal((await fetch(`${baseUrl}/uploads`, { method: "POST", body: photoForm("texto") })).status, 401);
  const invalid = await fetch(`${baseUrl}/uploads`, { method: "POST", headers: { Cookie: cookie }, body: photoForm("texto") });
  assert.equal(invalid.status, 400);
  const tooLarge = await fetch(`${baseUrl}/uploads`, { method: "POST", headers: { Cookie: cookie }, body: photoForm(Buffer.alloc(5 * 1024 * 1024 + 1)) });
  assert.equal(tooLarge.status, 400);
});

test("sube una foto real, la sirve como WebP y permite asociarla a un producto", async () => {
  const bytes = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#e8871e" } }).png().toBuffer();
  const response = await fetch(`${baseUrl}/uploads`, { method: "POST", headers: { Cookie: cookie }, body: photoForm(bytes) });
  assert.equal(response.status, 201);
  const { data } = await response.json();
  const filename = data.imageUrl.split("/").pop();
  let productId;
  try {
    const image = await fetch(`${baseUrl.replace("/api", "")}${data.imageUrl}`);
    assert.equal(image.headers.get("content-type"), "image/webp");
    assert.equal((await sharp(Buffer.from(await image.arrayBuffer())).metadata()).format, "webp");
    const product = await fetch(`${baseUrl}/products`, {
      method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ name: "Producto con foto", description: "Foto subida", category: "Panaderia", price: 1000, stock: 5, imageUrl: data.imageUrl }),
    });
    assert.equal(product.status, 201);
    const created = (await product.json()).data;
    productId = created.id;
    assert.equal(created.imageUrl, data.imageUrl);
    assert.equal(created.stock, 5);
  } finally {
    if (productId) await fetch(`${baseUrl}/products/${productId}`, { method: "DELETE", headers: { Cookie: cookie } });
    await unlink(join(uploadsDirectory, filename));
  }
});