/**
 * Creates / updates the default dashboard admin (credentials login).
 * Requires DATABASE_URL.
 *
 * Optional env (defaults shown — override in `.env.local` for production):
 *   SEED_ADMIN_EMAIL   (default admin@pv-grid.rw)
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
  process.env.SEED_ADMIN_EMAIL?.trim() ?? "admin@pv-grid.rw";
const plainPassword =
  process.env.SEED_ADMIN_PASSWORD?.trim() ?? "PV-GRIDAdmin2026!";

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

  const expenseCount = await prisma.expense.count();
  if (expenseCount === 0) {
    const now = new Date();
    await prisma.expense.createMany({
      data: [
        {
          title: "Warehouse rent — Kigali",
          vendor: "City Properties Ltd",
          amountCents: 85000000,
          currency: "RWF",
          category: "Rent",
          paidAt: new Date(now.getFullYear(), now.getMonth(), 1),
          note: "Monthly facility lease",
          createdByEmail: email,
        },
        {
          title: "LED supplier shipment",
          vendor: "BrightSource Trading",
          amountCents: 124500000,
          currency: "RWF",
          category: "Inventory",
          paidAt: new Date(now.getFullYear(), now.getMonth(), 5),
          createdByEmail: email,
        },
        {
          title: "Fuel — delivery runs",
          vendor: "Total Energies",
          amountCents: 3200000,
          currency: "RWF",
          category: "Transport",
          paidAt: new Date(now.getFullYear(), now.getMonth(), 12),
          createdByEmail: email,
        },
      ],
    });
    console.log("Seed OK — sample expenses created.");
  }

  const supplierCount = await prisma.supplier.count();
  if (supplierCount === 0) {
    await prisma.supplier.createMany({
      data: [
        {
          name: "BrightSource Trading",
          contact: "Jean Paul",
          email: "orders@brightsource.rw",
          phone: "+250 788 000 111",
        },
        {
          name: "Lumina Wholesale",
          contact: "Alice Mukamana",
          email: "supply@lumina.rw",
          phone: "+250 788 000 222",
        },
      ],
    });
    console.log("Seed OK — sample suppliers created.");
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const skus = [
      {
        name: "River 20W LED Panel",
        slug: "river-20w-led-panel",
        category: "Indoor",
        priceCents: 1850000,
        costPriceCents: 1200000,
        stock: 48,
        published: true,
      },
      {
        name: "GU10 Warm White Pack (6)",
        slug: "gu10-warm-white-6",
        category: "Bulbs",
        priceCents: 4200000,
        costPriceCents: 2800000,
        stock: 6,
        published: true,
      },
      {
        name: "Outdoor Flood LED 50W",
        slug: "outdoor-flood-50w",
        category: "Outdoor",
        priceCents: 8900000,
        costPriceCents: 6100000,
        stock: 22,
        published: true,
      },
      {
        name: "T8 LED Tube 120cm",
        slug: "t8-led-tube-120",
        category: "Tubes",
        priceCents: 650000,
        costPriceCents: 420000,
        stock: 0,
        published: true,
      },
      {
        name: "Smart Bulb Starter Kit",
        slug: "smart-bulb-starter",
        category: "Smart",
        priceCents: 2950000,
        costPriceCents: 2100000,
        stock: 14,
        published: false,
      },
    ];
    for (const product of skus) {
      await prisma.product.create({ data: { ...product, currency: "RWF" } });
    }
    console.log("Seed OK — sample warehouse products created.");
  }

  await prisma.product.updateMany({
    where: { currency: "TZS" },
    data: { currency: "RWF" },
  });
  await prisma.expense.updateMany({
    where: { currency: "TZS" },
    data: { currency: "RWF" },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
