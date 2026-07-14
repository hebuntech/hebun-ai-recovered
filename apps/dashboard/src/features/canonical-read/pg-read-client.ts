/*
 * canonical-read / pg-read-client — read-only PostgreSQL access.
 *
 * This client is optional, lazy, parameterized, and isolated from the active
 * persistence adapter. It exposes no mutation helpers.
 */
import { Pool, type PoolClient } from "pg";
import {
  type CanonicalReadAvailability,
  type CanonicalReadError,
  type CanonicalReadTarget,
} from "./types";
import {
  readCanonicalReadConfigFromEnv,
  type CanonicalReadConfig,
} from "./config";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function parseTarget(
  connectionString?: string,
): {
  availability: CanonicalReadAvailability;
  connectionString?: string;
} {
  if (!connectionString) {
    return {
      availability: {
        available: false,
        configured: false,
        source: "postgres",
        reason: "missing_database_url",
        warnings: ["HEBUN_CANONICAL_READ_DATABASE_URL is not set."],
      },
    };
  }

  const url = new URL(connectionString);
  const target: CanonicalReadTarget = {
    host: url.hostname,
    port: url.port ? Number(url.port) : null,
    database: url.pathname.replace(/^\//, "") || "postgres",
    local: LOCAL_HOSTS.has(url.hostname),
  };

  return {
    availability: {
      available: true,
      configured: true,
      source: "postgres",
      target,
      warnings: [],
    },
    connectionString,
  };
}

function buildUnavailableError(
  availability: CanonicalReadAvailability,
): CanonicalReadError {
  return {
    code: "unavailable",
    message: availability.warnings[0] ?? "Canonical read is unavailable.",
    retryable: availability.reason === "connection_failed",
    detail: availability.reason,
  };
}

export class CanonicalPgReadClient {
  private readonly config: Required<
    Pick<
      CanonicalReadConfig,
      | "allowRemote"
      | "statementTimeoutMs"
      | "connectionTimeoutMs"
      | "idleTimeoutMs"
      | "appName"
    >
  > &
    Pick<CanonicalReadConfig, "connectionString">;
  private pool?: Pool;

  constructor(config: CanonicalReadConfig = readCanonicalReadConfigFromEnv()) {
    this.config = {
      connectionString: config.connectionString,
      allowRemote: config.allowRemote ?? false,
      statementTimeoutMs: config.statementTimeoutMs ?? 5000,
      connectionTimeoutMs: config.connectionTimeoutMs ?? 2000,
      idleTimeoutMs: config.idleTimeoutMs ?? 1000,
      appName: config.appName ?? "hebun-canonical-read",
    };
  }

  private describeConfiguredAvailability(): CanonicalReadAvailability {
    const parsed = parseTarget(this.config.connectionString);
    const { availability } = parsed;
    if (!availability.available) return availability;

    if (!this.config.allowRemote && availability.target && !availability.target.local) {
      return {
        ...availability,
        available: false,
        reason: "disallowed_target",
        warnings: [
          `Canonical read target ${availability.target.host} is not local and allowRemote is false.`,
        ],
      };
    }

    return availability;
  }

  private getPool(): Pool {
    if (this.pool) return this.pool;
    this.pool = new Pool({
      connectionString: this.config.connectionString,
      max: 2,
      idleTimeoutMillis: this.config.idleTimeoutMs,
      connectionTimeoutMillis: this.config.connectionTimeoutMs,
      application_name: this.config.appName,
    });
    return this.pool;
  }

  async availability(): Promise<CanonicalReadAvailability> {
    const base = this.describeConfiguredAvailability();
    if (!base.available) return base;

    const started = Date.now();
    try {
      await this.withReadOnlyTransaction(async (client) => {
        await client.query("select 1 as ok");
      });
      return {
        ...base,
        available: true,
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - started,
      };
    } catch (error) {
      return {
        ...base,
        available: false,
        reason: "connection_failed",
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - started,
        warnings: [
          error instanceof Error
            ? error.message
            : "Unknown PostgreSQL connection failure.",
        ],
      };
    }
  }

  unavailableAvailability(): CanonicalReadAvailability {
    return this.describeConfiguredAvailability();
  }

  unavailableError(): CanonicalReadError {
    return buildUnavailableError(this.describeConfiguredAvailability());
  }

  async withReadOnlyTransaction<T>(
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const availability = this.describeConfiguredAvailability();
    if (!availability.available) {
      throw new Error(this.unavailableError().message);
    }

    const client = await this.getPool().connect();
    try {
      await client.query("begin read only");
      await client.query("select set_config('statement_timeout', $1, true)", [
        String(this.config.statementTimeoutMs),
      ]);
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) {
      try {
        await client.query("rollback");
      } catch {
        // Ignore rollback failure; the original query error is the useful one.
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async queryOne<Row>(
    sql: string,
    params: readonly unknown[],
  ): Promise<Row | null> {
    return this.withReadOnlyTransaction(async (client) => {
      const result = await client.query<Row>(sql, [...params]);
      return result.rows[0] ?? null;
    });
  }

  async queryMany<Row>(
    sql: string,
    params: readonly unknown[],
  ): Promise<readonly Row[]> {
    return this.withReadOnlyTransaction(async (client) => {
      const result = await client.query<Row>(sql, [...params]);
      return result.rows;
    });
  }

  async dispose(): Promise<void> {
    if (!this.pool) return;
    await this.pool.end();
    this.pool = undefined;
  }
}
