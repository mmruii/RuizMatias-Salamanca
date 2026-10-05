import Product from "../models/Product.js";

const products = [
  Product.create({
    name: "Medialuna de manteca",
    description: "Medialuna artesanal, hojaldrada y horneada cada mañana.",
    category: "Panadería",
    price: 1200,
    imageUrl: "",
    available: true,
  }, 1),
  Product.create({
    name: "Croissant",
    description: "Croissant de masa madre con manteca de primera calidad.",
    category: "Panadería",
    price: 1800,
    imageUrl: "",
    available: true,
  }, 2),
  Product.create({
    name: "Café espresso",
    description: "Café de especialidad, extraído en el momento.",
    category: "Cafetería",
    price: 2200,
    imageUrl: "",
    available: true,
  }, 3),
];

class ProductRepository {
  getAll() {
    return [...products];
  }

  getById(id) {
    return products.find((product) => product.id === id) ?? null;
  }

  create(product) {
    const nextId = products.reduce((highestId, current) => Math.max(highestId, current.id), 0) + 1;
    const newProduct = Product.create(product, nextId);
    products.push(newProduct);
    return newProduct;
  }

  update(id, updatedProduct) {
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) {
      return null;
    }

    products[index] = updatedProduct;
    return updatedProduct;
  }

  delete(id) {
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) {
      return null;
    }

    return products.splice(index, 1)[0];
  }
}

export default new ProductRepository();