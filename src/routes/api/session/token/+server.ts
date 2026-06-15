// src/routes/api/session/token/+server.ts
import { auth } from '$lib/server/auth';
import { json }  from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';

const FLASK = env.FLASK_API_URL ?? 'http://localhost:5000';
const BUFFER_MS   = 60_000; // 1 minute de marge avant expiration

export const GET: RequestHandler = async ({ request, url }) => {

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return json({ token: null, error: 'No session' }, { status: 401 });
  }

  const user          = session.user as Record<string, unknown>;
  const accessToken   = user.flask_access_token   as string | null;
  const refreshToken  = user.flask_refresh_token  as string | null;
  const accessExpires = user.flask_access_expires as string | null;
  const refreshExpires = user.flask_refresh_expires as string | null;
  const forceRefresh  = url.searchParams.get('force') === 'true';

  // Vérifier si le refresh token est expiré (aucune récupération possible)
  if (refreshExpires && Date.now() >= new Date(refreshExpires).getTime()) {
    console.warn('[session/token] Refresh token expiré → déconnexion nécessaire');
    return json({ token: null, error: 'Refresh token expired', logout: true }, { status: 401 });
  }

  const isExpired = !accessExpires
    || Date.now() >= new Date(accessExpires).getTime() - BUFFER_MS;

  if (!forceRefresh && !isExpired && accessToken) {
    return json({ token: accessToken });
  }

  // Access token expiré ou refresh forcé → appel Flask /api/auth/refresh
  if (!refreshToken) {
    return json({ token: null, error: 'No refresh token' }, { status: 401 });
  }

  try {
    const refreshRes  = await fetch(`${FLASK}/api/auth/refresh`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
    const refreshJson = await refreshRes.json();

    if (refreshJson.status !== 200 || !refreshJson.data?.access) {
      console.error('[session/token] Flask refresh échoué:', refreshJson.message);
      return json({ token: null, error: 'Refresh failed', logout: true }, { status: 401 });
    }

    const newAccess = refreshJson.data.access;

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        flask_access_token:   newAccess.token,
        flask_access_expires: newAccess.expires_at,
        updatedAt:            new Date(),
      },
    });

    return json({ token: newAccess.token, refreshed: true });

  } catch (e) {
    console.error('[session/token] Erreur refresh:', e);
    return json({ token: null, error: 'Server error' }, { status: 500 });
  }
};
