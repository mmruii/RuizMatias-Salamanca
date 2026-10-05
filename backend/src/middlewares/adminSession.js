import { randomBytes } from "node:crypto";
import session from "express-session";
import AppError from "../exceptions/AppError.js";

export const sessionCookieName = "salamanca.admin";
export const cookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const adminSession = session({
  name: sessionCookieName,
  secret: randomBytes(48).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: { ...cookieOptions, maxAge: 30 * 60 * 1000 },
});

export function checkAdminOrigin(req, res, next) {
  const origin = req.get("origin");
  const configuredOrigins = process.env.ADMIN_ORIGIN
    ? [process.env.ADMIN_ORIGIN]
    : [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
      ];
  const port = Number(process.env.PORT) || 3000;
  const allowedOrigins = [
    ...configuredOrigins,
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    return next(
      new AppError("El origen de la solicitud no esta permitido.", 403),
    );
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session?.admin) {
    return next(
      new AppError(
        "Inicia sesion como administrador para realizar esta operacion.",
        401,
      ),
    );
  }
  checkAdminOrigin(req, res, next);
}
