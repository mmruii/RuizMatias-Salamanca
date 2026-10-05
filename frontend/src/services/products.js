import { request } from './api.js';

export function requestProducts(path = '', options = {}) {
  return request(`/products${path}`, options);
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

export function uploadProductPhoto(photo) {
  const form = new FormData();
  form.append('photo', photo);
  return request('/uploads', { method: 'POST', body: form });
}
