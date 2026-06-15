#!/usr/bin/env node
/**
 * Seed des comptes Better Auth dans Neon (PostgreSQL).
 * Données synchronisées avec la base Flask.
 *
 * Usage :
 *   DATABASE_URL="postgresql://..." node scripts/seed-neon.mjs
 *
 * Les mots de passe sont hachés avec le même algo que better-auth :
 *   scrypt(N=16384, r=16, p=1, dkLen=64)  format  salt_hex:hash_hex
 */

import pg from 'pg';
const { Client } = pg;

import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { readFileSync, existsSync } from 'node:fs';

const scryptAsync = promisify(scrypt);

// ── Charger DATABASE_URL depuis .env si absent de l'environnement ──────────
function loadDotEnv() {
  if (!existsSync('.env')) return;
  const lines = readFileSync('.env', 'utf-8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadDotEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !DATABASE_URL.startsWith('postgresql')) {
  console.error('❌  DATABASE_URL manquant ou non PostgreSQL.');
  console.error('    Exportez-le ou décommentez-le dans .env :');
  console.error('    DATABASE_URL=postgresql://neondb_owner:...@.../neondb?sslmode=require');
  process.exit(1);
}

// ── Algo scrypt identique à better-auth ───────────────────────────────────
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key  = await scryptAsync(password, salt, 64, { N: 16384, r: 16, p: 1, maxmem: 256 * 1024 * 1024 });
  return `${salt}:${key.toString('hex')}`;
}

// ── Mapping role_id Flask → rôle Better Auth ──────────────────────────────
const ROLE_MAP = { 2: 'coach', 3: 'contributor', 4: 'player', 5: 'pending' };

// ── Utilisateurs issus de la base Flask ───────────────────────────────────
// Colonnes : firstName lastName email contact password roleId validated
const USERS = [
  { firstName: 'Yao Jean Constant', lastName: 'Kouassi', email: 'jean13@live.fr',        contact: '0611274424', password: '1234567890', roleId: 3, validated: true  },
  { firstName: 'Yao Jean Constant', lastName: 'Kouassi', email: 'jean13@liveee.fr',      contact: '0611274420', password: '1234567890', roleId: 2, validated: true  },
  { firstName: 'Yao Jean Constant', lastName: 'Kouassi', email: 'jean13@livee.fr',       contact: '0611274425', password: '1234567890', roleId: 4, validated: true  },
  { firstName: 'Thomas',            lastName: 'Dubois',  email: 'thomas.dubois@hcc.fr',  contact: '0612345678', password: '1234567890', roleId: 2, validated: true  },
  { firstName: 'Lucas',             lastName: 'Martin',  email: 'lucas.martin@hcc.fr',   contact: '0623456789', password: '1234567890', roleId: 4, validated: true  },
  { firstName: 'Emma',              lastName: 'Bernard', email: 'emma.bernard@hcc.fr',   contact: '0634567890', password: '1234567890', roleId: 5, validated: false },
  { firstName: 'Jules',             lastName: 'Petit',   email: 'jules.petit@hcc.fr',    contact: '0645678901', password: '1234567890', roleId: 5, validated: false },
  { firstName: 'Léa',               lastName: 'Robert',  email: 'lea.robert@hcc.fr',     contact: '0656789012', password: '1234567890', roleId: 5, validated: false },
  { firstName: 'Nathan',            lastName: 'Moreau',  email: 'nathan.moreau@hcc.fr',  contact: '0667890123', password: '1234567890', roleId: 5, validated: false },
];

// ── Seed ──────────────────────────────────────────────────────────────────
async function main() {
  const db = new Client({ connectionString: DATABASE_URL });
  await db.connect();
  console.log('✅  Connecté à Neon.\n');

  for (const u of USERS) {
    const role = ROLE_MAP[u.roleId] ?? 'pending';
    const now  = new Date().toISOString();
    const name = `${u.firstName} ${u.lastName}`;

    // UPSERT user — met à jour les métadonnées si l'email existe déjà
    const { rows } = await db.query(`
      INSERT INTO "user"
        (id, email, first_name, last_name, name, role, is_validated, contact, "emailVerified", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, $10)
      ON CONFLICT (email) DO UPDATE SET
        first_name   = EXCLUDED.first_name,
        last_name    = EXCLUDED.last_name,
        name         = EXCLUDED.name,
        role         = EXCLUDED.role,
        is_validated = EXCLUDED.is_validated,
        contact      = EXCLUDED.contact,
        "updatedAt"  = EXCLUDED."updatedAt"
      RETURNING id, (xmax = 0) AS inserted
    `, [crypto.randomUUID(), u.email, u.firstName, u.lastName, name, role, u.validated, u.contact, now, now]);

    const { id: userId, inserted } = rows[0];
    const action = inserted ? 'créé   ' : 'mis à jour';

    // Insérer le compte credential uniquement s'il n'existe pas encore
    const { rows: acc } = await db.query(
      `SELECT id FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential'`,
      [userId]
    );

    if (acc.length === 0) {
      const hash = await hashPassword(u.password);
      await db.query(`
        INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        VALUES ($1, $2, 'credential', $3, $4, $5, $6)
      `, [crypto.randomUUID(), userId, userId, hash, now, now]);
    }

    const passwordNote = acc.length === 0 ? `  mot de passe: ${u.password}` : '  (mot de passe inchangé)';
    console.log(`${action === 'créé   ' ? '✅' : '🔄'}  [${action}] ${u.email.padEnd(30)} rôle=${role.padEnd(12)} validé=${String(u.validated).padEnd(6)}${passwordNote}`);
  }

  await db.end();
  console.log('\nTerminé.');
}

main().catch(e => { console.error(e); process.exit(1); });
