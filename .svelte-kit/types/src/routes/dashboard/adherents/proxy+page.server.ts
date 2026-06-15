// @ts-nocheck
// src/routes/dashboard/adherents/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { Adherent } from '$lib/types';

export const load = ({ locals, setHeaders }: Parameters<PageServerLoad>[0]) => {
  const user = locals.user as Record<string, unknown> | null;
  const role = user?.role as string | null;

  if (role !== 'admin' && role !== 'coach') throw redirect(302, '/dashboard');

  const token = (user?.flask_access_token as string) ?? null;

  setHeaders({ 'cache-control': 'private, max-age=60' });

  return {
    adherents: flaskGet<Adherent[]>('/api/adherents/', token),
  };
};
