import assert from "node:assert/strict";
import {
  createRuntimeAdapterInvocationContract,
  RUNTIME_ADAPTER_INVOCATION_CONTRACT_VERSION,
  RUNTIME_ADAPTER_INVOCATION_ERROR_CODES,
  RUNTIME_ADAPTER_INVOCATION_TARGET_CATEGORIES,
  serializeRuntimeAdapterInvocationContract,
  validateRuntimeAdapterInvocationContract,
  type RuntimeAdapterInvocationContract,
} from "../../src/features/director-command";

function frozen<T>(value: T, seen = new WeakSet<object>()): T {
  if (value && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    for (const nested of Object.values(value)) frozen(nested, seen);
    Object.freeze(value);
  }
  return value;
}

const dispatcher = frozen({
  plan: {
    planId: "dispatch-plan-4e5",
    commandId: "command-4e5",
    primaryTargetId: "target-4e5",
    targets: [{ targetId: "target-4e5", category: "ADAPTER", handlerId: "handler-4e5", metadata: {}, executable: false as const, authoritative: false as const }],
    executable: false as const,
    authoritative: false as const,
  },
  metadata: { dispatcherId: "dispatcher-4e5", executionId: "execution-4e5", correlationId: "correlation-4e5", executable: false as const, authoritative: false as const },
  references: {},
  architectureVersion: "runtime-command-dispatcher/v1",
  executable: false as const,
  authoritative: false as const,
});
const input = {
  plan: {
    invocationId: "invocation-4e5",
    target: { targetId: "target-4e5", category: "LOCAL" as const, adapterId: "adapter-4e5", handlerId: "handler-4e5", metadata: { family: "local" }, executable: false as const, authoritative: false as const },
    payloadDescriptor: { schemaId: "payload-schema-4e5", payloadType: "command_descriptor", metadata: { content: "metadata-only" }, executable: false as const, authoritative: false as const },
    serializationDescriptor: { format: "JSON" as const, schemaVersion: "1.0.0", encoding: "UTF-8" as const, metadata: { transport: false }, executable: false as const, authoritative: false as const },
    executable: false as const,
    authoritative: false as const,
  },
  metadata: {
    contractId: "contract-4e5",
    executionId: "execution-4e5",
    correlationId: "correlation-4e5",
    schemaVersion: "1.0.0",
    createdAt: "2026-07-24T17:00:00.000Z",
    metadata: { mode: "presentation-only" },
    executable: false as const,
    authoritative: false as const,
  },
  references: { dispatcher: dispatcher as never, executable: false as const, authoritative: false as const },
  executable: false as const,
  authoritative: false as const,
};

const contract = createRuntimeAdapterInvocationContract(input);
assert.equal(contract.architectureVersion, RUNTIME_ADAPTER_INVOCATION_CONTRACT_VERSION);
assert.equal(validateRuntimeAdapterInvocationContract(contract).status, "valid");
assert.deepEqual(RUNTIME_ADAPTER_INVOCATION_TARGET_CATEGORIES, ["LOCAL", "REMOTE", "MCP", "SYSTEM", "INTERNAL", "EXTERNAL"]);
assert.deepEqual(RUNTIME_ADAPTER_INVOCATION_ERROR_CODES, ["INVALID_INVOCATION_CONTRACT", "INVALID_INVOCATION_TARGET", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_METADATA", "INVALID_PAYLOAD_DESCRIPTOR", "SERIALIZATION_FAILED", "IMMUTABILITY_VIOLATION"]);
assert.deepEqual(JSON.parse(serializeRuntimeAdapterInvocationContract(contract)), contract);
assert.equal(Object.isFrozen(contract), true);
assert.equal(Object.isFrozen(contract.plan), true);
assert.equal(Object.isFrozen(contract.plan.target), true);
assert.equal(Object.isFrozen(contract.plan.payloadDescriptor), true);
assert.equal(Object.isFrozen(contract.plan.serializationDescriptor), true);
assert.equal(Object.isFrozen(contract.metadata), true);
assert.equal(Object.isFrozen(contract.references), true);
assert.equal(Object.isFrozen(contract.references.dispatcher), true);
assert.notEqual(contract, input);
assert.notEqual(contract.plan, input.plan);
assert.notEqual(contract.plan.target, input.plan.target);
assert.notEqual(contract.plan.payloadDescriptor.metadata, input.plan.payloadDescriptor.metadata);
assert.notEqual(contract.references.dispatcher, dispatcher);

assert.equal(validateRuntimeAdapterInvocationContract(frozen({ ...contract, architectureVersion: "other" }) as never).error?.code, "INVALID_INVOCATION_CONTRACT");
assert.equal(validateRuntimeAdapterInvocationContract(frozen({ ...contract, plan: { ...contract.plan, target: { ...contract.plan.target, category: "HTTP" } } }) as never).error?.code, "INVALID_INVOCATION_TARGET");
assert.equal(validateRuntimeAdapterInvocationContract(frozen({ ...contract, plan: { ...contract.plan, payloadDescriptor: { ...contract.plan.payloadDescriptor, schemaId: "" } } }) as never).error?.code, "INVALID_PAYLOAD_DESCRIPTOR");
assert.equal(validateRuntimeAdapterInvocationContract(frozen({ ...contract, plan: { ...contract.plan, serializationDescriptor: { ...contract.plan.serializationDescriptor, format: "XML" } } }) as never).error?.code, "INVALID_PAYLOAD_DESCRIPTOR");
assert.equal(validateRuntimeAdapterInvocationContract(frozen({ ...contract, plan: { ...contract.plan, invocationId: "" } }) as never).error?.code, "INVALID_IDENTIFIER");
assert.equal(validateRuntimeAdapterInvocationContract(frozen({ ...contract, metadata: { ...contract.metadata, schemaVersion: "" } }) as never).error?.code, "INVALID_METADATA");
assert.equal(validateRuntimeAdapterInvocationContract(frozen({ ...contract, plan: { ...contract.plan, target: { ...contract.plan.target, handlerId: "other" } } }) as never).error?.code, "INVALID_REFERENCE");
assert.equal(validateRuntimeAdapterInvocationContract({ ...contract } as RuntimeAdapterInvocationContract).error?.code, "IMMUTABILITY_VIOLATION");

assert.throws(() => createRuntimeAdapterInvocationContract({ ...input, plan: { ...input.plan, payloadDescriptor: { ...input.plan.payloadDescriptor, metadata: { callback: () => undefined } } } } as never));
assert.throws(() => createRuntimeAdapterInvocationContract({ ...input, metadata: { ...input.metadata, metadata: { promise: Promise.resolve() } } } as never));
assert.throws(() => createRuntimeAdapterInvocationContract({ ...input, metadata: { ...input.metadata, metadata: { symbol: Symbol("x") } } } as never));
const cyclic: { self?: unknown } = {};
cyclic.self = cyclic;
assert.throws(() => createRuntimeAdapterInvocationContract({ ...input, metadata: { ...input.metadata, metadata: cyclic } } as never));
class ProviderLike { readonly name = "provider"; }
assert.throws(() => createRuntimeAdapterInvocationContract({ ...input, metadata: { ...input.metadata, metadata: { provider: new ProviderLike() } } } as never));
const sharedMutable = { label: "shared" };
assert.throws(() => createRuntimeAdapterInvocationContract({ ...input, metadata: { ...input.metadata, metadata: { first: sharedMutable, second: sharedMutable } } } as never));
assert.throws(() => { (contract.plan.payloadDescriptor.metadata as unknown as { values: unknown[] }).values = []; });

const cyclicContract = { ...contract, metadata: { ...contract.metadata, metadata: {} as Record<string, unknown> } };
cyclicContract.metadata.metadata.self = cyclicContract.metadata.metadata;
frozen(cyclicContract);
assert.equal(validateRuntimeAdapterInvocationContract(cyclicContract as RuntimeAdapterInvocationContract).error?.code, "SERIALIZATION_FAILED");
assert.throws(() => serializeRuntimeAdapterInvocationContract(cyclicContract as RuntimeAdapterInvocationContract), /SERIALIZATION_FAILED/);

console.log("runtime adapter invocation contract checks passed");
