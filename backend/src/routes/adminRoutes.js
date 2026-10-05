import { createHash, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import AppError from "../exceptions/AppError.js";
import { checkAdminOrigin, cookieOptions, sessionCookieName } from "../middlewares/adminSession.js";
import { sendSuccess } from "../responses/ApiResponse.js";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Demasiados intentos. Intenta nuevamente en 15 minutos." },
});

router.get("/session", (req, res) => {
  res.set("Cache-Control", "no-store");
  sendSuccess(res, { authenticated: Boolean(req.session.admin) });
});

router.post("/login", checkAdminOrigin, loginLimiter, (req, res, next) => {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const configuredUsername = process.env.ADMIN_USERNAME;
  if (!configuredUsername?.trim() || configuredUsername.length > 100 || !configuredPassword || configuredPassword.length < 12 || configuredPassword.length > 256) {
    return next(new AppError("El acceso administrador no esta configurado en el servidor.", 503));
  }

  const password = req.body?.password;
  const username = req.body?.username;
  if (typeof username !== "string" || !username.trim() || username.length > 100 || typeof password !== "string" || !password || password.length > 256) {
    return next(new AppError("Ingresa un usuario y una clave validos.", 400));
  }

  const submitted = createHash("sha256").update(password).digest();
  const expected = createHash("sha256").update(configuredPassword).digest();
  const submittedUser = createHash("sha256").update(username.trim()).digest();
  const expectedUser = createHash("sha256").update(configuredUsername.trim()).digest();
  const passwordMatches = timingSafeEqual(submitted, expected);
  const usernameMatches = timingSafeEqual(submittedUser, expectedUser);
  if (!passwordMatches || !usernameMatches) {
    return next(new AppError("El usuario o la clave no son correctos.", 401));
  }

  req.session.regenerate((error) => {
    if (error) return next(error);
    req.session.admin = true;
    req.session.save((saveError) => {
      if (saveError) return next(saveError);
      res.set("Cache-Control", "no-store");
      sendSuccess(res, { authenticated: true });
    });
  });
});

router.post("/logout", checkAdminOrigin, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie(sessionCookieName, cookieOptions);
    res.set("Cache-Control", "no-store");
    sendSuccess(res, { authenticated: false });
  });
});

export default router;