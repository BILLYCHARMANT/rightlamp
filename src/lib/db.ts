import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

function createPrismaClient() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to `.env.local` (see `.env.example`).",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });
  (client as PrismaClient & { __rightlampSchemaKey?: string }).__rightlampSchemaKey =
    PRISMA_SCHEMA_KEY;
  return client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  /** Bust dev cache when schema adds models or columns. */
  prismaSchemaKey?: string;
};

/** Bump when Prisma schema changes so dev hot-reload gets a fresh client. */
const PRISMA_SCHEMA_KEY = "2026-06-22-staff-roles";

function isStalePrismaClient(client: PrismaClient): boolean {
  const orderDelegate = (client as PrismaClient & { order?: { findMany?: unknown } })
    .order;
  if (typeof orderDelegate?.findMany !== "function") return true;

  const accessoryDelegate = (
    client as PrismaClient & { productAccessory?: { findMany?: unknown } }
  ).productAccessory;
  if (typeof accessoryDelegate?.findMany !== "function") return true;

  const categoryDelegate = (
    client as PrismaClient & { productCategory?: { findMany?: unknown } }
  ).productCategory;
  if (typeof categoryDelegate?.findMany !== "function") return true;

  const branchDelegate = (
    client as PrismaClient & { branch?: { findMany?: unknown } }
  ).branch;
  if (typeof branchDelegate?.findMany !== "function") return true;

  const marker = (client as PrismaClient & { __rightlampSchemaKey?: string })
    .__rightlampSchemaKey;
  return marker !== PRISMA_SCHEMA_KEY;
}

// Drop cached client when hot-reload picks up a new schema key or delegates.
if (process.env.NODE_ENV !== "production") {
  const cached = globalForPrisma.prisma;
  if (cached && isStalePrismaClient(cached)) {
    globalForPrisma.prisma = undefined;
    globalForPrisma.prismaSchemaKey = undefined;
  }
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const cacheKey = globalForPrisma.prismaSchemaKey;
  if (
    cached &&
    cacheKey === PRISMA_SCHEMA_KEY &&
    !isStalePrismaClient(cached)
  ) {
    return cached;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaSchemaKey = PRISMA_SCHEMA_KEY;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
