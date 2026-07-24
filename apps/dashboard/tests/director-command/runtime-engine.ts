import assert from "node:assert/strict";
import {
  createRuntimeEngine,
  RUNTIME_ENGINE_COORDINATION_MODES,
  RUNTIME_ENGINE_ERROR_CODES,
  RUNTIME_ENGINE_STATES,
  RUNTIME_ENGINE_VERSION,
  serializeRuntimeEngine,
  validateRuntimeEngine,
  type RuntimeEngine,
} from "../../src/features/director-command";

function frozen<T>(value: T, seen = new WeakSet<object>()): T {
  if (value && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    for (const nested of Object.values(value)) frozen(nested, seen);
    Object.freeze(value);
  }
  return value;
}

const permit = frozen({
  identity: { permitId: "permit-4e1", correlationId: "correlation-4e1", executionId: "execution-4e1", executable: false as const, authoritative: false as const },
  status: "issued" as const,
  metadata: {},
  references: {},
  evidence: [],
  architectureVersion: "runtime-execution-permit/v1",
  executable: false as const,
  authoritative: false as const,
});
const input = {
  permit: permit as never,
  state: { value: "ready" as const, executable: false as const, authoritative: false as const },
  configuration: {
    configurationId: "runtime-config-4e1",
    schemaVersion: "1.0.0",
    coordinationMode: "declarative" as const,
    pipelineReference: "future-execution-pipeline/v1",
    metadata: { stages: ["future-pipeline", "future-adapter-invocation"] },
    executable: false as const,
    authoritative: false as const,
  },
  metadata: {
    runtimeEngineId: "runtime-engine-4e1",
    permitId: "permit-4e1",
    correlationId: "correlation-4e1",
    executionId: "execution-4e1",
    createdAt: "2026-07-24T12:00:00.000Z",
    metadata: { phase: "4E.1" },
    executable: false as const,
    authoritative: false as const,
  },
  executable: false as const,
  authoritative: false as const,
};

const engine = createRuntimeEngine(input);
assert.equal(engine.architectureVersion, RUNTIME_ENGINE_VERSION);
assert.equal(validateRuntimeEngine(engine).status, "valid");
assert.equal(Object.isFrozen(engine), true);
assert.equal(Object.isFrozen(engine.permit), true);
assert.equal(Object.isFrozen(engine.configuration.metadata), true);
assert.equal(Object.isFrozen(engine.metadata.metadata), true);
assert.notEqual(engine, input);
assert.notEqual(engine.configuration, input.configuration);
assert.notEqual(engine.configuration.metadata, input.configuration.metadata);
assert.notEqual(engine.permit, permit);
assert.deepEqual(RUNTIME_ENGINE_STATES, ["idle", "ready"]);
assert.deepEqual(RUNTIME_ENGINE_COORDINATION_MODES, ["declarative"]);
assert.deepEqual(RUNTIME_ENGINE_ERROR_CODES, ["INVALID_RUNTIME", "INVALID_CONFIGURATION", "INVALID_STATE", "IMMUTABILITY_VIOLATION", "SERIALIZATION_FAILED"]);
assert.deepEqual(JSON.parse(serializeRuntimeEngine(engine)), engine);

const idle = createRuntimeEngine({ ...input, state: { ...input.state, value: "idle" } });
assert.equal(validateRuntimeEngine(idle).status, "valid");
assert.equal(validateRuntimeEngine(frozen({ ...engine, architectureVersion: "other" }) as never).error?.code, "INVALID_RUNTIME");
assert.equal(validateRuntimeEngine(frozen({ ...engine, state: { ...engine.state, value: "running" } }) as never).error?.code, "INVALID_STATE");
assert.equal(validateRuntimeEngine(frozen({ ...engine, configuration: { ...engine.configuration, coordinationMode: "active" } }) as never).error?.code, "INVALID_CONFIGURATION");
assert.equal(validateRuntimeEngine(frozen({ ...engine, metadata: { ...engine.metadata, permitId: "other" } }) as never).error?.code, "INVALID_RUNTIME");
assert.equal(validateRuntimeEngine({ ...engine } as RuntimeEngine).error?.code, "IMMUTABILITY_VIOLATION");

assert.throws(() => createRuntimeEngine({ ...input, configuration: { ...input.configuration, metadata: { callback: () => undefined } } } as never));
assert.throws(() => createRuntimeEngine({ ...input, configuration: { ...input.configuration, metadata: { promise: Promise.resolve() } } } as never));
assert.throws(() => createRuntimeEngine({ ...input, configuration: { ...input.configuration, metadata: { symbol: Symbol("x") } } } as never));
const cyclic: { self?: unknown } = {};
cyclic.self = cyclic;
assert.throws(() => createRuntimeEngine({ ...input, metadata: { ...input.metadata, metadata: cyclic } } as never));
class AdapterLike { readonly name = "adapter"; }
assert.throws(() => createRuntimeEngine({ ...input, configuration: { ...input.configuration, metadata: { adapter: new AdapterLike() } } } as never));
assert.throws(() => { (engine.configuration.metadata.stages as unknown as string[]).push("mutation"); });

const cyclicEngine = { ...engine, metadata: { ...engine.metadata, metadata: {} as Record<string, unknown> } };
cyclicEngine.metadata.metadata.self = cyclicEngine.metadata.metadata;
frozen(cyclicEngine);
assert.equal(validateRuntimeEngine(cyclicEngine as RuntimeEngine).error?.code, "SERIALIZATION_FAILED");
assert.throws(() => serializeRuntimeEngine(cyclicEngine as RuntimeEngine), /SERIALIZATION_FAILED/);

console.log("runtime engine architecture checks passed");
