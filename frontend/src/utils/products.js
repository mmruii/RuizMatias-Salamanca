export function normalizeText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

export function filterProducts(products, search = '', category = '') {
  const query = normalizeText(search);
  return products.filter(
    (product) =>
      (!category || product.category === category) &&
      normalizeText(`${product.name} ${product.description} ${product.category}`).includes(query),
  );
}

export function validateProduct(values) {
  const errors = {};
  for (const field of ['name', 'description', 'category']) {
    if (!values[field]?.trim()) errors[field] = 'Completa este campo.';
  }
  if (!Number.isFinite(Number(values.price)) || Number(values.price) <= 0) {
    errors.price = 'Ingresa un precio mayor que cero.';
  }
  if (values.imageUrl?.trim()) {
    try {
      const url = new URL(values.imageUrl.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      errors.imageUrl = 'Ingresa una URL de imagen con http o https.';
    }
  }
  return errors;
}

export function productPayload(values) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category: values.category.trim(),
    price: Number(values.price),
    imageUrl: values.imageUrl.trim(),
    available: values.available,
  };
}

export const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(value);
