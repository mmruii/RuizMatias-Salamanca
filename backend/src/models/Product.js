import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

const requiredTextFields = ["name", "description", "category"];

export default class Product {
  constructor({ id, name, description, category, price, imageUrl = "", available = true }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.price = price;
    this.imageUrl = imageUrl;
    this.available = available;
  }

  static create(data, id) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    const normalizedData = { ...data };

    for (const field of requiredTextFields) {
      if (typeof normalizedData[field] !== "string" || !normalizedData[field].trim()) {
        throw new BadRequestError(Messages.INVALID_DATA);
      }

      normalizedData[field] = normalizedData[field].trim();
    }

    if (!Number.isFinite(normalizedData.price) || normalizedData.price <= 0) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    if (normalizedData.imageUrl !== undefined && typeof normalizedData.imageUrl !== "string") {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    if (normalizedData.available !== undefined && typeof normalizedData.available !== "boolean") {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    return new Product({ ...normalizedData, id });
  }
}