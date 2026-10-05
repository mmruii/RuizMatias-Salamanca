import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import app from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/products`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("el CRUD de productos mantiene el contrato de respuesta", async () => {
  const listResponse = await fetch(baseUrl);
  const listBody = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(listBody.success, true);
  assert.ok(listBody.data.length >= 3);

  const createResponse = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Tostado de campo",
      description: "Pan de masa madre con queso y jamón.",
      category: "Cafetería",
      price: 6500,
    }),
  });
  const createdBody = await createResponse.json();
  assert.equal(createResponse.status, 201);
  assert.equal(createdBody.success, true);
  assert.equal(createdBody.data.available, true);

  const productUrl = `${baseUrl}/${createdBody.data.id}`;
  const getResponse = await fetch(productUrl);
  assert.equal((await getResponse.json()).data.name, "Tostado de campo");

  const updateResponse = await fetch(productUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ price: 7000 }),
  });
  const updatedBody = await updateResponse.json();
  assert.equal(updateResponse.status, 200);
  assert.equal(updatedBody.data.price, 7000);
  assert.equal(updatedBody.data.name, "Tostado de campo");

  const deleteResponse = await fetch(productUrl, { method: "DELETE" });
  const deletedBody = await deleteResponse.json();
  assert.equal(deleteResponse.status, 200);
  assert.equal(deletedBody.data.id, createdBody.data.id);

  const missingResponse = await fetch(productUrl);
  const missingBody = await missingResponse.json();
  assert.equal(missingResponse.status, 404);
  assert.deepEqual(missingBody, { success: false, message: "El producto no existe." });
});

test("los datos inválidos usan el manejador centralizado", async () => {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Producto sin datos requeridos" }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, { success: false, message: "Los datos enviados son inválidos." });
});

test("el JSON mal formado y los productos duplicados mantienen sus estados de error", async () => {
  const malformedResponse = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(malformedResponse.status, 400);
  assert.deepEqual(await malformedResponse.json(), {
    success: false,
    message: "Los datos enviados son inválidos.",
  });

  const duplicateResponse = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Medialuna de manteca",
      description: "Otra medialuna.",
      category: "Panadería",
      price: 1300,
    }),
  });
  assert.equal(duplicateResponse.status, 409);
  assert.deepEqual(await duplicateResponse.json(), {
    success: false,
    message: "Ya existe un producto con ese nombre.",
  });
});