import assert from "node:assert/strict";
import {
  createRuntimeExecutionPipeline,
  RUNTIME_EXECUTION_PIPELINE_ERROR_CODES,
  RUNTIME_EXECUTION_PIPELINE_STAGES,
  RUNTIME_EXECUTION_PIPELINE_VERSION,
  serializeRuntimeExecutionPipeline,
  validateRuntimeExecutionPipeline,
  type RuntimeExecutionPipeline,
} from "../../src/features/director-command";

function frozen<T>(value: T, seen = new WeakSet<object>()): T {
  if (value && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    for (const nested of Object.values(value)) frozen(nested, seen);
    Object.freeze(value);
  }
  return value;
}

const session = frozen({
  metadata: { executionId: "execution-4e3", correlationId: "correlation-4e3", executable: false as const, authoritative: false as const },
  references: {},
  architectureVersion: "runtime-execution-session/v1",
  executable: false as const,
  authoritative: false as const,
});
const stages = RUNTIME_EXECUTION_PIPELINE_STAGES.map((stage, ordinal) => ({
  stage,
  ordinal,
  metadata: { descriptor: stage.toLowerCase() },
  executable: false as const,
  authoritative: false as const,
}));
const input = {
  stages,
  metadata: {
    pipelineId: "pipeline-4e3",
    executionId: "execution-4e3",
    correlationId: "correlation-4e3",
    schemaVersion: "1.0.0",
    createdAt: "2026-07-24T15:00:00.000Z",
    metadata: { mode: "declarative" },
    executable: false as const,
    authoritative: false as const,
  },
  references: { session: session as never, executable: false as const, authoritative: false as const },
  executable: false as const,
  authoritative: false as const,
};

const pipeline = createRuntimeExecutionPipeline(input);
assert.equal(pipeline.architectureVersion, RUNTIME_EXECUTION_PIPELINE_VERSION);
assert.equal(validateRuntimeExecutionPipeline(pipeline).status, "valid");
assert.deepEqual(pipeline.stages.map(({ stage }) => stage), ["CREATED", "SESSION_BOUND", "VALIDATED", "READY", "DISPATCH_PENDING", "COMPLETED"]);
assert.deepEqual(RUNTIME_EXECUTION_PIPELINE_ERROR_CODES, ["INVALID_PIPELINE", "INVALID_STAGE", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_METADATA", "SERIALIZATION_FAILED", "IMMUTABILITY_VIOLATION"]);
assert.deepEqual(JSON.parse(serializeRuntimeExecutionPipeline(pipeline)), pipeline);
assert.equal(Object.isFrozen(pipeline), true);
assert.equal(Object.isFrozen(pipeline.stages), true);
assert.equal(Object.isFrozen(pipeline.stages[0]), true);
assert.equal(Object.isFrozen(pipeline.stages[0]!.metadata), true);
assert.equal(Object.isFrozen(pipeline.metadata), true);
assert.equal(Object.isFrozen(pipeline.references), true);
assert.equal(Object.isFrozen(pipeline.references.session), true);
assert.notEqual(pipeline, input);
assert.notEqual(pipeline.stages, stages);
assert.notEqual(pipeline.stages[0], stages[0]);
assert.notEqual(pipeline.metadata.metadata, input.metadata.metadata);
assert.notEqual(pipeline.references.session, session);

const duplicate = pipeline.stages.map((stage) => ({ ...stage }));
duplicate[1] = { ...duplicate[0]!, ordinal: 1 };
assert.equal(validateRuntimeExecutionPipeline(frozen({ ...pipeline, stages: duplicate }) as never).error?.code, "INVALID_STAGE");
assert.equal(validateRuntimeExecutionPipeline(frozen({ ...pipeline, stages: [...pipeline.stages].reverse() }) as never).error?.code, "INVALID_STAGE");
assert.equal(validateRuntimeExecutionPipeline(frozen({ ...pipeline, stages: pipeline.stages.map((stage, index) => index === 2 ? { ...stage, stage: "RUNNING" } : stage) }) as never).error?.code, "INVALID_STAGE");
assert.equal(validateRuntimeExecutionPipeline(frozen({ ...pipeline, architectureVersion: "other" }) as never).error?.code, "INVALID_PIPELINE");
assert.equal(validateRuntimeExecutionPipeline(frozen({ ...pipeline, metadata: { ...pipeline.metadata, pipelineId: "" } }) as never).error?.code, "INVALID_IDENTIFIER");
assert.equal(validateRuntimeExecutionPipeline(frozen({ ...pipeline, metadata: { ...pipeline.metadata, schemaVersion: "" } }) as never).error?.code, "INVALID_METADATA");
assert.equal(validateRuntimeExecutionPipeline(frozen({ ...pipeline, metadata: { ...pipeline.metadata, executionId: "other" } }) as never).error?.code, "INVALID_REFERENCE");
assert.equal(validateRuntimeExecutionPipeline({ ...pipeline } as RuntimeExecutionPipeline).error?.code, "IMMUTABILITY_VIOLATION");

assert.throws(() => createRuntimeExecutionPipeline({ ...input, stages: stages.map((stage, index) => index === 0 ? { ...stage, metadata: { callback: () => undefined } } : stage) } as never));
assert.throws(() => createRuntimeExecutionPipeline({ ...input, metadata: { ...input.metadata, metadata: { promise: Promise.resolve() } } } as never));
assert.throws(() => createRuntimeExecutionPipeline({ ...input, metadata: { ...input.metadata, metadata: { symbol: Symbol("x") } } } as never));
const cyclic: { self?: unknown } = {};
cyclic.self = cyclic;
assert.throws(() => createRuntimeExecutionPipeline({ ...input, metadata: { ...input.metadata, metadata: cyclic } } as never));
class DispatcherLike { readonly name = "dispatcher"; }
assert.throws(() => createRuntimeExecutionPipeline({ ...input, metadata: { ...input.metadata, metadata: { dispatcher: new DispatcherLike() } } } as never));
const sharedMutable = { label: "shared" };
assert.throws(() => createRuntimeExecutionPipeline({ ...input, metadata: { ...input.metadata, metadata: { first: sharedMutable, second: sharedMutable } } } as never));
assert.throws(() => { (pipeline.stages as unknown as object[]).push({}); });

const cyclicPipeline = { ...pipeline, metadata: { ...pipeline.metadata, metadata: {} as Record<string, unknown> } };
cyclicPipeline.metadata.metadata.self = cyclicPipeline.metadata.metadata;
frozen(cyclicPipeline);
assert.equal(validateRuntimeExecutionPipeline(cyclicPipeline as RuntimeExecutionPipeline).error?.code, "SERIALIZATION_FAILED");
assert.throws(() => serializeRuntimeExecutionPipeline(cyclicPipeline as RuntimeExecutionPipeline), /SERIALIZATION_FAILED/);

console.log("runtime execution pipeline checks passed");
