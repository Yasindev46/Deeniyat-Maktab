const apiUrl = process.env.REACT_APP_API_URL;
console.log('API URL:', apiUrl);
export async function request(path, options = {}) {
  console.log('API URL:', apiUrl);
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
