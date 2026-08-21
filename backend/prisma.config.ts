// ─────────────────────────────────────────────────────────────
// GradGrid — Prisma Configuration (Prisma 7+)
// ─────────────────────────────────────────────────────────────
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma CLI loads this file for schema-only commands where a live database
// is not needed. Keep a local placeholder only for those commands; migration
// commands must still fail fast unless the real DATABASE_URL exists.
const isSchemaOnlyCommand = process.argv.some((argument) =>
  ["generate", "validate", "format"].includes(argument)
);
const databaseUrl =
  process.env.DATABASE_URL ||
  (isSchemaOnlyCommand
    ? "postgresql://postgres:postgres@localhost:5432/gradgrid?schema=public"
    : env("DATABASE_URL"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
