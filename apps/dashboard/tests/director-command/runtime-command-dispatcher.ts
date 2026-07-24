import assert from "node:assert/strict";
import {
  createRuntimeCommandDispatcher,
  RUNTIME_DISPATCH_ERROR_CODES,
  RUNTIME_DISPATCH_TARGET_CATEGORIES,
  RUNTIME_DISPATCH_VERSION,
  serializeRuntimeCommandDispatcher,
  validateRuntimeCommandDispatcher,
  type RuntimeCommandDispatcher,
} from "../../src/features/director-command";

function frozen<T>(value: T, seen = new WeakSet<object>()): T {
  if (value && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    for (const nested of Object.values(value)) frozen(nested, seen);
    Object.freeze(value);
  }
  return value;
}

const pipeline = frozen({
  stages: [],
  metadata: { pipelineId: "pipeline-4e4", executionId: "execution-4e4", correlationId: "correlation-4e4", executable: false as const, authoritative: false as const },
  references: {},
  architectureVersion: "runtime-execution-pipeline/v1",
  executable: false as const,
  authoritative: false as const,
});
const targets = [
  { targetId: "target-system", category: "SYSTEM" as const, handlerId: "handler-system", metadata: { classification: "system" }, executable: false as const, authoritative: false as const },
  { targetId: "target-tool", category: "TOOL" as const, handlerId: "handler-tool", metadata: { classification: "tool" }, executable: false as const, authoritative: false as const },
];
const input = {
  plan: { planId: "plan-4e4", commandId: "command-4e4", primaryTargetId: "target-system", targets, executable: false as const, authoritative: false as const },
  metadata: {
    dispatcherId: "dispatcher-4e4",
    executionId: "execution-4e4",
    correlationId: "correlation-4e4",
    schemaVersion: "1.0.0",
    createdAt: "2026-07-24T16:00:00.000Z",
    metadata: { mode: "routing-only" },
    executable: false as const,
    authoritative: false as const,
  },
  references: { pipeline: pipeline as never, executable: false as const, authoritative: false as const },
  executable: false as const,
  authoritative: false as const,
};

const dispatcher = createRuntimeCommandDispatcher(input);
assert.equal(dispatcher.architectureVersion, RUNTIME_DISPATCH_VERSION);
assert.equal(validateRuntimeCommandDispatcher(dispatcher).status, "valid");
assert.deepEqual(RUNTIME_DISPATCH_TARGET_CATEGORIES, ["SYSTEM", "DIRECTOR", "MEMORY", "KNOWLEDGE", "TOOL", "ADAPTER"]);
assert.deepEqual(RUNTIME_DISPATCH_ERROR_CODES, ["INVALID_DISPATCHER", "INVALID_DISPATCH_PLAN", "INVALID_TARGET", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_METADATA", "SERIALIZATION_FAILED", "IMMUTABILITY_VIOLATION"]);
assert.deepEqual(JSON.parse(serializeRuntimeCommandDispatcher(dispatcher)), dispatcher);
assert.equal(Object.isFrozen(dispatcher), true);
assert.equal(Object.isFrozen(dispatcher.plan), true);
assert.equal(Object.isFrozen(dispatcher.plan.targets), true);
assert.equal(Object.isFrozen(dispatcher.plan.targets[0]), true);
assert.equal(Object.isFrozen(dispatcher.plan.targets[0]!.metadata), true);
assert.equal(Object.isFrozen(dispatcher.metadata), true);
assert.equal(Object.isFrozen(dispatcher.references), true);
assert.equal(Object.isFrozen(dispatcher.references.pipeline), true);
assert.notEqual(dispatcher, input);
assert.notEqual(dispatcher.plan, input.plan);
assert.notEqual(dispatcher.plan.targets, targets);
assert.notEqual(dispatcher.plan.targets[0], targets[0]);
assert.notEqual(dispatcher.references.pipeline, pipeline);

assert.equal(validateRuntimeCommandDispatcher(frozen({ ...dispatcher, architectureVersion: "other" }) as never).error?.code, "INVALID_DISPATCHER");
assert.equal(validateRuntimeCommandDispatcher(frozen({ ...dispatcher, plan: { ...dispatcher.plan, commandId: "" } }) as never).error?.code, "INVALID_DISPATCH_PLAN");
assert.equal(validateRuntimeCommandDispatcher(frozen({ ...dispatcher, plan: { ...dispatcher.plan, targets: [{ ...dispatcher.plan.targets[0]!, category: "NETWORK" }] } }) as never).error?.code, "INVALID_TARGET");
assert.equal(validateRuntimeCommandDispatcher(frozen({ ...dispatcher, plan: { ...dispatcher.plan, targets: [dispatcher.plan.targets[0]!, { ...dispatcher.plan.targets[0]! }] } }) as never).error?.code, "INVALID_TARGET");
assert.equal(validateRuntimeCommandDispatcher(frozen({ ...dispatcher, metadata: { ...dispatcher.metadata, dispatcherId: "" } }) as never).error?.code, "INVALID_IDENTIFIER");
assert.equal(validateRuntimeCommandDispatcher(frozen({ ...dispatcher, metadata: { ...dispatcher.metadata, schemaVersion: "" } }) as never).error?.code, "INVALID_METADATA");
assert.equal(validateRuntimeCommandDispatcher(frozen({ ...dispatcher, metadata: { ...dispatcher.metadata, correlationId: "other" } }) as never).error?.code, "INVALID_REFERENCE");
assert.equal(validateRuntimeCommandDispatcher({ ...dispatcher } as RuntimeCommandDispatcher).error?.code, "IMMUTABILITY_VIOLATION");
assert.equal(validateRuntimeCommandDispatcher({ ...dispatcher, plan: { ...dispatcher.plan, targets: [...dispatcher.plan.targets] } } as RuntimeCommandDispatcher).error?.code, "IMMUTABILITY_VIOLATION");

assert.throws(() => createRuntimeCommandDispatcher({ ...input, plan: { ...input.plan, targets: [{ ...targets[0]!, metadata: { callback: () => undefined } }] } } as never));
assert.throws(() => createRuntimeCommandDispatcher({ ...input, metadata: { ...input.metadata, metadata: { promise: Promise.resolve() } } } as never));
assert.throws(() => createRuntimeCommandDispatcher({ ...input, metadata: { ...input.metadata, metadata: { symbol: Symbol("x") } } } as never));
const cyclic: { self?: unknown } = {};
cyclic.self = cyclic;
assert.throws(() => createRuntimeCommandDispatcher({ ...input, metadata: { ...input.metadata, metadata: cyclic } } as never));
class AdapterLike { readonly name = "adapter"; }
assert.throws(() => createRuntimeCommandDispatcher({ ...input, metadata: { ...input.metadata, metadata: { adapter: new AdapterLike() } } } as never));
const sharedMutable = { label: "shared" };
assert.throws(() => createRuntimeCommandDispatcher({ ...input, metadata: { ...input.metadata, metadata: { first: sharedMutable, second: sharedMutable } } } as never));
assert.throws(() => { (dispatcher.plan.targets as unknown as object[]).push({}); });

const cyclicDispatcher = { ...dispatcher, metadata: { ...dispatcher.metadata, metadata: {} as Record<string, unknown> } };
cyclicDispatcher.metadata.metadata.self = cyclicDispatcher.metadata.metadata;
frozen(cyclicDispatcher);
assert.equal(validateRuntimeCommandDispatcher(cyclicDispatcher as RuntimeCommandDispatcher).error?.code, "SERIALIZATION_FAILED");
assert.throws(() => serializeRuntimeCommandDispatcher(cyclicDispatcher as RuntimeCommandDispatcher), /SERIALIZATION_FAILED/);

console.log("runtime command dispatcher checks passed");
