import { getSessionToken } from './session';

const apiUrl = import.meta.env.DEV
  ? (import.meta.env.VITE_API_PROXY_TARGET || '')
  : (import.meta.env.VITE_API_URL || '');

export async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = getSessionToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiUrl}/api${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 && token) window.dispatchEvent(new Event('auth-expired'));
  if (!response.ok) throw new Error(data.error || `Please try again later.`);
  return data;
}

export function postJson(path, body, method = 'POST') {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
