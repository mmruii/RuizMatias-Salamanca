import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { getAdminSession, loginAdmin, logoutAdmin } from './admin.js';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('consulta sesion y centraliza login y logout con cookie de mismo origen', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return Response.json({ success: true, data: { authenticated: true } });
  };
  await getAdminSession();
  await loginAdmin('admin-test', 'valor-de-prueba');
  await logoutAdmin();
  assert.deepEqual(
    calls.map(({ url }) => url),
    ['/api/admin/session', '/api/admin/login', '/api/admin/logout'],
  );
  assert.equal(
    calls[1].body,
    JSON.stringify({ username: 'admin-test', password: 'valor-de-prueba' }),
  );
  assert.ok(calls.every((call) => call.credentials === 'same-origin' && call.cache === 'no-store'));
});

test('conserva el estado 401 para bloquear controles ante una sesion vencida', async () => {
  globalThis.fetch = async () =>
    Response.json({ success: false, message: 'Sesion vencida' }, { status: 401 });
  await assert.rejects(loginAdmin('admin-test', 'incorrecta'), {
    message: 'Sesion vencida',
    status: 401,
  });
});
