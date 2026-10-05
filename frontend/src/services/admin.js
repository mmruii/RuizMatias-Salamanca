import { request } from './api.js';

export function getAdminSession(signal) {
  return request('/admin/session', { signal });
}

export function loginAdmin(username, password) {
  return request('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function logoutAdmin() {
  return request('/admin/logout', { method: 'POST' });
}
