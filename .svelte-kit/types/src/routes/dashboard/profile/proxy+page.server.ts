// @ts-nocheck
// src/routes/dashboard/profile/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { Adherent } from '$lib/types';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;

  const profile = await flaskGet<Adherent>('/api/adherents/me', token);

  return { profile };
};
