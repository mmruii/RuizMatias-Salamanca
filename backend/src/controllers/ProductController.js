import productService from "../services/ProductService.js";
import { sendSuccess } from "../responses/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class ProductController {
  getAll = asyncHandler((req, res) => {
    sendSuccess(res, productService.getAll());
  });

  getById = asyncHandler((req, res) => {
    sendSuccess(res, productService.getById(req.params.id));
  });

  create = asyncHandler((req, res) => {
    sendSuccess(res, productService.create(req.body), 201);
  });

  update = asyncHandler((req, res) => {
    sendSuccess(res, productService.update(req.params.id, req.body));
  });

  delete = asyncHandler((req, res) => {
    sendSuccess(res, productService.delete(req.params.id));
  });
}

export default new ProductController();