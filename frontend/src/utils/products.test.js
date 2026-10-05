import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePhoto, validateProduct, productPayload, filterProducts } from './products.js';

const values = {
  name: ' Cafe ',
  description: ' De especialidad ',
  category: ' Cafeteria ',
  price: '2200.50',
  stock: '5',
  imageUrl: '',
  available: false,
};

test('valida campos requeridos, precio y URL de imagen', () => {
  assert.deepEqual(validateProduct(values), {});
  const errors = validateProduct({
    ...values,
    name: ' ',
    price: '-1',
    imageUrl: 'javascript:alert(1)',
  });
  assert.deepEqual(Object.keys(errors), ['name', 'price', 'imageUrl']);
  assert.ok(validateProduct({ ...values, price: 'NaN' }).price);
  assert.ok(validateProduct({ ...values, price: '' }).price);
  assert.ok(validateProduct({ ...values, description: '', category: '' }).description);
});

test('envia precio numerico, disponibilidad booleana y textos normalizados', () => {
  assert.deepEqual(productPayload(values), {
    name: 'Cafe',
    description: 'De especialidad',
    category: 'Cafeteria',
    price: 2200.5,
    stock: 5,
    imageUrl: '',
    available: false,
  });
});

test('valida stock entero, fotos y rutas de fotos subidas', () => {
  for (const stock of [-1, 0.5, '', 'no']) assert.ok(validateProduct({ ...values, stock }).stock);
  assert.deepEqual(
    validateProduct({ ...values, stock: 0, imageUrl: '/api/uploads/abcd-1234.webp' }),
    {},
  );
  assert.equal(validatePhoto({ type: 'image/png', size: 1000 }), '');
  assert.ok(validatePhoto({ type: 'text/plain', size: 1000 }));
  assert.ok(validatePhoto({ type: 'image/jpeg', size: 6 * 1024 * 1024 }));
});

test('busca sin distinguir acentos y combina categoria con texto', () => {
  const products = [
    { name: 'Café espresso', description: 'Intenso', category: 'Cafetería' },
    { name: 'Croissant', description: 'Manteca', category: 'Panadería' },
  ];
  assert.equal(filterProducts(products, ' CAFE ').length, 1);
  assert.equal(filterProducts(products, 'cafe', 'Panadería').length, 0);
  assert.equal(filterProducts(products, '', 'Panadería')[0].name, 'Croissant');
});
