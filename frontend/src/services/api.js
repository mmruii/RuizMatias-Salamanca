const API_URL = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '');

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
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

  if (response.ok && result?.success === true && !Object.hasOwn(result, 'data')) {
    throw new Error('El servidor envio una respuesta no valida.');
  }

  if (!response.ok || result?.success !== true) {
    const error = new Error(result?.message || 'No se pudo completar la operacion.');
    error.status = response.status;
    throw error;
  }
  return result.data;
}
