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
  assert.equal(adapter.contractVersion, "async");

  const initialSnapshot = repository.getSnapshot();
  assert.strictEqual(repository.getSnapshot(), initialSnapshot);
  assert.deepEqual(initialSnapshot.map((record) => record.id), ["1"]);
  assert.equal((await repository.findAll()).length, 1);
  assert.equal((await repository.findById("1"))?.label, "One");
  assert.equal(await repository.exists("1"), true);

  let notifications = 0;
  const unsubscribe = repository.subscribe(() => {
    notifications += 1;
  });
  assert.equal(typeof unsubscribe, "function");

  await repository.insert({ id: "2", lifecycleStatus: "active", label: "Two" });
  assert.equal(notifications, 1);
  assert.notStrictEqual(repository.getSnapshot(), initialSnapshot);
  assert.deepEqual(initialSnapshot.map((record) => record.id), ["1"]);
  assert.equal((await repository.findById("2"))?.label, "Two");
  assert.equal(await repository.exists("2"), true);

  assert.equal((await repository.update("2", { label: "Two updated" }))?.label, "Two updated");
  assert.equal((await repository.archive("2"))?.lifecycleStatus, "archived");
  assert.equal((await repository.restore("2"))?.lifecycleStatus, "active");
  assert.equal((await repository.softDelete("2"))?.lifecycleStatus, "deleted");
  assert.equal(notifications, 5);

  await repository.transaction(async (transactionRepository) => {
    await transactionRepository.insert({
      id: "3",
      lifecycleStatus: "active",
      label: "Three",
    });
    await transactionRepository.update("1", { label: "One committed" });
  });
  assert.equal((await repository.findById("1"))?.label, "One committed");
  assert.equal((await repository.findById("3"))?.label, "Three");
  assert.equal(notifications, 6);

  const beforeRollback = repository.getSnapshot();
  const notificationsBeforeRollback = notifications;
  await assert.rejects(
    repository.transaction(async (transactionRepository) => {
      await transactionRepository.insert({
        id: "4",
        lifecycleStatus: "active",
        label: "Four",
      });
      await transactionRepository.update("1", { label: "Temporary" });
      throw new Error("rollback requested");
    }),
    /rollback requested/,
  );
  assert.deepEqual(repository.getSnapshot(), beforeRollback);
  assert.equal(await repository.exists("4"), false);
  assert.equal(notifications, notificationsBeforeRollback);

  unsubscribe();
  await repository.insert({ id: "5", lifecycleStatus: "active", label: "Five" });
  assert.equal(notifications, notificationsBeforeRollback);

  const providersSeen = new Set(getOperationHistory().map((entry) => entry.provider));
  assert.deepEqual([...providersSeen], ["memory"]);

  console.log("persistence repository checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
