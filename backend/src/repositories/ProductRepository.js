import Product from "../models/Product.js";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const initialProducts = [
  Product.create(
    {
      name: "Medialuna de manteca",
      description: "Medialuna artesanal, hojaldrada y horneada cada mañana.",
      category: "Panadería",
      price: 1200,
      imageUrl: "",
      available: true,
    },
    1,
  ),
  Product.create(
    {
      name: "Croissant",
      description: "Croissant de masa madre con manteca de primera calidad.",
      category: "Panadería",
      price: 1800,
      imageUrl: "",
      available: true,
    },
    2,
  ),
  Product.create(
    {
      name: "Café espresso",
      description: "Café de especialidad, extraído en el momento.",
      category: "Cafetería",
      price: 2200,
      imageUrl: "",
      available: true,
    },
    3,
  ),
];

export class ProductRepository {
  constructor(
    filePath = process.env.PRODUCTS_FILE ||
      fileURLToPath(new URL("../../data/products.json", import.meta.url)),
  ) {
    this.filePath = filePath;
    let stored;
    try {
      stored = JSON.parse(readFileSync(filePath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      stored = { nextId: 4, products: initialProducts };
      this.persist(stored.products, stored.nextId);
    }
    if (
      !Array.isArray(stored.products) ||
      !Number.isSafeInteger(stored.nextId) ||
      stored.nextId < 1
    ) {
      throw new Error(
        "El archivo de productos tiene un formato invalido. No se sobrescribio.",
      );
    }
    this.products = stored.products.map((product) => {
      if (!Number.isSafeInteger(product.id) || product.id < 1)
        throw new Error("ID persistido invalido.");
      return Product.create(product, product.id);
    });
    const ids = new Set(this.products.map((product) => product.id));
    if (
      ids.size !== this.products.length ||
      this.products.some((product) => product.id >= stored.nextId)
    ) {
      throw new Error(
        "Los IDs del archivo de productos son invalidos. No se sobrescribio.",
      );
    }
    this.nextId = stored.nextId;
  }

  persist(products, nextId) {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    writeFileSync(
      temporaryPath,
      JSON.stringify({ nextId, products }, null, 2),
      { mode: 0o600 },
    );
    renameSync(temporaryPath, this.filePath);
  }

  getAll() {
    return [...this.products];
  }

  getById(id) {
    return this.products.find((product) => product.id === id) ?? null;
  }

  create(product) {
    const newProduct = Product.create(product, this.nextId);
    const updatedProducts = [...this.products, newProduct];
    this.persist(updatedProducts, this.nextId + 1);
    this.products = updatedProducts;
    this.nextId += 1;
    return newProduct;
  }

  update(id, updatedProduct) {
    const index = this.products.findIndex((product) => product.id === id);

    if (index === -1) {
      return null;
    }

    const updatedProducts = [...this.products];
    updatedProducts[index] = updatedProduct;
    this.persist(updatedProducts, this.nextId);
    this.products = updatedProducts;
    return updatedProduct;
  }

  delete(id) {
    const index = this.products.findIndex((product) => product.id === id);

    if (index === -1) {
      return null;
    }

    const deleted = this.products[index];
    const updatedProducts = this.products.filter(
      (product) => product.id !== id,
    );
    this.persist(updatedProducts, this.nextId);
    this.products = updatedProducts;
    return deleted;
  }
}

export default new ProductRepository();
