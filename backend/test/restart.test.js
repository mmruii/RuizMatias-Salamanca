import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { test } from "node:test";

test(
  "el CRUD conserva cambios tras detener y arrancar un proceso real de API",
  { timeout: 20000 },
  async () => {
    const directory = mkdtempSync(join(tmpdir(), "salamanca-restart-"));
    const password = randomBytes(24).toString("hex");
    let child;
    let baseUrl;
    let cookie;
    async function start() {
      const appUrl = new URL("../src/app.js", import.meta.url).href;
      const environment = {
        ...process.env,
        PRODUCTS_FILE: join(directory, "products.json"),
        ADMIN_USERNAME: "restart-test",
        ADMIN_PASSWORD: password,
      };
      delete environment.NODE_TEST_CONTEXT;
      child = spawn(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `import app from ${JSON.stringify(appUrl)}; const server = app.listen(0, '127.0.0.1', () => process.send({ port: server.address().port }));`,
        ],
        {
          env: environment,
          stdio: ["ignore", "ignore", "pipe", "ipc"],
        },
      );
      const port = await new Promise((resolve, reject) => {
        child.once("message", (message) => resolve(message.port));
        child.once("error", reject);
        child.once("exit", () =>
          reject(new Error("La API de prueba termino antes de iniciar.")),
        );
      });
      baseUrl = `http://127.0.0.1:${port}/api`;
      const response = await fetch(`${baseUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "restart-test", password }),
      });
      assert.equal(response.status, 200);
      cookie = response.headers.get("set-cookie").split(";")[0];
    }
    async function stop() {
      if (!child || child.exitCode !== null) return;
      const exited = once(child, "exit");
      child.kill("SIGTERM");
      await exited;
      child = null;
    }
    try {
      await start();
      const response = await fetch(`${baseUrl}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({
          name: "Persistencia real",
          description: "Prueba entre procesos",
          category: "Panaderia",
          price: 1000,
          stock: 10,
          imageUrl: "/api/uploads/example.webp",
        }),
      });
      assert.equal(response.status, 201);
      const product = (await response.json()).data;
      await stop();
      await start();
      assert.deepEqual(
        (await (await fetch(`${baseUrl}/products/${product.id}`)).json()).data,
        product,
      );
      const update = await fetch(`${baseUrl}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ price: 2300, stock: 3 }),
      });
      assert.equal(update.status, 200);
      await stop();
      await start();
      const updated = (
        await (await fetch(`${baseUrl}/products/${product.id}`)).json()
      ).data;
      assert.equal(updated.price, 2300);
      assert.equal(updated.stock, 3);
      assert.equal(updated.imageUrl, product.imageUrl);
      assert.equal(
        (
          await fetch(`${baseUrl}/products/${product.id}`, {
            method: "DELETE",
            headers: { Cookie: cookie },
          })
        ).status,
        200,
      );
      await stop();
      await start();
      assert.equal(
        (await fetch(`${baseUrl}/products/${product.id}`)).status,
        404,
      );
    } finally {
      await stop();
      rmSync(directory, { recursive: true, force: true });
    }
  },
);
