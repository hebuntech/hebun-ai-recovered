import assert from "node:assert/strict";
import { RuntimeProjectionRegistry } from "@/features/runtime-projection/projection-registry";

type TestProjection = {
  nested: { value: number };
  records: Array<{ id: string; labels: string[] }>;
};

async function main(): Promise<void> {
  const registry = new RuntimeProjectionRegistry();
  const builderValue: TestProjection = {
    nested: { value: 1 },
    records: [{ id: "record-1", labels: ["original"] }],
  };
  let shouldFail = false;

  registry.register<TestProjection>({
    collection: "organization-runtime",
    owner: "Projection Hardening Test",
    dependencies: [],
    build: () => {
      if (shouldFail) throw new TypeError("unsanitized failure detail");
      return builderValue;
    },
    count: (projection) => projection.records.length,
  });

  const first = registry.refresh<TestProjection>("organization-runtime").snapshot;
  builderValue.nested.value = 99;
  builderValue.records[0].labels.push("builder mutation");

  assert.equal(first.data.nested.value, 1, "store must isolate builder-owned objects");
  assert.deepEqual(first.data.records[0].labels, ["original"]);
  assert.ok(Object.isFrozen(first), "snapshot envelope must be frozen");
  assert.ok(Object.isFrozen(first.data), "snapshot data must be frozen");
  assert.ok(Object.isFrozen(first.data.records[0].labels), "nested arrays must be frozen");
  assert.throws(() => {
    (first.data.nested as { value: number }).value = 2;
  }, TypeError);

  shouldFail = true;
  assert.throws(
    () => registry.refresh("organization-runtime"),
    TypeError,
    "builder failures must remain visible to callers",
  );

  const afterFailure = registry.getSnapshot<TestProjection>("organization-runtime");
  assert.ok(afterFailure, "a failed replacement must preserve the last valid data");
  assert.equal(afterFailure.data.nested.value, 1);
  assert.equal(afterFailure.availability.available, false);
  assert.equal(afterFailure.health.status, "stale");
  assert.equal(afterFailure.statistics.lastRefreshResult, "failure");
  assert.equal(afterFailure.statistics.lastFailureCategory, "TypeError");
  assert.doesNotMatch(
    afterFailure.health.detail,
    /unsanitized failure detail/,
    "diagnostics must not expose raw failure messages",
  );

  const diagnostics = registry.listDiagnostics();
  assert.equal(diagnostics[0].statistics.lastFailureCategory, "TypeError");
  assert.equal(diagnostics[0].availability.available, false);

  console.log("runtime-projection hardening checks passed");
}

void main();
