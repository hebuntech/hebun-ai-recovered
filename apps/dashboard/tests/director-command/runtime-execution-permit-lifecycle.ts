import assert from "node:assert/strict";
import { createRuntimeExecutionPermitLifecycle, RUNTIME_PERMIT_LIFECYCLE_STATES, validateRuntimeExecutionPermitLifecycle, validateRuntimeExecutionPermitLifecycleResult } from "../../src/features/director-command";

function frozen<T>(value: T): T { if (value && typeof value === "object") { for (const nested of Object.values(value as object)) frozen(nested); Object.freeze(value); } return value; }
const permit = frozen({ identity: { permitId: "permit-4d7", executable: false as const, authoritative: false as const }, status: "issued" as const, executable: false as const, authoritative: false as const });
const input = { permit: permit as never, state: { value: "issued" as const, recordedAt: "2026-07-23T12:00:00.000Z", executable: false as const, authoritative: false as const }, transitions: [], metadata: { lifecycleId: "lifecycle-4d7", permitId: "permit-4d7", schemaVersion: "1.0.0", version: "1.0.0", metadata: { labels: ["declarative"] }, executable: false as const, authoritative: false as const }, executable: false as const, authoritative: false as const };
const lifecycle = createRuntimeExecutionPermitLifecycle(input);
const expired = createRuntimeExecutionPermitLifecycle({ ...input, state: { ...input.state, value: "expired" }, transitions: [{ from: "issued" as const, to: "expired" as const, occurredAt: "2026-07-23T13:00:00.000Z", reference: "expiry-1", metadata: {}, executable: false as const, authoritative: false as const }] });
assert.equal(Object.isFrozen(lifecycle), true); assert.equal(Object.isFrozen(lifecycle.transitions), true); assert.equal(validateRuntimeExecutionPermitLifecycle(lifecycle).status, "valid"); assert.equal(validateRuntimeExecutionPermitLifecycle(expired).status, "valid"); assert.equal(validateRuntimeExecutionPermitLifecycleResult(lifecycle).authoritative, false); assert.notEqual(lifecycle.metadata.metadata, input.metadata.metadata); assert.deepEqual(RUNTIME_PERMIT_LIFECYCLE_STATES, ["issued", "expired", "revoked"]);
assert.equal(validateRuntimeExecutionPermitLifecycle(createRuntimeExecutionPermitLifecycle({ ...input, transitions: [{ ...expired.transitions[0]!, to: "issued" }] })).error?.code, "INVALID_TRANSITION");
const terminalPermit = frozen({ ...permit, status: "expired" as const });
assert.equal(validateRuntimeExecutionPermitLifecycle(createRuntimeExecutionPermitLifecycle({ ...input, permit: terminalPermit as never, state: { ...input.state, value: "revoked" }, transitions: [{ ...expired.transitions[0]!, from: "expired", to: "revoked" }] })).error?.code, "TERMINAL_STATE");
assert.equal(validateRuntimeExecutionPermitLifecycle(createRuntimeExecutionPermitLifecycle({ ...input, metadata: { ...input.metadata, permitId: "other" } })).error?.code, "INVALID_REFERENCE");
assert.throws(() => createRuntimeExecutionPermitLifecycle({ ...input, transitions: [{ ...expired.transitions[0]!, metadata: { callback: () => undefined } }] } as never));
assert.throws(() => createRuntimeExecutionPermitLifecycle({ ...input, metadata: { ...input.metadata, metadata: { promise: Promise.resolve() } } } as never));
assert.throws(() => createRuntimeExecutionPermitLifecycle({ ...input, metadata: { ...input.metadata, metadata: { symbol: Symbol("x") } } } as never));
const cyclic: { self?: unknown } = {}; cyclic.self = cyclic;
assert.throws(() => createRuntimeExecutionPermitLifecycle({ ...input, metadata: { ...input.metadata, metadata: cyclic } } as never));
class ProviderLike { readonly name = "provider"; }
assert.throws(() => createRuntimeExecutionPermitLifecycle({ ...input, metadata: { ...input.metadata, metadata: { provider: new ProviderLike() } } } as never));
assert.throws(() => { (lifecycle.metadata.metadata.labels as unknown as string[]).push("mutation"); });
console.log("runtime execution permit lifecycle checks passed");
