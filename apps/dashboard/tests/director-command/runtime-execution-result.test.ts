import assert from "node:assert/strict";
import {
  createRuntimeExecutionResult,
  RUNTIME_EXECUTION_OUTPUT_TYPES,
  RUNTIME_EXECUTION_RESULT_ERROR_CODES,
  RUNTIME_EXECUTION_RESULT_VERSION,
  RUNTIME_EXECUTION_STATUSES,
  serializeRuntimeExecutionResult,
  validateRuntimeExecutionResult,
  type RuntimeExecutionResult,
} from "../../src/features/director-command";

function frozen<T>(value: T, seen = new WeakSet<object>()): T {
  if (value && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    for (const nested of Object.values(value)) frozen(nested, seen);
    Object.freeze(value);
  }
  return value;
}

const invocation = frozen({
  plan: { invocationId: "invocation-4e6", executable: false as const, authoritative: false as const },
  metadata: { executionId: "execution-4e6", correlationId: "correlation-4e6", executable: false as const, authoritative: false as const },
  references: {},
  architectureVersion: "runtime-adapter-invocation-contract/v1",
  executable: false as const,
  authoritative: false as const,
});
const input = {
  resultId: "result-4e6",
  executionId: "execution-4e6",
  correlationId: "correlation-4e6",
  invocationId: "invocation-4e6",
  status: "SUCCESS" as const,
  output: { type: "STRUCTURED" as const, schemaId: "result-schema-4e6", mediaType: "application/json", data: { accepted: true }, metadata: { source: "adapter" }, executable: false as const, authoritative: false as const },
  timing: { startedAt: "2026-07-24T18:00:00.000Z", completedAt: "2026-07-24T18:00:01.000Z", durationMs: 1000, latencyMs: 20, executable: false as const, authoritative: false as const },
  metrics: { tokenCount: 12, payloadSizeBytes: 128, executionSizeBytes: 256, serializationSizeBytes: 192, executable: false as const, authoritative: false as const },
  references: { invocationContract: invocation as never, executable: false as const, authoritative: false as const },
  serialization: { format: "JSON" as const, schemaVersion: "1.0.0", encoding: "UTF-8" as const, mediaType: "application/json" as const, executable: false as const, authoritative: false as const },
  executable: false as const,
  authoritative: false as const,
};

const result = createRuntimeExecutionResult(input);
assert.equal(result.architectureVersion, RUNTIME_EXECUTION_RESULT_VERSION);
assert.equal(validateRuntimeExecutionResult(result).status, "valid");
assert.deepEqual(RUNTIME_EXECUTION_STATUSES, ["SUCCESS", "FAILED", "PARTIAL", "REJECTED", "TIMEOUT", "CANCELLED"]);
assert.deepEqual(RUNTIME_EXECUTION_OUTPUT_TYPES, ["STRUCTURED", "TEXT", "BINARY", "METADATA"]);
assert.deepEqual(RUNTIME_EXECUTION_RESULT_ERROR_CODES, ["INVALID_RESULT", "INVALID_STATUS", "INVALID_OUTPUT", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_TIMING", "INVALID_METRICS", "INVALID_SERIALIZATION", "IMMUTABILITY_VIOLATION"]);
assert.deepEqual(JSON.parse(serializeRuntimeExecutionResult(result)), result);
for (const value of [result, result.output, result.output.data, result.timing, result.metrics, result.references, result.references.invocationContract, result.serialization]) {
  assert.equal(Object.isFrozen(value), true);
}
assert.notEqual(result, input);
assert.notEqual(result.output, input.output);
assert.notEqual(result.output.data, input.output.data);
assert.notEqual(result.references.invocationContract, invocation);

assert.equal(validateRuntimeExecutionResult(frozen({ ...result, architectureVersion: "other" }) as never).error?.code, "INVALID_RESULT");
assert.equal(validateRuntimeExecutionResult(frozen({ ...result, status: "RUNNING" }) as never).error?.code, "INVALID_STATUS");
assert.equal(validateRuntimeExecutionResult(frozen({ ...result, output: { ...result.output, type: "CALLBACK" } }) as never).error?.code, "INVALID_OUTPUT");
assert.equal(validateRuntimeExecutionResult(frozen({ ...result, resultId: "" }) as never).error?.code, "INVALID_IDENTIFIER");
assert.equal(validateRuntimeExecutionResult(frozen({ ...result, timing: { ...result.timing, durationMs: -1 } }) as never).error?.code, "INVALID_TIMING");
assert.equal(validateRuntimeExecutionResult(frozen({ ...result, metrics: { ...result.metrics, tokenCount: -1 } }) as never).error?.code, "INVALID_METRICS");
assert.equal(validateRuntimeExecutionResult(frozen({ ...result, serialization: { ...result.serialization, format: "XML" } }) as never).error?.code, "INVALID_SERIALIZATION");
assert.equal(validateRuntimeExecutionResult(frozen({ ...result, invocationId: "other" }) as never).error?.code, "INVALID_REFERENCE");
assert.equal(validateRuntimeExecutionResult({ ...result } as RuntimeExecutionResult).error?.code, "IMMUTABILITY_VIOLATION");

assert.throws(() => createRuntimeExecutionResult({ ...input, output: { ...input.output, data: { callback: () => undefined } } } as never));
assert.throws(() => createRuntimeExecutionResult({ ...input, output: { ...input.output, data: Promise.resolve() } } as never));
assert.throws(() => createRuntimeExecutionResult({ ...input, output: { ...input.output, data: Symbol("x") } } as never));
const cyclic: { self?: unknown } = {};
cyclic.self = cyclic;
assert.throws(() => createRuntimeExecutionResult({ ...input, output: { ...input.output, data: cyclic } } as never));
class ProviderLike { readonly name = "provider"; }
assert.throws(() => createRuntimeExecutionResult({ ...input, output: { ...input.output, data: new ProviderLike() } } as never));
const sharedMutable = { label: "shared" };
assert.throws(() => createRuntimeExecutionResult({ ...input, output: { ...input.output, data: { first: sharedMutable, second: sharedMutable } } } as never));
assert.throws(() => { (result.output.metadata as unknown as { values: unknown[] }).values = []; });

console.log("runtime execution result checks passed");
