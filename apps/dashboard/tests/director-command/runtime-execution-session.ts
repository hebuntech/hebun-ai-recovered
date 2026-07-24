import assert from "node:assert/strict";
import {
  createRuntimeExecutionSession,
  RUNTIME_EXECUTION_SESSION_ERROR_CODES,
  RUNTIME_EXECUTION_SESSION_VERSION,
  serializeRuntimeExecutionSession,
  validateRuntimeExecutionSession,
  type RuntimeExecutionContext,
  type RuntimeExecutionSession,
} from "../../src/features/director-command";

function frozen<T>(value: T, seen = new WeakSet<object>()): T {
  if (value && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    for (const nested of Object.values(value)) frozen(nested, seen);
    Object.freeze(value);
  }
  return value;
}

const tenant = frozen({ tenantId: "tenant-4e2", tenantType: "organization" as const, metadata: {}, executable: false as const, authoritative: false as const });
const actor = frozen({ principalId: "actor-4e2", principalType: "human" as const, tenantId: "tenant-4e2", workspaceId: "workspace-4e2", metadata: {}, executable: false as const, authoritative: false as const });
const permit = frozen({
  identity: { permitId: "permit-4e2", correlationId: "correlation-4e2", executionId: "execution-4e2", executable: false as const, authoritative: false as const },
  references: { identity: { principal: actor, tenant } },
  executable: false as const,
  authoritative: false as const,
});
const runtimeEngine = frozen({
  permit,
  state: { value: "ready", executable: false as const, authoritative: false as const },
  configuration: {},
  metadata: {
    runtimeEngineId: "runtime-engine-4e2",
    permitId: "permit-4e2",
    correlationId: "correlation-4e2",
    executionId: "execution-4e2",
    executable: false as const,
    authoritative: false as const,
  },
  executable: false as const,
  authoritative: false as const,
});
const input = {
  metadata: {
    executionId: "execution-4e2",
    correlationId: "correlation-4e2",
    schemaVersion: "1.0.0",
    createdAt: "2026-07-24T14:00:00.000Z",
    requestMetadata: { requestId: "request-4e2", labels: ["declarative"] },
    traceMetadata: { traceId: "trace-4e2", parentSpanId: "span-parent", metadata: { sampled: true } },
    timingMetadata: { createdAt: "2026-07-24T14:00:00.000Z", requestedAt: "2026-07-24T13:59:59.000Z", metadata: { clock: "recorded" } },
    executable: false as const,
    authoritative: false as const,
  },
  references: {
    permit: permit as never,
    runtimeEngine: runtimeEngine as never,
    actor: actor as never,
    tenant: tenant as never,
    organization: tenant as never,
    executable: false as const,
    authoritative: false as const,
  },
  executable: false as const,
  authoritative: false as const,
};

const phase4cContext: RuntimeExecutionContext = { correlationId: "correlation-4c", requestTimestamp: "2026-07-24T13:00:00.000Z", requestOrigin: "director-dashboard" };
assert.equal(phase4cContext.correlationId, "correlation-4c");
const session = createRuntimeExecutionSession(input);
assert.equal(session.architectureVersion, RUNTIME_EXECUTION_SESSION_VERSION);
assert.equal(validateRuntimeExecutionSession(session).status, "valid");
assert.deepEqual(RUNTIME_EXECUTION_SESSION_ERROR_CODES, ["INVALID_SESSION", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_METADATA", "SERIALIZATION_FAILED", "IMMUTABILITY_VIOLATION"]);
assert.deepEqual(JSON.parse(serializeRuntimeExecutionSession(session)), session);
assert.equal(Object.isFrozen(session), true);
assert.equal(Object.isFrozen(session.metadata.requestMetadata), true);
assert.equal(Object.isFrozen(session.metadata.traceMetadata), true);
assert.equal(Object.isFrozen(session.metadata.traceMetadata.metadata), true);
assert.equal(Object.isFrozen(session.metadata.timingMetadata), true);
assert.equal(Object.isFrozen(session.references), true);
assert.equal(Object.isFrozen(session.references.permit), true);
assert.equal(Object.isFrozen(session.references.runtimeEngine), true);
assert.notEqual(session, input);
assert.notEqual(session.metadata, input.metadata);
assert.notEqual(session.metadata.requestMetadata, input.metadata.requestMetadata);
assert.notEqual(session.references.permit, permit);
assert.notEqual(session.references.runtimeEngine, runtimeEngine);

assert.equal(validateRuntimeExecutionSession(frozen({ ...session, architectureVersion: "other" }) as never).error?.code, "INVALID_SESSION");
assert.equal(validateRuntimeExecutionSession(frozen({ ...session, metadata: { ...session.metadata, executionId: "" } }) as never).error?.code, "INVALID_IDENTIFIER");
assert.equal(validateRuntimeExecutionSession(frozen({ ...session, metadata: { ...session.metadata, schemaVersion: "" } }) as never).error?.code, "INVALID_METADATA");
assert.equal(validateRuntimeExecutionSession(frozen({ ...session, metadata: { ...session.metadata, timingMetadata: { ...session.metadata.timingMetadata, createdAt: "other" } } }) as never).error?.code, "INVALID_METADATA");
assert.equal(validateRuntimeExecutionSession(frozen({ ...session, metadata: { ...session.metadata, correlationId: "other" } }) as never).error?.code, "INVALID_REFERENCE");
assert.equal(validateRuntimeExecutionSession(frozen({ ...session, references: { ...session.references, organization: { ...session.references.organization, tenantId: "other" } } }) as never).error?.code, "INVALID_REFERENCE");
assert.equal(validateRuntimeExecutionSession({ ...session } as RuntimeExecutionSession).error?.code, "IMMUTABILITY_VIOLATION");

assert.throws(() => createRuntimeExecutionSession({ ...input, metadata: { ...input.metadata, requestMetadata: { callback: () => undefined } } } as never));
assert.throws(() => createRuntimeExecutionSession({ ...input, metadata: { ...input.metadata, traceMetadata: { ...input.metadata.traceMetadata, metadata: { promise: Promise.resolve() } } } } as never));
assert.throws(() => createRuntimeExecutionSession({ ...input, metadata: { ...input.metadata, timingMetadata: { ...input.metadata.timingMetadata, metadata: { symbol: Symbol("x") } } } } as never));
const cyclic: { self?: unknown } = {};
cyclic.self = cyclic;
assert.throws(() => createRuntimeExecutionSession({ ...input, metadata: { ...input.metadata, requestMetadata: cyclic } } as never));
class ProviderLike { readonly name = "provider"; }
assert.throws(() => createRuntimeExecutionSession({ ...input, metadata: { ...input.metadata, requestMetadata: { provider: new ProviderLike() } } } as never));
const sharedMutable = { label: "shared" };
assert.throws(() => createRuntimeExecutionSession({ ...input, metadata: { ...input.metadata, requestMetadata: { first: sharedMutable, second: sharedMutable } } } as never));
assert.throws(() => { (session.metadata.requestMetadata.labels as unknown as string[]).push("mutation"); });

const cyclicSession = { ...session, metadata: { ...session.metadata, requestMetadata: {} as Record<string, unknown> } };
cyclicSession.metadata.requestMetadata.self = cyclicSession.metadata.requestMetadata;
frozen(cyclicSession);
assert.equal(validateRuntimeExecutionSession(cyclicSession as RuntimeExecutionSession).error?.code, "SERIALIZATION_FAILED");
assert.throws(() => serializeRuntimeExecutionSession(cyclicSession as RuntimeExecutionSession), /SERIALIZATION_FAILED/);

console.log("runtime execution session checks passed");
