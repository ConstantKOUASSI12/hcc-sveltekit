// @ts-nocheck
// src/routes/dashboard/news/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { News } from '$lib/types';

export const load = ({ locals, setHeaders }: Parameters<PageServerLoad>[0]) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;

  setHeaders({ 'cache-control': 'private, max-age=60' });

  return {
    articles: flaskGet<News[]>('/api/news/', token),
  };
};
