// @ts-nocheck
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { Match, News, Adherent } from '$lib/types';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;
  const role  = user?.role as string | null;

  const [matchs, news] = await Promise.all([
    flaskGet<Match[]>('/api/matchs/', token),
    flaskGet<News[]>('/api/news/', token),
  ]);

  let adherents: Adherent[] = [];
  if (role === 'admin' || role === 'coach') {
    adherents = (await flaskGet<Adherent[]>('/api/adherents/', token)) ?? [];
  }

  return {
    matchs:    matchs    ?? [],
    news:      news      ?? [],
    adherents,
  };
};
