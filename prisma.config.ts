import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load `.env` then `.env.local` so Prisma CLI matches Next.js local overrides.
config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
