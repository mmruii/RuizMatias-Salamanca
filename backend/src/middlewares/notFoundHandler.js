import { NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

export default function notFoundHandler(req, res, next) {
  next(new NotFoundError(Messages.ROUTE_NOT_FOUND));
}