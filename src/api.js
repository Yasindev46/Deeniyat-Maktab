const apiUrl= import.meta.env.VITE_API_URL || import.meta.env.VITE_API_PROXY_TARGET 
export async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}/api${path}`, options);
  const data = await response.json().catch(() => ({}));
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
