// src/routes/dashboard/news/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { News } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;

  const articles = await flaskGet<News[]>('/api/news/', token);

  return { articles: articles ?? [] };
};
