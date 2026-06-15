import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from '$env/dynamic/private';

function createAdapter() {
  const provider = env.DATABASE_PROVIDER ?? 'postgresql';
  const url = env.DATABASE_URL ?? '';

  if (provider === 'sqlite') {
    return new PrismaBetterSqlite3({ url: url.replace(/^file:/, '') });
  }
  return new PrismaPg({ connectionString: url });
}

export const prisma = new PrismaClient({ adapter: createAdapter() });
