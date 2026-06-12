
import { json  } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

const ALLOWED_ROLES = new Set(['coach', 'player', 'contributor']);

export const POST: RequestHandler = async ({ request, locals }) => {
  // Seul un admin authentifié peut synchroniser un utilisateur
  if (!locals.user || locals.user.role !== 'admin') {
    return json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await request.json();
  const { email, role, is_validated } = body;

  if (!email || typeof email !== 'string') {
    return json({ error: 'Email requis' }, { status: 400 });
  }
  if (!ALLOWED_ROLES.has(role)) {
    return json({ error: `Rôle invalide : ${role}` }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data:  { role, is_validated: Boolean(is_validated) },
    });

    return json({ success: true });
  } catch (e) {
    console.error('[sync-user] Error:', e);
    return json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
};
