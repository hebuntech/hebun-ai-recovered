import assert from "node:assert/strict";
import {
  activeProvider,
  createRepository,
  getAdapter,
  getOperationHistory,
  type PersistedEntity,
} from "../../src/features/persistence";

interface SampleEntity extends PersistedEntity {
  label: string;
}

async function main() {
  const adapter = getAdapter<SampleEntity>("repo-test", () => [
    { id: "1", lifecycleStatus: "active", label: "One" },
  ]);
  const repository = createRepository(adapter);

  assert.equal(activeProvider(), "memory");
  assert.equal(adapter.provider, "memory");
  assert.equal(repository.findAll().length, 1);
  repository.insert({ id: "2", lifecycleStatus: "active", label: "Two" });
  assert.equal(repository.findById("2")?.label, "Two");

  const providersSeen = new Set(getOperationHistory().map((entry) => entry.provider));
  assert.deepEqual([...providersSeen], ["memory"]);

  console.log("persistence repository checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
