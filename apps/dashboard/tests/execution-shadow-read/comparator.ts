import assert from "node:assert/strict";
import { compareExecutionShadow } from "../../src/features/execution-shadow-read";

function baseMemory() {
  return {
    execution: {
      id: "exec-1",
      label: "Execution",
      version: "1",
      lifecycleStatus: "running",
      legacyStatus: "running",
      health: "healthy",
      simulationMode: "offline",
      startedAt: "2026-07-12T10:00:00.000Z",
      completedAt: null,
    },
    command: {
      id: "cmd-1",
      version: "1",
      lifecycleStatus: "running",
      legacyStatus: "running",
      correlationId: "corr-1",
      causationId: "cause-1",
      idempotencyKey: "idem-1",
    },
    workflow: {
      id: "wf-1",
      version: "1",
      lifecycleStatus: "active",
    },
    task: {
      id: "task-1",
      lifecycleStatus: "running",
      legacyStatus: "planned",
    },
    plan: {
      id: "plan-1",
      version: "1",
    },
    goal: {
      id: "goal-1",
      version: "1",
    },
    mission: {
      id: "mission-1",
      version: "1",
    },
  } as const;
}

function basePostgres() {
  return {
    execution: {
      id: "exec-1",
      label: "Execution",
      version: 1,
      lifecycleStatus: "running",
      legacyStatus: "running",
      health: "healthy",
      simulationMode: "offline",
      startedAt: "2026-07-12T10:00:00.000Z",
      completedAt: null,
    },
    command: {
      id: "cmd-1",
      version: 1,
      lifecycleStatus: "running",
      legacyStatus: "running",
      correlationId: "corr-1",
      causationId: "cause-1",
      idempotencyKey: "idem-1",
    },
    workflow: {
      id: "wf-1",
      version: 1,
      lifecycleStatus: "active",
    },
    task: {
      id: "task-1",
      lifecycleStatus: "running",
      legacyStatus: "planned",
    },
    plan: {
      id: "plan-1",
      version: 1,
    },
    goal: {
      id: "goal-1",
      version: 1,
    },
    mission: {
      id: "mission-1",
      version: 1,
    },
  } as const;
}

function fieldStatus(
  diff: ReturnType<typeof compareExecutionShadow>,
  node: string,
  field: string,
): string | undefined {
  return [
    ...diff.matchedFields,
    ...diff.mismatches,
    ...diff.nonComparableFields,
    ...diff.missingFields,
  ].find((item) => item.node === node && item.field === field)?.status;
}

async function main() {
  const exact = compareExecutionShadow({
    memory: baseMemory(),
    postgres: basePostgres(),
  });
  assert.equal(exact.mismatches.length, 0);
  assert.equal(fieldStatus(exact, "execution", "id"), "match");

  const partial = compareExecutionShadow({
    memory: { ...baseMemory(), mission: undefined },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(partial, "mission", "id"), "missing-memory");

  const brokenChain = compareExecutionShadow({
    memory: { ...baseMemory(), workflow: undefined },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(brokenChain, "workflow", "id"), "missing-memory");

  const versionMismatch = compareExecutionShadow({
    memory: { ...baseMemory(), plan: { id: "plan-1", version: "2" } },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(versionMismatch, "plan", "version"), "mismatch");

  const legacyMismatch = compareExecutionShadow({
    memory: {
      ...baseMemory(),
      task: { id: "task-1", lifecycleStatus: "running", legacyStatus: "waiting" },
    },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(legacyMismatch, "task", "legacyStatus"), "mismatch");

  const deterministicA = JSON.stringify(
    compareExecutionShadow({ memory: baseMemory(), postgres: basePostgres() }),
  );
  const deterministicB = JSON.stringify(
    compareExecutionShadow({ memory: baseMemory(), postgres: basePostgres() }),
  );
  assert.equal(deterministicA, deterministicB);

  console.log("execution-shadow-read comparator checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

