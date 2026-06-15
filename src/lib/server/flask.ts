// src/lib/server/flask.ts
import { PUBLIC_API_URL } from '$env/static/public';
import type { ApiResponse } from '$lib/types';

export async function flaskGet<T>(path: string, token: string | null): Promise<T | null> {
  if (!token) return null;
  try {
    const res = await fetch(`${PUBLIC_API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const json: ApiResponse<T> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
