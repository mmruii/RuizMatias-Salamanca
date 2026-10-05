import { Router } from "express";
import productController from "../controllers/ProductController.js";
import { requireAdmin } from "../middlewares/adminSession.js";

const router = Router();

router.route("/")
  .get(productController.getAll)
  .post(requireAdmin, productController.create);

router.route("/:id")
  .get(productController.getById)
  .put(requireAdmin, productController.update)
  .delete(requireAdmin, productController.delete);

export default router;