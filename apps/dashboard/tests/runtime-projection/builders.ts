import assert from "node:assert/strict";
import {
  AgentProjectionBuilder,
  DecisionProjectionBuilder,
  ExecutiveTimelineProjectionBuilder,
  GoalProjectionBuilder,
  KnowledgeProjectionBuilder,
  MemoryProjectionBuilder,
  MissionProjectionBuilder,
  OrganizationProjectionBuilder,
  WorkflowProjectionBuilder,
} from "@/features/runtime-projection/builders";
import { RuntimeProjectionRegistry } from "@/features/runtime-projection/projection-registry";
import type { RuntimeProjectionBuilder } from "@/features/runtime-projection/types";

function eraseBuilderType<T>(
  builder: RuntimeProjectionBuilder<T>,
): RuntimeProjectionBuilder<unknown> {
  return {
    collection: builder.collection,
    owner: builder.owner,
    dependencies: builder.dependencies,
    build: (context) => builder.build(context),
    count: builder.count
      ? (projection) => builder.count?.(projection as T) ?? 0
      : undefined,
  };
}

const builders: RuntimeProjectionBuilder<unknown>[] = [
  eraseBuilderType(OrganizationProjectionBuilder),
  eraseBuilderType(AgentProjectionBuilder),
  eraseBuilderType(WorkflowProjectionBuilder),
  eraseBuilderType(GoalProjectionBuilder),
  eraseBuilderType(MissionProjectionBuilder),
  eraseBuilderType(KnowledgeProjectionBuilder),
  eraseBuilderType(MemoryProjectionBuilder),
  eraseBuilderType(DecisionProjectionBuilder),
  eraseBuilderType(ExecutiveTimelineProjectionBuilder),
];

function registerAll(registry: RuntimeProjectionRegistry): void {
  for (const builder of builders) registry.register(builder);
}

function assertDeepFrozen(value: unknown, seen = new WeakSet<object>()): void {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), "projection values must be deeply frozen");
  for (const child of Object.values(value)) assertDeepFrozen(child, seen);
}

async function main(): Promise<void> {
  const registry = new RuntimeProjectionRegistry();
  registerAll(registry);
  registry.refreshAll();

  for (const builder of builders) {
    const first = registry.getSnapshot(builder.collection);
    assert.ok(first, `${builder.collection} must bootstrap`);
    assert.equal(first.availability.available, true);
    assert.equal(first.health.status, "healthy");
    assertDeepFrozen(first);

    const rebuilt = registry.refresh(builder.collection).snapshot;
    assert.deepEqual(
      rebuilt.data,
      first.data,
      `${builder.collection} must rebuild deterministically`,
    );

    const failureRegistry = new RuntimeProjectionRegistry();
    registerAll(failureRegistry);
    failureRegistry.refreshAll();
    const beforeFailure = failureRegistry.getSnapshot(builder.collection);
    assert.ok(beforeFailure);

    failureRegistry.register({
      ...builder,
      build: () => {
        throw new TypeError("intentional builder validation failure");
      },
    });
    assert.throws(() => failureRegistry.refresh(builder.collection), TypeError);

    const afterFailure = failureRegistry.getSnapshot(builder.collection);
    assert.ok(afterFailure);
    assert.deepEqual(afterFailure.data, beforeFailure.data);
    assert.equal(afterFailure.availability.available, false);
    assert.equal(afterFailure.health.status, "stale");
  }

  console.log("runtime-projection builder checks passed (9/9)");
}

void main();
