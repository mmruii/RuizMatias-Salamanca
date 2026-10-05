import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ProductRepository } from "../src/repositories/ProductRepository.js";
import Product from "../src/models/Product.js";

test("crear, editar y borrar persisten al volver a abrir el repositorio", () => {
  const directory = mkdtempSync(join(tmpdir(), "salamanca-persistence-"));
  const filePath = join(directory, "products.json");
  try {
    const first = new ProductRepository(filePath);
    const created = first.create(
      Product.create({
        name: "Producto persistente",
        description: "Prueba",
        category: "Panaderia",
        price: 1000,
        stock: 15,
        imageUrl: "/api/uploads/test.webp",
      }),
    );
    const reopened = new ProductRepository(filePath);
    assert.deepEqual(reopened.getById(created.id), created);
    reopened.update(
      created.id,
      Product.create({ ...created, price: 2500, stock: 8 }, created.id),
    );
    const afterUpdate = new ProductRepository(filePath);
    assert.equal(afterUpdate.getById(created.id).stock, 8);
    assert.equal(afterUpdate.getById(created.id).price, 2500);
    assert.equal(afterUpdate.getById(created.id).imageUrl, created.imageUrl);
    afterUpdate.delete(created.id);
    const afterDelete = new ProductRepository(filePath);
    assert.equal(afterDelete.getById(created.id), null);
    const next = afterDelete.create(created);
    assert.ok(next.id > created.id);
    for (const product of afterDelete.getAll()) afterDelete.delete(product.id);
    assert.deepEqual(new ProductRepository(filePath).getAll(), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("un archivo corrupto no se reemplaza por productos iniciales", () => {
  const directory = mkdtempSync(join(tmpdir(), "salamanca-corrupt-"));
  const filePath = join(directory, "products.json");
  try {
    writeFileSync(filePath, "archivo corrupto");
    assert.throws(() => new ProductRepository(filePath));
    assert.equal(readFileSync(filePath, "utf8"), "archivo corrupto");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
