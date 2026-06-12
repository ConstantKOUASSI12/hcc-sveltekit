import { PUBLIC_API_URL } from '$env/static/public';
const BASE = PUBLIC_API_URL;

async function getFlaskToken(forceRefresh = false): Promise<string | null> {
  try {
    const url = forceRefresh ? '/api/session/token?force=true' : '/api/session/token';
    const res  = await fetch(url);
    const json = await res.json();

    if (json.logout) {
      console.warn('[API client] Tokens Flask expirés → déconnexion');
      const { signOut } = await import('$lib/auth-client');
      await signOut();
      window.location.href = '/auth/login';
      return null;
    }

    return json.token ?? null;

  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<import('$lib/types').ApiResponse<T>> {

  const token = await getFlaskToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });

  // 401 Flask → forcer un refresh et rejouer une fois
  if (res.status === 401 && retry) {
    const freshToken = await getFlaskToken(true);
    if (!freshToken) return res.json();

    const retryHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${freshToken}`,
      ...options.headers,
    };
    const retryRes = await fetch(`${BASE}${endpoint}`, { ...options, headers: retryHeaders });
    return retryRes.json();
  }

  return res.json();
}

export const api = {
  get:    <T>(url: string)                => request<T>(url),
  post:   <T>(url: string, body: unknown) => request<T>(url, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown) => request<T>(url, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  <T>(url: string, body: unknown) => request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string)               => request<T>(url, { method: 'DELETE' }),
};
