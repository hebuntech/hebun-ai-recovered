import assert from "node:assert/strict";
import {
  activeProvider,
  type PersistedEntity,
} from "../../src/features/persistence";
import { createMemoryAdapter } from "../../src/features/persistence/memory-adapter";
import { listRegisteredPersistenceProviders } from "../../src/features/persistence/provider-registry";
import { createPostgresAdapter } from "../../src/features/persistence/supabase-postgres-adapter";

interface SampleEntity extends PersistedEntity {
  name: string;
}

interface PassiveErrorShape extends Error {
  readonly code: string;
  readonly provider: string;
  readonly collection: string;
  readonly operation: string;
}

async function assertPassiveFailure(
  operation: string,
  run: () => Promise<unknown>,
): Promise<void> {
  let failure: unknown;
  try {
    await run();
  } catch (error) {
    failure = error;
  }

  assert.ok(failure instanceof Error, `${operation} must fail with an Error`);
  const typed = failure as PassiveErrorShape;
  assert.equal(typed.name, "PostgresPersistenceError");
  assert.equal(typed.code, "PERSISTENCE_COLLECTION_UNSUPPORTED");
  assert.equal(typed.provider, "postgres");
  assert.equal(typed.collection, "provider-test");
  assert.equal(typed.operation, operation);
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
  assert.deepEqual(providers[1]?.collections, ["registries"]);
  assert.deepEqual(providers[1]?.manifest?.supportedCollections, ["registries"]);

  const memory = createMemoryAdapter<SampleEntity>({
    collection: "memory-provider-test",
    seed: () => [{ id: "1", lifecycleStatus: "active", name: "Alpha" }],
  });
  assert.equal(memory.provider, "memory");
  assert.equal(memory.contractVersion, "async");
  assert.deepEqual(memory.manifest.supportedCollections, ["memory-provider-test"]);
  assert.deepEqual(memory.manifest.readableCollections, ["memory-provider-test"]);
  assert.deepEqual(memory.manifest.writableCollections, ["memory-provider-test"]);
  assert.equal(memory.manifest.transactional, true);
  assert.equal(memory.manifest.tenantIsolation, false);
  assert.equal(typeof memory.getSnapshot, "function");
  assert.equal(typeof memory.subscribe(() => undefined), "function");
  assert.ok(memory.list() instanceof Promise);
  assert.equal((await memory.create({ id: "2", lifecycleStatus: "active", name: "Beta" })).name, "Beta");
  assert.equal((await memory.update("2", { name: "Beta updated" }))?.name, "Beta updated");
  assert.equal(await memory.exists("2"), true);
  assert.equal((await memory.find((item) => item.name === "Beta updated")).length, 1);
  await memory.transaction(async (transactionAdapter) => {
    await transactionAdapter.archive("2");
  });
  assert.equal((await memory.find((item) => item.id === "2"))[0]?.lifecycleStatus, "archived");

  const adapter = createPostgresAdapter<SampleEntity>({
    collection: "provider-test",
    seed: () => [{ id: "1", lifecycleStatus: "active", name: "Alpha" }],
    env: { NODE_ENV: "development" },
  });
  assert.equal(adapter.contractVersion, "async");
  assert.equal(adapter.manifest.transactional, false);
  assert.equal(adapter.manifest.tenantIsolation, false);
  assert.deepEqual(adapter.manifest.supportedCollections, []);
  assert.deepEqual(adapter.manifest.readableCollections, []);
  assert.deepEqual(adapter.manifest.writableCollections, []);
  assert.deepEqual(adapter.manifest.unsupportedCollections, ["provider-test"]);
  assert.deepEqual(adapter.getSnapshot(), []);
  assert.equal(typeof adapter.subscribe(() => undefined), "function");

  const unsupportedOperations: ReadonlyArray<
    readonly [string, () => Promise<unknown>]
  > = [
    ["load", () => adapter.load()],
    ["save", () => adapter.save([])],
    ["create", () => adapter.create({ id: "2", lifecycleStatus: "active", name: "Beta" })],
    ["update", () => adapter.update("1", { name: "Updated" })],
    ["delete", () => adapter.delete("1")],
    ["restore", () => adapter.restore("1")],
    ["archive", () => adapter.archive("1")],
    ["exists", () => adapter.exists("1")],
    ["list", () => adapter.list()],
    ["find", () => adapter.find((item) => item.name === "Beta")],
    ["clear", () => adapter.clear()],
    [
      "transaction",
      () => adapter.transaction(async () => undefined),
    ],
  ];
  for (const [operation, run] of unsupportedOperations) {
    await assertPassiveFailure(operation, run);
  }

  assert.equal(activeProvider(), "memory");
  const health = await adapter.health();
  assert.equal(health.provider, "postgres");

  console.log("persistence provider checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
