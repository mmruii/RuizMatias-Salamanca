import { defineConfig } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.E2E_ADMIN_PASSWORD ||= randomBytes(24).toString('hex');
process.env.E2E_DATA_DIRECTORY ||= mkdtempSync(join(tmpdir(), 'salamanca-e2e-'));

export default defineConfig({
  testDir: './src/tests',
  globalTeardown: './src/tests/teardown.js',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5174',
    viewport: { width: 1366, height: 900 },
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm --prefix ../backend start',
      url: 'http://localhost:3001/api/products',
      env: {
        PORT: '3001',
        ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD,
        ADMIN_USERNAME: 'admin-test',
        ADMIN_ORIGIN: 'http://localhost:5174',
        PRODUCTS_FILE: join(process.env.E2E_DATA_DIRECTORY, 'products.json'),
      },
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --port 5174 --strictPort',
      url: 'http://localhost:5174',
      env: { API_PROXY_TARGET: 'http://127.0.0.1:3001' },
      reuseExistingServer: false,
    },
  ],
});
