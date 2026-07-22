import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CommandEnvelopeBus,
  RuntimeExecutionGateway,
  UNRESOLVED_RUNTIME_EXECUTION_AUTHORITY,
  createCommandConfirmationModel,
  createDefaultCommandRegistry,
  createRuntimeExecutionAdapterResult,
  createRuntimeExecutionRequest,
  validateCommandRequest,
} from "../../src/features/director-command";

const registry = createDefaultCommandRegistry();

function envelope(commandId = "monitoring.refresh") {
  const authority = Object.freeze({ privilege: "high" as const, capabilities: Object.freeze(["observability.reevaluate"] as const), approvalGranted: true });
  const validation = validateCommandRequest({
    registry,
    request: { commandId, version: "1.0.0", targetSectionId: "monitoring-summary", targetRecordId: "record-4c1" },
    authority,
  });
  assert.equal(validation.status, "accepted");
  return new CommandEnvelopeBus({
    now: () => new Date("2026-07-29T10:00:00.000Z"),
    createCorrelationId: () => "correlation-4c1-001",
  }).createEnvelope({ validation, confirmation: createCommandConfirmationModel(validation.definition), authority, origin: "director-dashboard" });
}

function request() {
  return createRuntimeExecutionRequest({ envelope: envelope(), registry });
}

/** Canonical request copies envelope data and never becomes executable. */
function immutableRequest(): void {
  const value = request();
  assert.equal(Object.isFrozen(value), true);
  assert.equal(Object.isFrozen(value.target), true);
  assert.equal(Object.isFrozen(value.executionPolicy), true);
  assert.equal(Object.isFrozen(value.envelope), true);
  assert.equal(value.target.kind, "monitoring");
  assert.equal(value.requiredRuntimeCapability, "observability.reevaluate");
  assert.equal(value.executable, false);
  assert.equal(value.authoritative, false);
  assert.throws(() => { (value as unknown as { commandId: string }).commandId = "agent.restart"; });
}

/** Director permission is never interchangeable with Runtime execution authority. */
function authoritySeparationFailsClosed(): void {
  const value = request();
  assert.equal(value.envelope.authority.privilege, "high");
  const result = new RuntimeExecutionGateway({ registry }).validate({ request: value, authority: UNRESOLVED_RUNTIME_EXECUTION_AUTHORITY });
  assert.equal(result.status, "blocked");
  assert.equal(result.lifecycle, "authority_required");
  assert.equal(result.error.code, "RUNTIME_AUTHORITY_UNAVAILABLE");
  assert.equal(Object.isFrozen(result), true);
}

/** Critical boundary mutations are deterministically rejected before any adapter exists. */
function mutationRejections(): void {
  const gateway = new RuntimeExecutionGateway({ registry });
  const original = request();
  const mutable = { ...original };
  assert.equal(gateway.validate({ request: mutable as typeof original }).error.code, "MUTABLE_EXECUTION_REQUEST");

  const targetMismatch = Object.freeze({ ...original, target: Object.freeze({ ...original.target, kind: "workflow" as const }) });
  assert.equal(gateway.validate({ request: targetMismatch }).error.code, "TARGET_KIND_MISMATCH");

  const versionMismatch = Object.freeze({ ...original, envelope: Object.freeze({ ...original.envelope, metadata: Object.freeze({ ...original.envelope.metadata, commandVersion: "9.9.9" }) }) });
  assert.equal(gateway.validate({ request: versionMismatch }).error.code, "COMMAND_VERSION_MISMATCH");

  const missingPolicy = Object.freeze({ ...original, executionPolicy: Object.freeze({ ...original.executionPolicy, failClosed: false as const }) });
  assert.equal(gateway.validate({ request: missingPolicy as unknown as typeof original }).error.code, "EXECUTION_POLICY_MISSING");

  const adapterMismatch = Object.freeze({ ...original, adapterFamily: "workflow-runtime" as const });
  assert.equal(gateway.validate({ request: adapterMismatch }).error.code, "ADAPTER_FAMILY_MISMATCH");
}

/** Adapter outcomes are non-authoritative, immutable, and contain no execution claim. */
function adapterResultContract(): void {
  const result = createRuntimeExecutionAdapterResult({
    status: "unsupported",
    error: { code: "UNSUPPORTED_COMMAND_FAMILY", message: "No Runtime adapter is available." },
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.error), true);
  assert.equal(result.executed, false);
  assert.equal(result.authoritative, false);
  assert.equal(JSON.stringify(result).includes("secret"), false);
}

/** The new architecture remains isolated from UI, Runtime, data, and transport. */
function boundaryContract(): void {
  const source = [
    "runtime-execution-contracts.ts", "runtime-execution-validator.ts", "runtime-execution-gateway.ts",
  ].map((file) => readFileSync(`src/features/director-command/${file}`, "utf8")).join("\n");
  for (const forbidden of [
    "react", "next/", "postgres", "drizzle", "node:fs", "fetch(", "WebSocket", "setTimeout", "setInterval",
    "process.env", "eval(", "new Function", "../runtime-", "../memory", "../persistence", "provider",
  ]) {
    assert.equal(source.toLowerCase().includes(forbidden.toLowerCase()), false, `architecture must not depend on ${forbidden}`);
  }
  assert.equal(source.includes(".accept("), false, "gateway must not invoke adapters");
}

function main(): void {
  immutableRequest();
  authoritySeparationFailsClosed();
  mutationRejections();
  adapterResultContract();
  boundaryContract();
  console.log("runtime execution architecture checks passed");
}

main();
