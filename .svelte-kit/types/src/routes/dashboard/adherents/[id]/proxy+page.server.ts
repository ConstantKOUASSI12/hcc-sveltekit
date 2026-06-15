// @ts-nocheck
// src/routes/dashboard/adherents/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { flaskGet } from '$lib/server/flask';
import type { Adherent } from '$lib/types';

export const load = async ({ locals, params }: Parameters<PageServerLoad>[0]) => {
  const user  = locals.user as Record<string, unknown> | null;
  const token = (user?.flask_access_token as string) ?? null;

  const adherent = await flaskGet<Adherent>(`/api/adherents/${params.id}`, token);

  return { adherent };
};
