import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { Client } from "pg";

const DEFAULT_ADMIN_URL =
  process.env.HEBUN_CANONICAL_READ_TEST_ADMIN_DATABASE_URL ??
  "postgresql://postgres@127.0.0.1:5432/postgres";

export interface DisposablePostgresHarness {
  readonly adminUrl: string;
  readonly dbName: string;
  readonly dbUrl: string;
  createDatabase(): Promise<void>;
  dropDatabase(): Promise<void>;
  migrateDatabase(): void;
}

function assertLocalUrl(url: string, label: string): void {
  const parsed = new URL(url);
  assert.ok(
    ["127.0.0.1", "localhost", "::1"].includes(parsed.hostname),
    `${label} requires localhost, got ${parsed.hostname}`,
  );
}

export function createDisposablePostgresHarness(
  prefix: string,
  adminUrl: string = DEFAULT_ADMIN_URL,
): DisposablePostgresHarness {
  const dbName = `${prefix}_${Date.now()}`;
  const dbUrl = `postgresql://postgres@127.0.0.1:5432/${dbName}`;

  return {
    adminUrl,
    dbName,
    dbUrl,
    async createDatabase(): Promise<void> {
      assertLocalUrl(adminUrl, `${prefix} integration`);
      const admin = new Client({ connectionString: adminUrl });
      await admin.connect();
      try {
        await admin.query(`create database ${dbName}`);
      } finally {
        await admin.end();
      }
    },
    async dropDatabase(): Promise<void> {
      const admin = new Client({ connectionString: adminUrl });
      await admin.connect();
      try {
        await admin.query(
          `select pg_terminate_backend(pid)
             from pg_stat_activity
            where datname = $1
              and pid <> pg_backend_pid()`,
          [dbName],
        );
        await admin.query(`drop database if exists ${dbName}`);
      } finally {
        await admin.end();
      }
    },
    migrateDatabase(): void {
      execFileSync("npx", ["drizzle-kit", "migrate"], {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: dbUrl },
        stdio: "pipe",
      });
    },
  };
}
