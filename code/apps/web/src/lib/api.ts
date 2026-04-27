const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.message ? (Array.isArray(body.message) ? body.message[0] : body.message) : `API error: ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

export async function postApi<T>(path: string, body: unknown): Promise<T> {
  return fetchApi<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export { fetchApi };
