// src/hooks.server.ts
import { auth }     from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  if (path.startsWith('/api/auth')) return resolve(event);

  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  event.locals.session = session;
  event.locals.user    = session?.user ?? null;
  
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