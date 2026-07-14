/*
 * Typed database environment contract. Declarations only — no values, no logging
 * of secrets. Inert until a real backend is activated.
 */

export interface DatabaseEnvironment {
  /** Postgres connection string (Supabase pooler or direct). */
  DATABASE_URL: string;
  /** Supabase project URL. */
  SUPABASE_URL: string;
  /** Public anon key (client-safe, RLS-guarded). */
  SUPABASE_ANON_KEY: string;
  /** Service-role key — server only, bypasses RLS. Never exposed to the client. */
  SUPABASE_SERVICE_ROLE: string;
}

export const REQUIRED_DB_ENV = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE",
] as const;

export type DatabaseEnvKey = (typeof REQUIRED_DB_ENV)[number];

/** Reads the DB env (server only). Returns undefined for anything unset — no
 * throwing while the memory adapter is active. */
export function readDatabaseEnv(): Partial<DatabaseEnvironment> {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
  };
}

/** True only when every required variable is present. Gate for activating the
 * Supabase adapter later. */
export function isDatabaseConfigured(): boolean {
  const env = readDatabaseEnv();
  return REQUIRED_DB_ENV.every((key) => Boolean(env[key]));
}
