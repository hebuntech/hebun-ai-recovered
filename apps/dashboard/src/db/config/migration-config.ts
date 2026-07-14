/*
 * Migration strategy — configuration + documented flow. No migrations are
 * generated or executed in this phase. Consumed later by drizzle-kit and CI.
 */

export const MIGRATION_CONFIG = {
  dialect: "postgresql",
  schemaPath: "./src/db/schema/index.ts",
  migrationsDir: "./src/db/migrations",
  seedDir: "./src/db/seed",
  /** drizzle-kit file naming: <NNNN>_<slug>.sql with a timestamp prefix. */
  naming: "timestamp",
  /** First migration = full schema baseline. */
  baseline: "0000_baseline",
  /** Forward-only; sequential index + timestamp. */
  versioning: "sequential+timestamp",
} as const;

/**
 * Rollback strategy: **forward-only** in production. Never run destructive down
 * migrations against prod — ship a corrective migration instead. Local
 * development may drop and recreate freely.
 */
export const MIGRATION_FLOWS = {
  development: [
    "edit schema in src/db/schema",
    "drizzle-kit generate  (SQL diff, reviewed)",
    "drizzle-kit migrate   (apply to local Postgres)",
  ],
  production: [
    "generate migration in a PR",
    "review + approve the SQL",
    "drizzle-kit migrate in CI (forward-only, transactional)",
    "verify RLS + indexes present",
  ],
  rollback: "forward-only; corrective migration on prod. Local may reset.",
  seed: "src/db/seed runs after baseline; idempotent, per-tenant demo data only.",
} as const;

export type MigrationConfig = typeof MIGRATION_CONFIG;
export type MigrationFlows = typeof MIGRATION_FLOWS;
