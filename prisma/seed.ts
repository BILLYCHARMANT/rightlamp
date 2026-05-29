/**
 * Creates / updates the default dashboard admin (credentials login).
 * Requires DATABASE_URL.
 *
 * Optional env (defaults shown — override in `.env.local` for production):
 *   SEED_ADMIN_EMAIL   (default admin@rightlamps.rw)
 *   SEED_ADMIN_PASSWORD (default dev password below — change immediately in prod)
 *
 * Run: npm run db:seed
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local", override: true });
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required for seeding.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/** Default credentials when env vars are omitted — rotate via SEED_* or upsert re-run. */
const email =
  process.env.SEED_ADMIN_EMAIL?.trim() ?? "admin@rightlamps.rw";
const plainPassword =
  process.env.SEED_ADMIN_PASSWORD?.trim() ?? "RightlampsAdmin2026!";

async function main() {
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Administrator",
      passwordHash,
      role: "ADMIN",
    },
    update: {
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Seed OK — admin user: ${email}`);
  console.log("Sign in at /login with the password you set (see SEED_ADMIN_PASSWORD or default in prisma/seed.ts).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
