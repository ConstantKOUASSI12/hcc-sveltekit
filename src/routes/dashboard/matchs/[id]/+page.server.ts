// src/routes/dashboard/matchs/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { Match } from '$lib/types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;

  const match = await flaskGet<Match>(`/api/matchs/${params.id}`, token);

  return { match };
};
