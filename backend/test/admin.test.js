import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { before, after, test } from "node:test";
import app from "../src/app.js";

let server;
let baseUrl;
const originalPassword = process.env.ADMIN_PASSWORD;
const originalUsername = process.env.ADMIN_USERNAME;
const password = randomBytes(24).toString("hex");

before(async () => {
  process.env.ADMIN_USERNAME = "admin-test";
  process.env.ADMIN_PASSWORD = password;
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (originalUsername === undefined) delete process.env.ADMIN_USERNAME;
  else process.env.ADMIN_USERNAME = originalUsername;
  if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalPassword;
  await new Promise((resolve) => server.close(resolve));
});

const login = (value, username = "admin-test") => fetch(`${baseUrl}/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password: value }),
});

test("el catalogo es publico pero todas las modificaciones requieren sesion", async () => {
  assert.equal((await fetch(`${baseUrl}/products`)).status, 200);
  for (const method of ["POST", "PUT", "DELETE"]) {
    const path = method === "POST" ? "/products" : "/products/1";
    const response = await fetch(`${baseUrl}${path}`, { method });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).success, false);
  }
});

test("sin clave configurada el acceso queda bloqueado", async () => {
  delete process.env.ADMIN_PASSWORD;
  try {
    assert.equal((await login(password)).status, 503);
  } finally {
    process.env.ADMIN_PASSWORD = password;
  }
});

test("valida clave, emite cookie protegida y revoca la sesion al salir", async () => {
  assert.equal((await login("incorrecta")).status, 401);
  assert.equal((await login(password, "otro-usuario")).status, 401);
  const authenticated = await login(password);
  assert.equal(authenticated.status, 200);
  const setCookie = authenticated.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  const headers = { Cookie: setCookie.split(";")[0] };
  const status = await fetch(`${baseUrl}/admin/session`, { headers });
  assert.deepEqual((await status.json()).data, { authenticated: true });
  assert.equal(status.headers.get("cache-control"), "no-store");

  const forbidden = await fetch(`${baseUrl}/products/1`, {
    method: "DELETE", headers: { ...headers, Origin: "https://otro-sitio.example" },
  });
  assert.equal(forbidden.status, 403);

  const logout = await fetch(`${baseUrl}/admin/logout`, { method: "POST", headers });
  assert.equal(logout.status, 200);
  const expired = await fetch(`${baseUrl}/products/1`, { method: "DELETE", headers });
  assert.equal(expired.status, 401);
});

test("limita los intentos fallidos de acceso", async () => {
  let response;
  for (let attempt = 0; attempt < 6; attempt += 1) response = await login("incorrecta");
  assert.equal(response.status, 429);
  assert.equal((await response.json()).success, false);
});