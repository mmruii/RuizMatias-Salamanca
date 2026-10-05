import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fileURLToPath } from 'node:url';
import { unlink } from 'node:fs/promises';

const bakeryPhoto = fileURLToPath(new URL('../assets/bakery.jpg', import.meta.url));
const coffeePhoto = fileURLToPath(new URL('../assets/coffee.jpg', import.meta.url));

test('Express sirve el panel visual en api/products y conserva la API JSON', async ({ page }) => {
  const origin = 'http://localhost:3001';
  const name = `Producto del panel Express ${Date.now()}`;
  let productId;
  try {
    const documentResponse = await page.goto(`${origin}/api/products`);
    expect(documentResponse.headers()['content-type']).toContain('text/html');
    await expect(page.getByLabel('Usuario', { exact: false })).toBeVisible();
    await page.getByLabel('Usuario', { exact: false }).fill('admin-test');
    await page.getByLabel('Clave de administrador').fill(process.env.E2E_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await expect(page.getByRole('table')).toBeVisible();
    await page.getByRole('button', { name: 'Nuevo producto' }).click();
    await page.getByLabel('Nombre', { exact: false }).fill(name);
    await page.getByLabel('Categoría', { exact: false }).last().fill('Panadería');
    await page.getByLabel('Descripción', { exact: false }).fill('Guardado desde Express.');
    await page.getByLabel('Precio (ARS)', { exact: false }).fill('3100');
    await page.getByLabel('Stock', { exact: false }).fill('9');
    await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const jsonResponse = await page.request.get(`${origin}/api/products`, {
      headers: { Accept: 'application/json' },
    });
    expect(jsonResponse.headers()['content-type']).toContain('application/json');
    const product = (await jsonResponse.json()).data.find((item) => item.name === name);
    productId = product.id;
    expect(product.stock).toBe(9);
    await page.reload();
    await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible();
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await page.screenshot({ path: 'test-results/panel-express.png', fullPage: true });
    await page.goto(`${origin}/productos`);
    await expect(page.getByRole('article').filter({ hasText: name })).toBeVisible();
  } finally {
    if (productId) await page.request.delete(`${origin}/api/products/${productId}`);
  }
});

async function signIn(page) {
  await page.goto('/panel-de-control');
  await page.getByLabel('Usuario', { exact: false }).fill('admin-test');
  await page.getByLabel('Clave de administrador').fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Nuevo producto' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar notificación' }).click();
}

test('no muestra gestion publica ni permite modificar productos sin sesion', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Gestión', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Nuevo producto' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Acceso administrador' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Panel de control' })).toHaveCount(0);
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const response = await request.fetch(method === 'POST' ? '/api/products' : '/api/products/1', {
      method,
    });
    expect(response.status()).toBe(401);
  }
  expect((await request.post('/api/uploads')).status()).toBe(401);
  await page.goto('/panel-de-control');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Ingresa el usuario');
  await page.getByRole('button', { name: 'Cerrar notificación' }).click();
  await page.getByLabel('Usuario', { exact: false }).fill('admin-test');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Ingresa la clave');
  await page.getByRole('button', { name: 'Cerrar notificación' }).click();
  await page.getByLabel('Clave de administrador').fill('incorrecta');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('usuario o la clave no son correctos');
  await expect(page.getByRole('button', { name: 'Nuevo producto' })).toHaveCount(0);
  await expect(page.getByLabel('Clave de administrador')).toHaveValue('');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('conserva sesion al recargar y bloquea nuevamente al cerrar sesion', async ({ page }) => {
  await signIn(page);
  await page.reload();
  await expect(page.getByRole('table')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL('/panel-de-control');
  await expect(page.getByLabel('Usuario', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuevo producto' })).toHaveCount(0);
  expect((await page.request.delete('/api/products/1')).status()).toBe(401);
  await page.goto('/gestion');
  await expect(page).toHaveURL('/panel-de-control');
});

test('retira controles si el servidor revoca la sesion', async ({ page }) => {
  await signIn(page);
  await page.request.post('/api/admin/logout');
  await page.getByRole('button', { name: 'Nuevo producto' }).click();
  await page.getByLabel('Nombre', { exact: false }).fill('No debe guardarse');
  await page.getByLabel('Categoría', { exact: false }).last().fill('Panadería');
  await page.getByLabel('Descripción', { exact: false }).fill('Sesión revocada');
  await page.getByLabel('Precio (ARS)', { exact: false }).fill('1500');
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page).toHaveURL('/panel-de-control');
  await expect(page.getByLabel('Usuario', { exact: false })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Inicia sesion');
  const { data } = await (await page.request.get('/api/products')).json();
  expect(data.some((product) => product.name === 'No debe guardarse')).toBe(false);
});

test('carga la carta real, busca sin acentos y muestra detalles', async ({ page, request }) => {
  const response = await request.get('/api/products');
  const { data } = await response.json();
  await page.goto('/productos');
  await expect(page.getByRole('article')).toHaveCount(data.length);
  const product = data.find((item) => item.category === 'Cafetería');
  await page.getByLabel('Buscar productos').fill('cafe');
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await page.getByRole('button', { name: `Ver detalle de ${product.name}` }).click();
  await expect(page.getByRole('dialog')).toContainText(product.description);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: `Ver detalle de ${product.name}` })).toBeFocused();
});

test('valida campos y muestra los errores de API dentro del diálogo', async ({ page, request }) => {
  const { data } = await (await request.get('/api/products')).json();
  await signIn(page);
  await page.getByRole('button', { name: 'Nuevo producto' }).click();
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByRole('alert')).toContainText('Revisa los campos');
  await expect(page.getByLabel('Nombre', { exact: false })).toBeFocused();
  await expect(page.getByLabel('Nombre', { exact: false })).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Cerrar notificación' }).click();
  await page.getByLabel('Nombre', { exact: false }).fill(data[0].name);
  await page.getByLabel('Categoría', { exact: false }).last().fill('Panadería');
  await page.getByLabel('Descripción', { exact: false }).fill('Prueba de validación');
  await page.getByLabel('Precio (ARS)', { exact: false }).fill('500');
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('alert')).not.toContainText('Revisa los campos');
  const alertVisible = await page.getByRole('alert').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const topmost = document.elementFromPoint(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
    );
    return element.contains(topmost);
  });
  expect(alertVisible).toBe(true);
});

test('crea, edita y elimina con confirmación y actualiza la carta', async ({ page, request }) => {
  let name = `Producto de prueba ${Date.now()}`;
  let productId;
  const uploadedPhotos = [];
  try {
    await signIn(page);
    await page.getByRole('button', { name: 'Nuevo producto' }).click();
    await page.getByLabel('Nombre', { exact: false }).fill(name);
    await page.getByLabel('Categoría', { exact: false }).last().fill('Panadería');
    await page
      .getByLabel('Descripción', { exact: false })
      .fill('Producto de prueba de integración.');
    await page.getByLabel('Precio (ARS)', { exact: false }).fill('1500');
    await page.getByLabel('Stock', { exact: false }).fill('25');
    await page.getByLabel('Foto del producto').setInputFiles(bakeryPhoto);
    await expect(page.getByAltText('Vista previa de la foto del producto')).toBeVisible();
    await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Producto creado correctamente.' }),
    ).toBeVisible();
    const created = (await (await request.get('/api/products')).json()).data.find(
      (product) => product.name === name,
    );
    productId = created.id;
    expect(created.price).toBe(1500);
    expect(created.stock).toBe(25);
    expect(created.imageUrl).toMatch(/^\/api\/uploads\/.+\.webp$/);
    uploadedPhotos.push(created.imageUrl);
    const imageResponse = await request.get(created.imageUrl);
    expect(imageResponse.headers()['content-type']).toBe('image/webp');
    await page.goto('/productos');
    const card = page.getByRole('article').filter({ hasText: name });
    await expect(card.locator('img')).toHaveAttribute('src', created.imageUrl);
    await expect
      .poll(() => card.locator('img').evaluate((image) => image.complete && image.naturalWidth > 0))
      .toBe(true);
    await page.goto('/panel-de-control');
    await page.getByRole('button', { name: `Editar ${name}`, exact: true }).click();
    await expect(page.getByLabel('Stock', { exact: false })).toHaveValue('25');
    await expect(page.getByAltText('Vista previa de la foto del producto')).toHaveAttribute(
      'src',
      created.imageUrl,
    );
    const editedName = `${name} editado`;
    await page.getByLabel('Nombre', { exact: false }).fill(editedName);
    await page.getByLabel('Categoría', { exact: false }).last().fill('Cafetería');
    await page
      .getByLabel('Descripción', { exact: false })
      .fill('Descripción editada desde el panel.');
    await page.getByLabel('Precio (ARS)', { exact: false }).fill('1900');
    await page.getByLabel('Stock', { exact: false }).fill('8');
    await page.getByLabel('Foto del producto').setInputFiles(coffeePhoto);
    await page.getByLabel('Disponible en la carta').uncheck();
    await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Producto actualizado correctamente.' }),
    ).toBeVisible();
    const updated = (await (await request.get(`/api/products/${productId}`)).json()).data;
    name = editedName;
    expect(updated.price).toBe(1900);
    expect(updated.stock).toBe(8);
    expect(updated.name).toBe(editedName);
    expect(updated.category).toBe('Cafetería');
    expect(updated.description).toBe('Descripción editada desde el panel.');
    expect(updated.imageUrl).not.toBe(created.imageUrl);
    uploadedPhotos.push(updated.imageUrl);
    expect(updated.available).toBe(false);
    await page.getByRole('button', { name: `Editar ${name}`, exact: true }).click();
    await page.getByLabel('Stock', { exact: false }).fill('0');
    await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const preserved = (await (await request.get(`/api/products/${productId}`)).json()).data;
    expect(preserved.stock).toBe(0);
    expect(preserved.imageUrl).toBe(updated.imageUrl);
    await page.getByRole('button', { name: `Eliminar ${name}`, exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText(name);
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible();
    await page.getByRole('button', { name: `Eliminar ${name}`, exact: true }).click();
    await page.getByRole('button', { name: 'Eliminar producto', exact: true }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Producto eliminado correctamente.' }),
    ).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
    expect((await request.get(`/api/products/${productId}`)).status()).toBe(404);
  } finally {
    if (productId) await page.request.delete(`/api/products/${productId}`);
    for (const imageUrl of uploadedPhotos)
      await unlink(
        fileURLToPath(
          new URL(`../../../backend/uploads/${imageUrl.split('/').pop()}`, import.meta.url),
        ),
      );
  }
});

test('rechaza stock invalido y archivos no imagen en el formulario', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Nuevo producto' }).click();
  await page.getByLabel('Nombre', { exact: false }).fill('Producto con errores');
  await page.getByLabel('Categoría', { exact: false }).last().fill('Panadería');
  await page.getByLabel('Descripción', { exact: false }).fill('Prueba de validación');
  await page.getByLabel('Precio (ARS)', { exact: false }).fill('1000');
  await page.getByLabel('Stock', { exact: false }).fill('-1');
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByLabel('Stock', { exact: false })).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Cerrar notificación' }).click();
  await page
    .getByLabel('Foto del producto')
    .setInputFiles({ name: 'texto.txt', mimeType: 'text/plain', buffer: Buffer.from('texto') });
  await expect(page.getByRole('alert')).toContainText('JPG, PNG o WebP');
});

test('muestra carga, error de conexión y permite reintentar', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/api/products', async (route) => {
    await gate;
    await route.abort('failed');
  });
  await page.goto('/productos');
  await expect(page.getByRole('status').filter({ hasText: 'Cargando productos' })).toBeVisible();
  release();
  await expect(page.getByRole('alert')).toContainText('conectar');
  await page.unroute('**/api/products');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('article').first()).toBeVisible();
});

for (const width of [1366, 390, 320]) {
  test(`pantallas en ${width}px sin desbordes, imágenes rotas ni errores de accesibilidad`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/nosotros', '/productos', '/panel-de-control']) {
      if (path === '/panel-de-control') {
        await page.goto(path);
        await expect(page.getByLabel('Usuario', { exact: false })).toBeVisible();
        const loginAccessibility = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(loginAccessibility.violations).toEqual([]);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.screenshot({ path: `test-results/${width}-login.png`, fullPage: true });
        await signIn(page);
      } else await page.goto(path);
      if (path === '/productos') await expect(page.getByRole('article').first()).toBeVisible();
      if (path === '/panel-de-control') await expect(page.getByRole('table')).toBeVisible();
      await page.locator('footer').scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          page
            .locator('img')
            .evaluateAll((images) =>
              images.every((image) => image.complete && image.naturalWidth > 0),
            ),
        )
        .toBe(true);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `test-results/${width}-${path === '/' ? 'inicio' : path.slice(1)}.png`,
        fullPage: true,
      });
    }
  });
}

test('navegación móvil y formulario accesible por teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Panel de control' })).toBeVisible();
  await page.getByRole('button', { name: 'Nuevo producto' }).click();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Nuevo producto' })).toBeFocused();
});

test('una respuesta incompleta usa el mismo sistema de errores y permite reintentar', async ({
  page,
}) => {
  await page.route('**/api/products', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    }),
  );
  await page.goto('/productos');
  await expect(page.getByRole('alert')).toContainText('respuesta no valida');
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.unroute('**/api/products');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('una carta vacia muestra su estado sin inventar productos locales', async ({ page }) => {
  await page.route('**/api/products', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    }),
  );
  await page.goto('/productos');
  await expect(page.getByRole('heading', { name: 'Todavía no hay productos' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
