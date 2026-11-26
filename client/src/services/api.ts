// client/src/services/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('vh_token') : null;

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to Express backend at ' + API_BASE);
    }
    throw err;
  }
}