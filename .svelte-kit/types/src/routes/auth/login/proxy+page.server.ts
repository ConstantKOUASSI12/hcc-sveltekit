// @ts-nocheck
// src/routes/auth/login/+page.server.ts
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
  default: async ({ request, cookies }: import('./$types').RequestEvent) => {
    const data     = await request.formData();
    const email    = data.get('email')?.toString().trim() ?? '';
    const password = data.get('password')?.toString()     ?? '';

    if (!email || !password) {
      return fail(400, { error: 'Email et mot de passe requis.', email });
    }

    // ── Étape 1 : Flask (source de vérité) ───────────────────────────────
    const { adherent, tokens, error: flaskError } =
      await loginWithFlask(email, password);

    if (!flaskError && adherent && tokens) {
      if (adherent.is_validated === false || adherent.role === 'pending') {
        return fail(403, {
          email,
          error: 'Votre compte est en attente de validation',
        });
      }

      const result = await upsertBetterAuthUser({ email, password, adherent, tokens, cookies });

      if (!result.ok) {
        return fail(500, { error: result.error ?? 'Erreur lors de la création de la session.', email });
      }

      return { success: true };
    }

    // Étape 2 : Better Auth seul (utilisateurs uniquement SvelteKit)
    try {
      const signInRequest = new Request(
        'http://localhost/api/auth/sign-in/email',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        }
      );

      const baResponse = await auth.handler(signInRequest);
      const baJson     = await baResponse.clone().json();

      if (baResponse.ok && baJson?.user) {
        if (baJson.user.is_validated === false || baJson.user.role === 'pending') {
          return fail(403, {
            email,
            error: 'Votre compte est en attente de validation',
          });
        }
        setCookiesFromResponse(baResponse, cookies);
        return { success: true };
      }
    } catch (e) {
      console.error('[Login] Better Auth signIn error:', e);
    }

    return fail(401, { error: 'Identifiants incorrects ou utilisateur non inscrit.', email });
  },
};


async function upsertBetterAuthUser({
  email,
  password,
  adherent,
  tokens,
  cookies,
}: {
  email:    string;
  password: string;
  adherent: any;
  tokens:   { access: any; refresh: any };
  cookies:  import('@sveltejs/kit').Cookies;
}): Promise<{ ok: boolean; error?: string }> {
  const flaskTokenData = {
    flask_access_token:    tokens.access.token,
    flask_refresh_token:   tokens.refresh.token,
    flask_access_expires:  tokens.access.expires_at,
    flask_refresh_expires: tokens.refresh.expires_at,
  };

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    // Mettre à jour les tokens Flask AVANT sign-in : le cookie cache Better Auth
    // est peuplé au moment du sign-in — il faut que le DB soit à jour en premier.
    await prisma.user.update({
      where: { email },
      data: {
        ...flaskTokenData,
        first_name:   adherent.first_name,
        last_name:    adherent.last_name,
        is_validated: adherent.is_validated ?? false,
        role:         adherent.role ?? 'pending',
      },
    });

    const signInRequest = new Request(
      'http://localhost/api/auth/sign-in/email',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      }
    );

    const signInResponse = await auth.handler(signInRequest);
    if (signInResponse.ok) {
      setCookiesFromResponse(signInResponse, cookies);
      return { ok: true };
    }

    return { ok: false, error: 'Erreur lors de la connexion.' };
  }

  // Première connexion via Flask : créer l'utilisateur dans Better Auth
  // Les tokens sont passés dans le body → le cookie cache est correct dès la création.
  const signUpRequest = new Request(
    'http://localhost/api/auth/sign-up/email',
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        email,
        password,
        name:              `${adherent.first_name} ${adherent.last_name}`,
        first_name:        adherent.first_name,
        last_name:         adherent.last_name,
        contact:           adherent.contact ?? null,
        flask_adherent_id: adherent.id,
        is_validated:      adherent.is_validated ?? false,
        role:              adherent.role ?? 'pending',
        ...flaskTokenData,
      }),
    }
  );

  const signUpResponse = await auth.handler(signUpRequest);
  const signUpJson     = await signUpResponse.clone().json();

  if (!signUpResponse.ok) {
    console.error('[Login] signUp failed:', signUpJson);
    return { ok: false, error: 'Erreur lors de la création de la session.' };
  }

  setCookiesFromResponse(signUpResponse, cookies);
  return { ok: true };
}


function setCookiesFromResponse(
  response: Response,
  cookies:  import('@sveltejs/kit').Cookies
) {
  const setCookieHeaders = response.headers.getSetCookie?.()
    ?? response.headers.get('set-cookie')?.split(/,(?=[^;]+=[^;]+;)/)
    ?? [];

  for (const cookieStr of setCookieHeaders) {
    const parts                  = cookieStr.split(';').map(p => p.trim());
    const [nameValue, ...directives] = parts;

    const eqIdx = nameValue.indexOf('=');
    const name  = nameValue.slice(0, eqIdx).trim();
    const value = nameValue.slice(eqIdx + 1).trim();

    const opts: Record<string, string | boolean | number> = {};
    for (const d of directives) {
      const [k, v] = d.split('=');
      const key    = k.trim().toLowerCase();
      if (key === 'max-age')  opts.maxAge   = parseInt(v ?? '0');
      if (key === 'path')     opts.path     = v?.trim() ?? '/';
      if (key === 'samesite') opts.sameSite = v?.trim().toLowerCase() ?? 'lax';
      if (key === 'httponly') opts.httpOnly = true;
      if (key === 'secure')   opts.secure   = true;
    }

    cookies.set(name, value, {
      path:     (opts.path     as string)                     ?? '/',
      httpOnly: (opts.httpOnly as boolean)                    ?? true,
      sameSite: (opts.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
      secure:   (opts.secure   as boolean)                    ?? false,
      maxAge:   (opts.maxAge   as number)                     ?? 60 * 60 * 2,
      encode:   (v) => v,
    });
  }
}


async function loginWithFlask(email: string, password: string) {
  try {
    const res  = await fetch(`${FLASK}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const json = await res.json();

    if (json.status !== 200 || !json.data?.tokens) {
      return { error: json.message ?? 'Identifiants incorrects.' };
    }

    const { access, refresh } = json.data.tokens;

    const meRes  = await fetch(`${FLASK}/api/adherents/me`, {
      headers: { Authorization: `Bearer ${access.token}` },
    });
    const meJson = await meRes.json();

    if (meJson.status !== 200 || !meJson.data) {
      return { error: 'Impossible de récupérer le profil.' };
    }

    return { adherent: meJson.data, tokens: { access, refresh } };
  } catch {
    return { error: 'Erreur de connexion au serveur Flask.' };
  }
}
;null as any as Actions;