// @ts-nocheck
// src/routes/dashboard/pending/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = ({ locals }: Parameters<PageServerLoad>[0]) => {
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/dashboard');
  }
  return {};
};
