// src/routes/dashboard/news/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { News } from '$lib/types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;

  const article = await flaskGet<News>(`/api/news/${params.id}`, token);

  return { article };
};
