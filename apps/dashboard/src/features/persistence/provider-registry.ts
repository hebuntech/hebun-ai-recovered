import { ADAPTER_CAPABILITIES } from "@/db/config/adapter-contract";
import {
  createPostgresAdapter,
  PERSISTENCE_POSTGRES_DATABASE_URL_ENV,
} from "./supabase-postgres-adapter";
import { getRegisteredCollections } from "./storage-manager";
import type {
  PersistenceProviderDescriptor,
  PersistenceProviderHealth,
  PersistenceProviderKey,
} from "./types";

function memoryProviderHealth(): PersistenceProviderHealth {
  return {
    state: "healthy",
    provider: "memory",
    checkedAt: new Date().toISOString(),
    latencyMs: 0,
    detail: "Active in-process provider.",
  };
}

export async function listRegisteredPersistenceProviders(
  env: NodeJS.ProcessEnv = process.env,
): Promise<readonly PersistenceProviderDescriptor[]> {
  const memory: PersistenceProviderDescriptor = {
    key: "memory",
    label: "Memory",
    status: "active",
    active: true,
    capabilities: ADAPTER_CAPABILITIES,
    collections: getRegisteredCollections(),
    health: memoryProviderHealth(),
  };

  const postgresAdapter = createPostgresAdapter({
    collection: "__provider_registry__",
    seed: () => [],
    env,
  });
  const postgresHealth = await postgresAdapter.health();
  const postgres: PersistenceProviderDescriptor = {
    key: "postgres",
    label: "PostgreSQL",
    status: "available",
    active: false,
    capabilities: ADAPTER_CAPABILITIES,
    collections: [],
    health: {
      state: env[PERSISTENCE_POSTGRES_DATABASE_URL_ENV]
        ? postgresHealth.ok
          ? "healthy"
          : "unavailable"
        : "unconfigured",
      provider: "postgres",
      checkedAt: postgresHealth.checkedAt,
      latencyMs: postgresHealth.latencyMs,
      detail: env[PERSISTENCE_POSTGRES_DATABASE_URL_ENV]
        ? postgresHealth.ok
          ? "Passive provider is reachable."
          : "Passive provider health check failed."
        : `${PERSISTENCE_POSTGRES_DATABASE_URL_ENV} is not set.`,
    },
  };

  return [memory, postgres];
}

export async function getPersistenceProviderDescriptor(
  provider: PersistenceProviderKey,
  env: NodeJS.ProcessEnv = process.env,
): Promise<PersistenceProviderDescriptor | undefined> {
  const providers = await listRegisteredPersistenceProviders(env);
  return providers.find((entry) => entry.key === provider);
}
