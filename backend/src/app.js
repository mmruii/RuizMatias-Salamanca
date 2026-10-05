import express from "express";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { uploadsDirectory } from "./utils/uploads.js";
import { adminSession } from "./middlewares/adminSession.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";

const app = express();
const frontendDirectory = fileURLToPath(
  new URL("../../frontend/dist/", import.meta.url),
);

function serveFrontend(req, res, next) {
  res.set("Cache-Control", "no-store");
  res.sendFile(join(frontendDirectory, "index.html"), (error) => {
    if (!error) return;
    if (error.code === "ENOENT") {
      res
        .status(503)
        .json({
          success: false,
          message:
            "Compila el frontend con npm --prefix frontend run build desde la raiz del proyecto.",
        });
      return;
    }
    next(error);
  });
}

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(adminSession);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use(
  "/api/uploads",
  express.static(uploadsDirectory, {
    dotfiles: "deny",
    index: false,
    setHeaders: (res) => res.set("X-Content-Type-Options", "nosniff"),
  }),
);
app.get("/api/products", (req, res, next) => {
  res.vary("Accept");
  if (
    req.get("Accept")?.includes("text/html") &&
    req.accepts(["html", "json"]) === "html"
  ) {
    return serveFrontend(req, res, next);
  }
  next();
});
app.use("/api/products", productRoutes);
app.use(
  "/assets",
  express.static(join(frontendDirectory, "assets"), { index: false }),
);
app.get(
  ["/", "/nosotros", "/productos", "/panel-de-control", "/gestion"],
  serveFrontend,
);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
