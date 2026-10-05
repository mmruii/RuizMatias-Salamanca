import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductPhoto,
} from './products.js';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('desempaqueta los productos y permite cancelar la carga', async () => {
  const products = [{ id: 1, name: 'Croissant' }];
  const signal = new AbortController().signal;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/products');
    assert.equal(options.signal, signal);
    return Response.json({ success: true, data: products });
  };
  assert.deepEqual(await getProducts(signal), products);
});

test('centraliza los metodos y cuerpos de alta, consulta, edicion y baja', async () => {
  const calls = [];
  const product = { name: 'Cafe', price: 2200 };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return Response.json({ success: true, data: product });
  };
  await createProduct(product);
  await getProduct(5);
  await updateProduct(5, product);
  await deleteProduct(5);
  assert.deepEqual(
    calls.map(({ method }) => method),
    ['POST', undefined, 'PUT', 'DELETE'],
  );
  assert.equal(calls[0].body, JSON.stringify(product));
  assert.equal(calls[2].url, '/api/products/5');
});

test('expone el mensaje de error de la API', async () => {
  globalThis.fetch = async () =>
    Response.json({ success: false, message: 'Nombre duplicado' }, { status: 409 });
  await assert.rejects(getProducts(), /Nombre duplicado/);
});

test('maneja fallos de red y respuestas no JSON', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };
  await assert.rejects(getProducts(), /conectar/);
  globalThis.fetch = async () => new Response('Bad gateway', { status: 502 });
  await assert.rejects(getProducts(), /respuesta no valida/);
});

test('no convierte una cancelacion en error de conexion', async () => {
  globalThis.fetch = async () => {
    throw new DOMException('Aborted', 'AbortError');
  };
  await assert.rejects(getProducts(), { name: 'AbortError' });
});

test('sube fotos sin forzar Content-Type JSON y devuelve la URL del servidor', async () => {
  const photo = new File(['photo'], 'photo.png', { type: 'image/png' });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/uploads');
    assert.equal(options.method, 'POST');
    assert.ok(options.body instanceof FormData);
    assert.equal(options.headers['Content-Type'], undefined);
    assert.equal(options.body.get('photo').name, 'photo.png');
    return Response.json({ success: true, data: { imageUrl: '/api/uploads/photo.webp' } });
  };
  assert.deepEqual(await uploadProductPhoto(photo), { imageUrl: '/api/uploads/photo.webp' });
});
