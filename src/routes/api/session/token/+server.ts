// src/routes/api/session/token/+server.ts
import { auth }   from '$lib/server/auth';
import { json }   from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { env }    from '$env/dynamic/private';

const FLASK     = env.FLASK_API_URL ?? 'http://localhost:5000';
const BUFFER_MS = 60_000;

export const GET: RequestHandler = async ({ request }) => {

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return json({ token: null, error: 'No session' }, { status: 401 });
  }

  // Lire depuis la DB (bypass cookie cache de Better Auth qui peut avoir un token expiré)
  const user = await prisma.user.findUnique({
    where:  { email: session.user.email },
    select: {
      flask_access_token:    true,
      flask_refresh_token:   true,
      flask_access_expires:  true,
      flask_refresh_expires: true,
    },
  });

  if (!user) {
    return json({ token: null, error: 'User not found' }, { status: 401 });
  }

  const { flask_access_token, flask_refresh_token, flask_access_expires, flask_refresh_expires } = user;

  // Refresh token expiré → déconnexion nécessaire
  if (flask_refresh_expires && Date.now() >= new Date(flask_refresh_expires).getTime()) {
    console.warn('[session/token] Refresh token expiré → déconnexion nécessaire');
    return json({ token: null, error: 'Refresh token expired', logout: true }, { status: 401 });
  }

  // Access token encore valide → on le retourne directement
  const isExpired = !flask_access_expires ||
    Date.now() >= new Date(flask_access_expires).getTime() - BUFFER_MS;

  if (!isExpired && flask_access_token) {
    return json({ token: flask_access_token });
  }

  // Access token expiré → appel Flask /api/auth/refresh
  if (!flask_refresh_token) {
    return json({ token: null, error: 'No refresh token' }, { status: 401 });
  }

  try {
    const refreshRes  = await fetch(`${FLASK}/api/auth/refresh`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${flask_refresh_token}`,
      },
    });
    const refreshJson = await refreshRes.json();

    if (refreshJson.status !== 200 || !refreshJson.data?.access) {
      console.error('[session/token] Flask refresh échoué:', refreshJson.message);
      return json({ token: null, error: 'Refresh failed', logout: true }, { status: 401 });
    }

    const newAccess = refreshJson.data.access;

    try {
      await prisma.user.update({
        where: { email: session.user.email },
        data:  {
          flask_access_token:   newAccess.token,
          flask_access_expires: newAccess.expires_at,
          updatedAt:            new Date(),
        },
      });
    } catch (dbErr) {
      console.warn('[session/token] Prisma update échoué, token retourné quand même:', dbErr);
    }

    return json({ token: newAccess.token, refreshed: true });

  } catch (e) {
    console.error('[session/token] Erreur refresh:', e);
    return json({ token: null, error: 'Server error' }, { status: 500 });
  }
};
