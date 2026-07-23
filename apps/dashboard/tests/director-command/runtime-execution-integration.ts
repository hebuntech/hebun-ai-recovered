import assert from "node:assert/strict";
import { createRuntimeExecutionIntegrationInput, createRuntimeOutcomeProjection, createRuntimeRecoveryPlan, createRuntimeSafetyPolicy, integrateRuntimeExecution, validateRuntimeSafetyPolicy } from "../../src/features/director-command";

const safetyPolicy = createRuntimeSafetyPolicy({ classification: "elevated", cancellation: "non_cancellable", rollback: "none" });
const identity = { executionId: "execution-4c8", correlationId: "correlation-4c8", commandId: "agent.restart" as const, commandVersion: "1.0.0", targetIdentity: "target-4c8", adapterFamily: "agent" as const, capability: "agent.lifecycle" as const, creationTimestamp: "2026-07-23T12:00:00.000Z", architectureVersion: "1.0.0" as const, executable: false as const, authoritative: false as const };
const base = createRuntimeExecutionIntegrationInput({
  integrationId: "integration-4c8",
  request: { status: "blocked" as const, lifecycle: "authority_required" as const, request: {} as never, error: {} as never },
  target: { status: "resolved" as const, target: { targetFamily: "agent" as const, canonicalTargetId: "target-4c8", sectionId: "agents", commandFamily: "agent" as const, requiredCapability: "agent.lifecycle" as const, resolutionVersion: "1.0.0" as const, resolutionSource: "registry" as const, executable: false as const, authoritative: false as const }, executable: false as const, authoritative: false as const },
  adapter: { status: "selected" as const, descriptor: { adapterFamily: "agent" as const, adapterId: "metadata-only", supportedTargetFamily: "agent" as const, supportedCommandFamilies: ["agent"], capabilityRequirements: ["agent.lifecycle"], adapterVersion: "1.0.0" as const, availability: "available" as const, architectureSource: "static-architecture" as const, executable: false as const, authoritative: false as const }, executable: false as const, authoritative: false as const },
  identity,
  idempotency: { commandId: "agent.restart" as const, commandVersion: "1.0.0", targetIdentity: "target-4c8", adapterFamily: "agent" as const, capability: "agent.lifecycle" as const, executable: false as const, authoritative: false as const },
  readiness: { replay: "unique" as const, freshness: "fresh" as const, conflict: "none" as const, lease: { required: true as const, scope: "target" as const, state: "unacquired" as const, executable: false as const, authoritative: false as const }, executable: false as const, authoritative: false as const },
  safetyPolicy,
  safety: validateRuntimeSafetyPolicy(safetyPolicy),
  outcome: createRuntimeOutcomeProjection({ executionId: "execution-4c8", logicalId: "logical-4c8", targetId: "target-4c8", safetyClassification: "elevated", readiness: "authority_required", timestamp: "2026-07-23T12:00:00.000Z", outcome: "blocked", classification: "indeterminate", projectionTargets: ["audit"], executable: false, authoritative: false }),
  recovery: createRuntimeRecoveryPlan({ executionId: "execution-4c8", logicalId: "logical-4c8", targetId: "target-4c8", outcome: "failed", failure: "transient", eligibility: "authority_required", strategy: "retry", compensation: "none", rollback: "none", manualIntervention: { required: false, reasonCode: "metadata-only", operatorRole: "director", escalationClass: "none", instructions: ["No recovery is performed."], acknowledgmentRequired: false }, terminality: "non_terminal", executable: false, authoritative: false }),
  executable: false,
  authoritative: false,
});
const authorityRequired = integrateRuntimeExecution(base);
assert.equal(authorityRequired.status, "authority_required");
assert.deepEqual(authorityRequired.unresolvedGates, ["runtime_authority"]);
assert.equal(Object.isFrozen(authorityRequired.unresolvedGates), true);
assert.equal(JSON.parse(JSON.stringify(authorityRequired)).executable, false);
assert.equal(integrateRuntimeExecution(createRuntimeExecutionIntegrationInput({ ...base, adapter: { status: "unavailable" as const, error: { code: "ADAPTER_UNAVAILABLE" as const, message: "Unavailable" }, executable: false as const, authoritative: false as const } })).unresolvedGates[0], "adapter_unavailable");
assert.equal(integrateRuntimeExecution(createRuntimeExecutionIntegrationInput({ ...base, outcome: { ...base.outcome, outcome: "completed" } })).status, "invalid");
assert.throws(() => { (base as unknown as { authoritative: boolean }).authoritative = true; });
assert.throws(() => createRuntimeExecutionIntegrationInput({ ...base, recovery: { ...base.recovery, callback: () => undefined } } as never));
console.log("runtime execution integration checks passed");
