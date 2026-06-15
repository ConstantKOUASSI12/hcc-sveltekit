import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from '$env/dynamic/private';

function createClient(): PrismaClient {
  const provider = env.DATABASE_PROVIDER ?? 'postgresql';
  const url      = env.DATABASE_URL ?? '';

  if (provider === 'sqlite') {
    const adapter = new PrismaBetterSqlite3({ url: url.replace(/^file:/, '') });
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

// Singleton : évite de créer plusieurs connexions lors des rechargements HMR en dev
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
