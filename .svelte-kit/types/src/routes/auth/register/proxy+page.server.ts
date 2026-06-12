// @ts-nocheck
// src/routes/auth/register/+page.server.ts
import { auth }           from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';
import { prisma } from "$lib/server/prisma";

const FLASK = PUBLIC_API_URL;

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
  if (locals.session) throw redirect(302, '/dashboard');
  return {};
};

export const actions = {
  default: async ({ request }: import('./$types').RequestEvent) => {
    const formData   = await request.formData();
    const first_name = formData.get('first_name')?.toString().trim() ?? '';
    const last_name  = formData.get('last_name')?.toString().trim()  ?? '';
    const email      = formData.get('email')?.toString().trim()      ?? '';
    const contact    = formData.get('contact')?.toString().trim()    ?? '';
    const password   = formData.get('password')?.toString()          ?? '';
    const confirm    = formData.get('confirm')?.toString()            ?? '';

    const values = { first_name, last_name, email, contact };

    // ── Validation ─────────────────────────────────────────────────────────
    if (!first_name || !last_name || !email || !contact || !password) {
      return fail(400, { error: 'Tous les champs sont requis.', values });
    }
    if (password.length < 12) {
      return fail(400, {
        error: 'Le mot de passe doit contenir au moins 12 caractères.',
        values,
      });
    }
    if (password !== confirm) {
      return fail(400, {
        error: 'Les mots de passe ne correspondent pas.',
        values,
      });
    }

    // ── Étape 1 : vérifier les doublons Better Auth ────────────────────────
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { contact }] },
    });
    if (existing) {
      if (existing.email === email)
        return fail(409, { error: 'Cet email est déjà utilisé.', values });
      if (existing.contact === contact)
        return fail(409, { error: 'Ce contact est déjà utilisé.', values });
    }

    // ── Étape 2 : créer dans Flask ─────────────────────────────────────────
    let flaskAdherentId: number | null = null;
    try {
      const flaskRes  = await fetch(`${FLASK}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ first_name, last_name, email, contact, password }),
      });
      const flaskJson = await flaskRes.json();

      if (flaskJson.status !== 201) {
        return fail(400, {
          error: flaskJson.message ?? "Erreur lors de l'inscription.",
          values,
        });
      }

      flaskAdherentId = (flaskJson.data?.id as number) ?? null;
    } catch {
      return fail(500, {
        error: 'Impossible de joindre le serveur Flask.',
        values,
      });
    }

    // ── Étape 3 : créer dans Better Auth ──────────────────────────────────
    try {
      const baResult = await auth.api.signUpEmail({
        body: {
          email,
          name:              `${first_name} ${last_name}`,
          first_name,
          last_name,
          password,
          contact,
          flask_adherent_id:     flaskAdherentId,
          role:                  'pending',
          is_validated:          false,
          flask_access_token:    '',
          flask_refresh_token:   '',
          flask_access_expires:  '',
          flask_refresh_expires: '',
        },
      });

      // Supprime la session créée par Better Auth : l'utilisateur doit
      // attendre la validation admin avant de pouvoir se connecter.
      await prisma.session.deleteMany({ where: { userId: baResult.user.id } });
    } catch (e) {
      if (e instanceof Response) throw e;
      console.error('[Register] Better Auth signUpEmail failed:', e);

      // Rollback : supprimer le compte Flask pour éviter un état incohérent
      try {
        await fetch(`${FLASK}/api/auth/delete`, {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email }),
        });
      } catch {
        console.error('[Register] Rollback Flask échoué pour:', email);
      }

      return fail(500, {
        error: "Erreur lors de la création du compte. Veuillez réessayer.",
        values,
      });
    }

    return { success: true };
  },
};
;null as any as Actions;