// src/routes/dashboard/matchs/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { Match } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;

  const matchs = await flaskGet<Match[]>('/api/matchs/', token);

  return { matchs: matchs ?? [] };
};
