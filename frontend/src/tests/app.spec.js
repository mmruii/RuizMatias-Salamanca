import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  await page.goto('/gestion');
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
  const name = `Producto de prueba ${Date.now()}`;
  let productId;
  try {
    await page.goto('/gestion');
    await page.getByRole('button', { name: 'Nuevo producto' }).click();
    await page.getByLabel('Nombre', { exact: false }).fill(name);
    await page.getByLabel('Categoría', { exact: false }).last().fill('Panadería');
    await page
      .getByLabel('Descripción', { exact: false })
      .fill('Producto de prueba de integración.');
    await page.getByLabel('Precio (ARS)', { exact: false }).fill('1500');
    await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Producto creado correctamente.' }),
    ).toBeVisible();
    const created = (await (await request.get('/api/products')).json()).data.find(
      (product) => product.name === name,
    );
    productId = created.id;
    expect(created.price).toBe(1500);
    await page.getByRole('button', { name: `Editar ${name}`, exact: true }).click();
    await page.getByLabel('Precio (ARS)', { exact: false }).fill('1900');
    await page.getByLabel('Disponible en la carta').uncheck();
    await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Producto actualizado correctamente.' }),
    ).toBeVisible();
    const updated = (await (await request.get(`/api/products/${productId}`)).json()).data;
    expect(updated.price).toBe(1900);
    expect(updated.available).toBe(false);
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
    if (productId) await request.delete(`/api/products/${productId}`);
  }
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
    for (const path of ['/', '/nosotros', '/productos', '/gestion']) {
      await page.goto(path);
      if (path === '/productos') await expect(page.getByRole('article').first()).toBeVisible();
      if (path === '/gestion') await expect(page.getByRole('table')).toBeVisible();
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
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Gestión', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Gestión de productos' })).toBeVisible();
  await page.getByRole('button', { name: 'Nuevo producto' }).click();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Nuevo producto' })).toBeFocused();
});
