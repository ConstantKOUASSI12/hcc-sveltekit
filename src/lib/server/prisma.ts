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

const g = globalThis as unknown as { prisma?: PrismaClient };
if (!g.prisma) g.prisma = createClient();

async function reconnect(): Promise<void> {
  console.warn('[prisma] SQLITE_READONLY_DBMOVED — reconnexion automatique');
  await g.prisma?.$disconnect().catch(() => {});
  g.prisma = createClient();
}

// Proxy auto-reconnect : intercepte SQLITE_READONLY_DBMOVED sur les delegates (prisma.user, etc.)
// et les méthodes top-level ($transaction…) sans invalider les imports existants.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    if (typeof prop === 'symbol') return (g.prisma as any)[prop];

    const propKey = prop as string;
    const raw = (g.prisma as any)[propKey];

    // Model delegates : prisma.user, prisma.session, etc.
    if (raw && typeof raw === 'object') {
      return new Proxy(raw as object, {
        get(_, method: string | symbol) {
          const fn = (raw as any)[method as string];
          if (typeof fn !== 'function') return fn;
          return async (...args: unknown[]) => {
            try {
              return await fn.apply(raw, args);
            } catch (e: any) {
              if (e?.code !== 'SQLITE_READONLY_DBMOVED') throw e;
              await reconnect();
              const fresh = (g.prisma as any)[propKey];
              return await (fresh[method as string] as Function).apply(fresh, args);
            }
          };
        },
      });
    }

    // Méthodes top-level : $transaction, $connect, $disconnect, etc.
    if (typeof raw === 'function') {
      return async (...args: unknown[]) => {
        try {
          return await (raw as Function).apply(g.prisma, args);
        } catch (e: any) {
          if (e?.code !== 'SQLITE_READONLY_DBMOVED') throw e;
          await reconnect();
          return await ((g.prisma as any)[propKey] as Function).apply(g.prisma, args);
        }
      };
    }

    return raw;
  },
});
