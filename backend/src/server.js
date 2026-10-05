import { loadEnvFile } from "node:process";

try {
  loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const { default: app } = await import("./app.js");

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`API Salamanca disponible en http://localhost:${port}`);
});