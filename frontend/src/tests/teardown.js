import { rm } from 'node:fs/promises';

export default async function teardown() {
  if (process.env.E2E_DATA_DIRECTORY) {
    await rm(process.env.E2E_DATA_DIRECTORY, { recursive: true, force: true });
  }
}
