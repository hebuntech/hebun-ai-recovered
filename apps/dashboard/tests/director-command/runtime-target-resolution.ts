import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CommandEnvelopeBus,
  RUNTIME_TARGET_RESOLUTION_MAPPING,
  RuntimeTargetResolver,
  createCommandConfirmationModel,
  createDefaultCommandRegistry,
  createRuntimeExecutionRequest,
  validateCommandRequest,
  validateRuntimeTargetResolutionResult,
} from "../../src/features/director-command";

const registry = createDefaultCommandRegistry();

function request(commandId = "monitoring.refresh") {
  const definition = registry.list().find((entry) => entry.commandId === commandId)!;
  const authority = Object.freeze({ privilege: "high" as const, capabilities: Object.freeze([definition.permission.capability]), approvalGranted: true });
  const validation = validateCommandRequest({
    registry,
    request: { commandId, version: definition.version, targetSectionId: definition.targetSectionId, targetRecordId: "target-4c2-001" },
    authority,
  });
  assert.equal(validation.status, "accepted");
  const envelope = new CommandEnvelopeBus({
    now: () => new Date("2026-07-29T11:00:00.000Z"), createCorrelationId: () => "correlation-4c2-001",
  }).createEnvelope({ validation, confirmation: createCommandConfirmationModel(validation.definition), authority, origin: "director-dashboard" });
  return createRuntimeExecutionRequest({ envelope, registry });
}

/** Every registry command has exactly one immutable static target mapping. */
function canonicalMapping(): void {
  assert.equal(Object.isFrozen(RUNTIME_TARGET_RESOLUTION_MAPPING), true);
  assert.deepEqual(Object.keys(RUNTIME_TARGET_RESOLUTION_MAPPING).sort(), registry.list().map(({ commandId }) => commandId).sort());
  for (const definition of registry.list()) {
    const mapping = RUNTIME_TARGET_RESOLUTION_MAPPING[definition.commandId];
    assert.equal(Object.isFrozen(mapping), true);
    assert.equal(mapping.requiredCapability, definition.permission.capability);
  }
  assert.throws(() => { (RUNTIME_TARGET_RESOLUTION_MAPPING as unknown as Record<string, unknown>)["agent.restart"] = {}; });
}

/** Resolution is deterministic, immutable, and uses no live Runtime lookup. */
function deterministicResolution(): void {
  const resolver = new RuntimeTargetResolver({ registry });
  const first = resolver.resolve(request());
  const second = resolver.resolve(request());
  assert.equal(first.status, "resolved");
  assert.equal(second.status, "resolved");
  assert.deepEqual(first, second);
  assert.equal(first.status === "resolved" && first.target.targetFamily, "monitoring");
  assert.equal(first.status === "resolved" && first.target.canonicalTargetId, "target-4c2-001");
  assert.equal(Object.isFrozen(first), true);
  assert.equal(first.status === "resolved" && Object.isFrozen(first.target), true);
  assert.equal(validateRuntimeTargetResolutionResult(first), true);
  assert.equal(JSON.stringify(first).includes("secret"), false);
}

/** Mutations are classified without becoming execution or authority decisions. */
function mutationRejections(): void {
  const resolver = new RuntimeTargetResolver({ registry });
  const original = request();
  const unresolved = Object.freeze({ ...original, target: Object.freeze({ ...original.target, targetId: "" }) });
  assert.equal(resolver.resolve(unresolved).status, "unresolved");

  const commandMismatch = Object.freeze({ ...original, target: Object.freeze({ ...original.target, kind: "workflow" as const }) });
  const commandResult = resolver.resolve(commandMismatch);
  assert.equal(commandResult.status, "invalid");
  assert.equal(commandResult.status === "invalid" && commandResult.error.code, "COMMAND_TARGET_CONFLICT");

  const capabilityMismatch = Object.freeze({ ...original, requiredRuntimeCapability: "workflow.lifecycle" as const });
  const capabilityResult = resolver.resolve(capabilityMismatch);
  assert.equal(capabilityResult.status, "invalid");
  assert.equal(capabilityResult.status === "invalid" && capabilityResult.error.code, "CAPABILITY_TARGET_CONFLICT");

  const unsupported = Object.freeze({ ...original, commandId: "unsupported.command" as never });
  assert.equal(resolver.resolve(unsupported).status, "unsupported");

  const invalidResult = Object.freeze({
    status: "resolved" as const,
    target: Object.freeze({ ...RUNTIME_TARGET_RESOLUTION_MAPPING["monitoring.refresh"], canonicalTargetId: "target-4c2-001", sectionId: "monitoring-summary", resolutionVersion: "1.0.0" as const, resolutionSource: "unresolved" as const, executable: false as const, authoritative: false as const }),
    executable: false as const,
    authoritative: false as const,
  });
  assert.equal(validateRuntimeTargetResolutionResult(invalidResult as never), false);
}

/** The resolution layer cannot depend on UI, Runtime implementation, data, or adapters. */
function boundaryContract(): void {
  const source = [
    "runtime-target-resolution.ts", "runtime-target-resolution-validator.ts", "runtime-target-resolver.ts",
  ].map((file) => readFileSync(`src/features/director-command/${file}`, "utf8")).join("\n");
  for (const forbidden of [
    "react", "next/", "postgres", "drizzle", "node:fs", "fetch(", "WebSocket", "setTimeout", "setInterval",
    "process.env", "eval(", "new Function", "../runtime-", "../memory", "../persistence", "provider", ".accept(", ".execute(",
  ]) {
    assert.equal(source.toLowerCase().includes(forbidden.toLowerCase()), false, `resolver must not depend on ${forbidden}`);
  }
}

function main(): void {
  canonicalMapping();
  deterministicResolution();
  mutationRejections();
  boundaryContract();
  console.log("runtime target resolution checks passed");
}

main();
