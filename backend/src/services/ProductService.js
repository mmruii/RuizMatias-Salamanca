import productRepository from "../repositories/ProductRepository.js";
import Product from "../models/Product.js";
import { BadRequestError, ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

class ProductService {
  getAll() {
    return productRepository.getAll();
  }

  getById(id) {
    const productId = this.parseId(id);
    const product = productRepository.getById(productId);

    if (!product) {
      throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  create(data) {
    const product = Product.create(data);
    this.ensureUniqueName(product.name);
    return productRepository.create(product);
  }

  update(id, data) {
    const productId = this.parseId(id);
    const existingProduct = productRepository.getById(productId);

    if (!existingProduct) {
      throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
    }

    const updatedProduct = Product.create(
      { ...existingProduct, ...data },
      existingProduct.id,
    );
    this.ensureUniqueName(updatedProduct.name, existingProduct.id);
    return productRepository.update(productId, updatedProduct);
  }

  delete(id) {
    const productId = this.parseId(id);
    const deletedProduct = productRepository.delete(productId);

    if (!deletedProduct) {
      throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
    }

    return deletedProduct;
  }

  parseId(id) {
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId < 1) {
      throw new BadRequestError(Messages.INVALID_ID);
    }

    return productId;
  }

  ensureUniqueName(name, excludedId) {
    const duplicate = productRepository.getAll().some(
      (product) => product.id !== excludedId
        && product.name.toLocaleLowerCase("es") === name.toLocaleLowerCase("es"),
    );

    if (duplicate) {
      throw new ConflictError(Messages.DUPLICATED_RESOURCE);
    }
  }
}

export default new ProductService();