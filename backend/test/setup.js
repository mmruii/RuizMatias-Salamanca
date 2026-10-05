import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "salamanca-api-test-"));
process.env.PRODUCTS_FILE = join(directory, "products.json");
process.on("exit", () => rmSync(directory, { recursive: true, force: true }));
