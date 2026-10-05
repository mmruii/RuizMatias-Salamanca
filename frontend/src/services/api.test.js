import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from './api.js';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('rechaza respuestas exitosas sin la informacion del contrato de API', async () => {
  globalThis.fetch = async () => Response.json({ success: true });
  await assert.rejects(request('/products'), /respuesta no valida/);
});

test('rechaza respuestas JSON que no respetan el contrato', async () => {
  for (const result of [null, [], 'respuesta', { data: [] }]) {
    globalThis.fetch = async () => Response.json(result);
    await assert.rejects(request('/products'), /No se pudo completar/);
  }
});

test('devuelve datos sin reemplazar listas vacias por informacion local', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: [] });
  assert.deepEqual(await request('/products'), []);
});

test('solicita JSON explicitamente para no recibir el HTML del panel', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Accept, 'application/json');
    return Response.json({ success: true, data: [] });
  };
  assert.deepEqual(await request('/products'), []);
});
