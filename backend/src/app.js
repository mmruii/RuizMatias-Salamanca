import express from "express";
import productRoutes from "./routes/productRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";

const app = express();

app.use(express.json());
app.use("/api/products", productRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;