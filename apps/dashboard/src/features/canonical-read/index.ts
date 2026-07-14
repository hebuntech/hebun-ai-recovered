/*
 * canonical-read — optional PostgreSQL-backed governed query layer.
 *
 * Read-only only. No writes, no adapter activation, no route wiring.
 */
import { readCanonicalReadConfigFromEnv, type CanonicalReadConfig } from "./config";
import { CanonicalPgReadClient } from "./pg-read-client";
import { resolveCanonicalActor } from "./actor-resolution";
import { selectCanonicalKnowledgeFact } from "./knowledge-facts";
import { getExecutionLineage } from "./execution-lineage";
import type { CanonicalReadServices } from "./types";

export * from "./types";
export * from "./config";

export function createCanonicalReadServices(
  config: CanonicalReadConfig = readCanonicalReadConfigFromEnv(),
): CanonicalReadServices {
  const client = new CanonicalPgReadClient(config);

  return {
    availability: () => client.availability(),
    dispose: () => client.dispose(),
    resolveActor: (input) => resolveCanonicalActor(client, input),
    selectCanonicalKnowledgeFact: (input) =>
      selectCanonicalKnowledgeFact(client, input),
    getExecutionLineage: (input) => getExecutionLineage(client, input),
  };
}
