import assert from "node:assert/strict";
import {
  activeProvider,
  type PersistedEntity,
} from "../../src/features/persistence";
import { listRegisteredPersistenceProviders } from "../../src/features/persistence/provider-registry";
import { createPostgresAdapter } from "../../src/features/persistence/supabase-postgres-adapter";

interface SampleEntity extends PersistedEntity {
  name: string;
}

async function main() {
  assert.equal(activeProvider(), "memory");

  const providers = await listRegisteredPersistenceProviders({
    NODE_ENV: "development",
  });
  assert.equal(providers[0]?.key, "memory");
  assert.equal(providers[0]?.status, "active");
  assert.equal(providers[1]?.key, "postgres");
  assert.equal(providers[1]?.status, "available");
  assert.equal(providers[1]?.active, false);

  const adapter = createPostgresAdapter<SampleEntity>({
    collection: "provider-test",
    seed: () => [{ id: "1", lifecycleStatus: "active", name: "Alpha" }],
    env: { NODE_ENV: "development" },
  });
  assert.deepEqual(adapter.list().map((item) => item.name), ["Alpha"]);
  adapter.create({ id: "2", lifecycleStatus: "active", name: "Beta" });
  assert.equal(adapter.exists("2"), true);
  assert.equal(adapter.find((item) => item.name === "Beta").length, 1);
  const health = await adapter.health();
  assert.equal(health.provider, "postgres");

  console.log("persistence provider checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
