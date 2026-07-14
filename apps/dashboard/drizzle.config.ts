/*
 * Drizzle Kit configuration — migration infrastructure only.
 *
 * Consumed by the drizzle-kit CLI (generate / migrate / push / studio). No CLI
 * command is run in this phase, nothing connects, and no credentials are stored:
 * the connection URL is read from the environment at CLI time.
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    // Supabase Postgres connection string — supplied via env, never committed.
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    // Timestamped, forward-only migration files: <NNNN>_<name>.sql
    prefix: "timestamp",
  },
  strict: true,
  verbose: true,
});
