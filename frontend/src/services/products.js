const API_URL = `${(import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '')}/products`;

export async function requestProducts(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No pudimos conectar con el servidor. Intenta nuevamente.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('El servidor envio una respuesta no valida.');
  }

  if (!response.ok || result.success !== true) {
    throw new Error(
      result.message || result.error?.message || 'No se pudo completar la operacion.',
    );
  }
  return result.data;
}

export function getProducts(signal) {
  return requestProducts('', { signal });
}

export function getProduct(id, signal) {
  return requestProducts(`/${encodeURIComponent(id)}`, { signal });
}

export function createProduct(product) {
  return requestProducts('', { method: 'POST', body: JSON.stringify(product) });
}

export function updateProduct(id, product) {
  return requestProducts(`/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id) {
  return requestProducts(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
