/*
 * Registry CRUD — persistence adapter binding.
 *
 * Resolves the registries collection through the storage manager. The concrete
 * backend (memory today) is hidden: this module only ever sees a
 * PersistenceAdapter. Reactivity for the UI comes straight from the adapter.
 */

import { getAdapter } from "@/features/persistence";
import { registryDefinitions } from "@/features/registries";
import type { RegistryCrudRecord } from "./types";

const SEED_AT = "2026-01-01T00:00:00.000Z";

function seed(): RegistryCrudRecord[] {
  return registryDefinitions.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    owner: d.owner,
    health: d.health,
    totalRecords: d.totalRecords,
    lifecycleStatus: "active" as const,
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
  }));
}

export const registryAdapter = getAdapter<RegistryCrudRecord>("registries", seed);

export const subscribe = registryAdapter.subscribe;
export const getSnapshot = registryAdapter.getSnapshot;

export async function resetStore(): Promise<void> {
  await registryAdapter.save(seed());
}
