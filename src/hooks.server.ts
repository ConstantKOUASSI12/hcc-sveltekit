// src/hooks.server.ts
import { auth }     from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { prisma }   from '$lib/server/prisma';
import { env }      from '$env/dynamic/private';

const FLASK_URL = env.FLASK_API_URL ?? 'http://localhost:5000';
const BUFFER_MS = 60_000; // rafraîchir 1min avant expiration

/**
 * Lit le token Flask directement depuis la DB (bypass cookie cache de Better Auth),
 * rafraîchit l'access token si expiré, met à jour Prisma, retourne le token valide.
 */
async function ensureFreshFlaskToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where:  { email },
    select: {
      flask_access_token:    true,
      flask_refresh_token:   true,
      flask_access_expires:  true,
      flask_refresh_expires: true,
    },
  });

  if (!user?.flask_access_token) return null;

  const { flask_access_token, flask_refresh_token, flask_access_expires, flask_refresh_expires } = user;

  // Refresh token expiré → impossible de récupérer
  if (!flask_refresh_token) return flask_access_token;
  if (flask_refresh_expires && Date.now() >= new Date(flask_refresh_expires).getTime()) {
    return null;
  }

  // Access token encore valide → rien à faire
  const isExpired = !flask_access_expires ||
    Date.now() >= new Date(flask_access_expires).getTime() - BUFFER_MS;
  if (!isExpired) return flask_access_token;

  // Access token expiré → appel Flask /api/auth/refresh
  try {
    const res  = await fetch(`${FLASK_URL}/api/auth/refresh`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${flask_refresh_token}`,
      },
    });
    const json = await res.json();

    if (json.status !== 200 || !json.data?.access) {
      console.error('[hooks] Flask refresh échoué:', json.message);
      return null;
    }

    const newAccess = json.data.access;

    // Persister le nouveau token (best-effort : on retourne le token même si l'update échoue)
    try {
      await prisma.user.update({
        where: { email },
        data:  {
          flask_access_token:   newAccess.token,
          flask_access_expires: newAccess.expires_at,
          updatedAt:            new Date(),
        },
      });
    } catch (dbErr) {
      console.warn('[hooks] Prisma update échoué, token retourné quand même:', dbErr);
    }

    return newAccess.token;
  } catch (e) {
    console.error('[hooks] Erreur refresh Flask:', e);
    return null;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  if (path.startsWith('/api/auth')) return resolve(event);

  const session = await auth.api.getSession({ headers: event.request.headers });

  event.locals.session = session;
  event.locals.user    = session?.user ?? null;

  // Bypass cookie cache : s'assurer que le token Flask est valide pour toutes
  // les requêtes dashboard (les +page.server.ts utilisent locals.user.flask_access_token)
  if (session?.user && path.startsWith('/dashboard')) {
    const freshToken = await ensureFreshFlaskToken(session.user.email);
    if (event.locals.user) {
      (event.locals.user as Record<string, unknown>).flask_access_token = freshToken;
    }
  }

  if (path.startsWith('/dashboard') && session?.user) {
    if (session.user.role === 'pending' || session.user.is_validated === false) {
      throw redirect(302, '/auth/login');
    }
  }

  if (path.startsWith('/dashboard') && !session) {
    throw redirect(302, '/auth/login');
  }

  if ((path === '/auth/login' || path === '/auth/register') && session) {
    throw redirect(302, '/dashboard');
  }

  return resolve(event);
};
