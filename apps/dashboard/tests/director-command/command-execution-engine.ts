import assert from "node:assert/strict";
import {
  CommandEnvelopeBus,
  CommandExecutionEngine,
  createCommandConfirmationModel,
  createDefaultCommandRegistry,
  NOT_IMPLEMENTED_COMMAND_EXECUTION_ADAPTER,
  type CommandExecutionAdapter,
  type CommandExecutionAdapterResult,
  type CommandAuthorityContext,
  validateCommandRequest,
} from "../../src/features/director-command";

const registry = createDefaultCommandRegistry();
const authority: CommandAuthorityContext = Object.freeze({
  privilege: "high",
  capabilities: Object.freeze(["observability.reevaluate"] as const),
  approvalGranted: true,
});

function envelope(commandId = "monitoring.refresh") {
  const validation = validateCommandRequest({
    registry,
    request: {
      commandId,
      version: "1.0.0",
      targetSectionId: commandId === "monitoring.refresh" ? "monitoring-summary" : "active-workflows",
      targetRecordId: "record-4b6",
    },
    authority,
  });
  assert.equal(validation.status, "accepted");
  const confirmation = createCommandConfirmationModel(validation.definition);
  return new CommandEnvelopeBus({
    now: () => new Date("2026-07-22T10:00:00.000Z"),
    createCorrelationId: () => "correlation-4b6-001",
  }).createEnvelope({ validation, confirmation, authority, origin: "director-dashboard" });
}

function engine(adapter?: CommandExecutionAdapter): CommandExecutionEngine {
  return new CommandExecutionEngine({ registry, adapter });
}

/** A complete low-risk envelope reaches the default deterministic adapter. */
function defaultNotImplemented(): void {
  const result = engine().execute(envelope());
  assert.deepEqual(result, {
    status: "not_implemented",
    commandId: "monitoring.refresh",
    correlationId: "correlation-4b6-001",
    error: {
      code: "NOT_IMPLEMENTED",
      message: "No Runtime Authority adapter has been introduced.",
    },
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.status === "not_implemented" ? result.error : undefined), true);
}

/** The only adapter operation is invoked once for an eligible envelope. */
function adapterDelegation(): void {
  let received = 0;
  const adapter: CommandExecutionAdapter = {
    execute(value): CommandExecutionAdapterResult {
      received += 1;
      assert.equal(Object.isFrozen(value), true);
      return { status: "accepted" };
    },
  };
  const result = engine(adapter).execute(envelope());
  assert.equal(received, 1);
  assert.deepEqual(result, {
    status: "accepted",
    commandId: "monitoring.refresh",
    correlationId: "correlation-4b6-001",
  });
  assert.equal(Object.isFrozen(result), true);
}

/** Safety requirements block before the adapter can observe the envelope. */
function executionEligibility(): void {
  const highAuthority: CommandAuthorityContext = Object.freeze({
    privilege: "high",
    capabilities: Object.freeze(["workflow.lifecycle"] as const),
    approvalGranted: true,
  });
  const validation = validateCommandRequest({
    registry,
    request: { commandId: "workflow.pause", version: "1.0.0", targetSectionId: "active-workflows", targetRecordId: "workflow-4b6" },
    authority: highAuthority,
  });
  assert.equal(validation.status, "accepted");
  const protectedEnvelope = new CommandEnvelopeBus({
    now: () => new Date("2026-07-22T10:00:00.000Z"),
    createCorrelationId: () => "correlation-4b6-protected",
  }).createEnvelope({
    validation,
    confirmation: createCommandConfirmationModel(validation.definition),
    authority: highAuthority,
    origin: "director-dashboard",
  });
  let calls = 0;
  const result = engine({ execute: () => { calls += 1; return { status: "accepted" }; } }).execute(protectedEnvelope);
  assert.equal(result.status, "blocked");
  assert.equal(result.status === "blocked" && result.error.code, "CONFIRMATION_REQUIRED");
  assert.equal(calls, 0);
}

/** Any immutable-envelope integrity violation is rejected before delegation. */
function rejectsInvalidEnvelope(): void {
  const original = envelope();
  const invalid = Object.freeze({ ...original, sectionId: "active-workflows" });
  let calls = 0;
  const result = engine({ execute: () => { calls += 1; return { status: "accepted" }; } }).execute(invalid);
  assert.equal(result.status, "rejected");
  assert.equal(result.status === "rejected" && result.error.code, "ENVELOPE_MISMATCH");
  assert.equal(calls, 0);
}

/** Registry, safety, and confirmation snapshots cannot be substituted. */
function rejectsSnapshotMismatch(): void {
  const original = envelope();
  const alteredSafety = Object.freeze({ ...original, safety: Object.freeze({ ...original.safety, auditRequired: true }) });
  const safetyResult = engine().execute(alteredSafety);
  assert.equal(safetyResult.status, "rejected");
  assert.equal(safetyResult.status === "rejected" && safetyResult.error.code, "SAFETY_MISMATCH");

  const alteredConfirmation = Object.freeze({
    ...original,
    confirmation: Object.freeze({ ...original.confirmation, title: "Changed" }),
  });
  const confirmationResult = engine().execute(alteredConfirmation);
  assert.equal(confirmationResult.status, "rejected");
  assert.equal(confirmationResult.status === "rejected" && confirmationResult.error.code, "CONFIRMATION_MISMATCH");
}

/** Invalid or throwing adapters are isolated into typed results. */
function adapterIsolation(): void {
  const invalid = engine({ execute: () => ({ status: "not_implemented", error: { code: "NOPE" as never, message: "bad" } }) }).execute(envelope());
  assert.equal(invalid.status, "rejected");
  assert.equal(invalid.status === "rejected" && invalid.error.code, "INVALID_ADAPTER_RESULT");

  const failing = engine({ execute: () => { throw new Error("adapter exploded"); } }).execute(envelope());
  assert.equal(failing.status, "blocked");
  assert.equal(failing.status === "blocked" && failing.error.code, "ADAPTER_FAILURE");
}

/** The default adapter is an inert deterministic stub. */
function defaultAdapterContract(): void {
  const result = NOT_IMPLEMENTED_COMMAND_EXECUTION_ADAPTER.execute(envelope());
  assert.equal(result.status, "not_implemented");
  assert.equal(result.status === "not_implemented" && result.error.code, "NOT_IMPLEMENTED");
  assert.equal(Object.isFrozen(NOT_IMPLEMENTED_COMMAND_EXECUTION_ADAPTER), true);
  assert.equal(Object.isFrozen(result), true);
}

function main(): void {
  defaultNotImplemented();
  adapterDelegation();
  executionEligibility();
  rejectsInvalidEnvelope();
  rejectsSnapshotMismatch();
  adapterIsolation();
  defaultAdapterContract();
  console.log("director command execution engine checks passed");
}

main();
