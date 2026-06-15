#!/usr/bin/env node
// Patche schema.prisma avec le bon provider selon DATABASE_PROVIDER dans .env,
// puis génère le client Prisma.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

let provider = process.env.DATABASE_PROVIDER;

if (!provider && existsSync('.env')) {
  const match = readFileSync('.env', 'utf-8').match(/^DATABASE_PROVIDER=(.+)$/m);
  provider = match?.[1]?.trim();
}

provider ??= 'postgresql';

const schemaPath = 'prisma/schema.prisma';
const schema = readFileSync(schemaPath, 'utf-8').replace(
  /^(\s*provider\s*=\s*)"(postgresql|sqlite)"(\s*)$/m,
  `$1"${provider}"$3`
);
writeFileSync(schemaPath, schema);

console.log(`[prisma-setup] provider=${provider}`);
execSync('npx prisma generate', { stdio: 'inherit' });
