// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { Match, News, Adherent } from '$lib/types';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;
  const role  = user?.role as string | null;

  setHeaders({ 'cache-control': 'private, max-age=60' });

  const isAdminOrCoach = role === 'admin' || role === 'coach';

  const [matchs, news, adherents] = await Promise.all([
    flaskGet<Match[]>('/api/matchs/', token),
    flaskGet<News[]>('/api/news/', token),
    isAdminOrCoach ? flaskGet<Adherent[]>('/api/adherents/', token) : Promise.resolve(null),
  ]);

  return {
    matchs:    matchs    ?? [],
    news:      news      ?? [],
    adherents: adherents ?? [],
  };
};
