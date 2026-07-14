/*
 * canonical-read configuration — isolated from the active runtime DATABASE_URL.
 */
export interface CanonicalReadConfig {
  readonly connectionString?: string;
  readonly allowRemote?: boolean;
  readonly statementTimeoutMs?: number;
  readonly connectionTimeoutMs?: number;
  readonly idleTimeoutMs?: number;
  readonly appName?: string;
}

export const CANONICAL_READ_DATABASE_URL_ENV =
  "HEBUN_CANONICAL_READ_DATABASE_URL";
export const CANONICAL_READ_ALLOW_REMOTE_ENV =
  "HEBUN_CANONICAL_READ_ALLOW_REMOTE";

export function readCanonicalReadConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): CanonicalReadConfig {
  return {
    connectionString: env[CANONICAL_READ_DATABASE_URL_ENV],
    allowRemote: env[CANONICAL_READ_ALLOW_REMOTE_ENV] === "true",
    statementTimeoutMs: 5000,
    connectionTimeoutMs: 2000,
    idleTimeoutMs: 1000,
    appName: "hebun-canonical-read",
  };
}
