import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import AppError from "../exceptions/AppError.js";
import { requireAdmin } from "../middlewares/adminSession.js";
import { sendSuccess } from "../responses/ApiResponse.js";
import { uploadsDirectory } from "../utils/uploads.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
});

router.post("/", requireAdmin, (req, res, next) => {
  upload.single("photo")(req, res, (error) => {
    if (error) return next(new AppError(error.code === "LIMIT_FILE_SIZE"
      ? "La foto no puede superar los 5 MB."
      : "Envia una sola foto en el campo photo.", 400));
    next();
  });
}, async (req, res, next) => {
  if (!req.file) return next(new AppError("Selecciona una foto.", 400));

  let image;
  try {
    const source = sharp(req.file.buffer, { limitInputPixels: 20000000 });
    const metadata = await source.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format)) throw new Error();
    image = await source.rotate().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch {
    return next(new AppError("La foto debe ser una imagen JPG, PNG o WebP valida.", 400));
  }

  try {
    await mkdir(uploadsDirectory, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    await sharp(image).toFile(join(uploadsDirectory, filename));
    sendSuccess(res, { imageUrl: `/api/uploads/${filename}` }, 201);
  } catch (error) {
    next(error);
  }
});

export default router;