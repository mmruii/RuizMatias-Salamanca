import AppError from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

export default function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const isInvalidJson = error.type === "entity.parse.failed";
  const statusCode = error instanceof AppError ? error.statusCode : isInvalidJson ? 400 : 500;
  const message = error instanceof AppError
    ? error.message
    : isInvalidJson ? Messages.INVALID_DATA : Messages.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    message,
  });
}