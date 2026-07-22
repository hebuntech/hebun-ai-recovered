import assert from "node:assert/strict";
import {
  appendCommandAuditEvent,
  CommandAuditEventBuilder,
  CommandEnvelopeBus,
  CommandExecutionEngine,
  createCommandAuditTimeline,
  createCommandConfirmationModel,
  createDefaultCommandRegistry,
  serializeCommandAuditTimeline,
  type CommandAuthorityContext,
  validateCommandRequest,
} from "../../src/features/director-command";

const registry = createDefaultCommandRegistry();
const authority: CommandAuthorityContext = Object.freeze({
  privilege: "high",
  capabilities: Object.freeze(["observability.reevaluate"] as const),
  approvalGranted: true,
});

function envelope() {
  const validation = validateCommandRequest({
    registry,
    request: { commandId: "monitoring.refresh", version: "1.0.0", targetSectionId: "monitoring-summary", targetRecordId: "record-4b7" },
    authority,
  });
  assert.equal(validation.status, "accepted");
  return new CommandEnvelopeBus({
    now: () => new Date("2026-07-22T11:00:00.000Z"),
    createCorrelationId: () => "correlation-4b7-001",
  }).createEnvelope({
    validation,
    confirmation: createCommandConfirmationModel(validation.definition),
    authority,
    origin: "director-dashboard",
  });
}

function builder(time = "2026-07-22T11:01:00.000Z", id = "audit-4b7-001") {
  return new CommandAuditEventBuilder({
    now: () => new Date(time),
    createEventId: () => id,
  });
}

/** Requested events contain all command snapshots without an execution attempt. */
function requestedEvent(): void {
  const event = builder().requested(envelope());
  const monitoringRefresh = registry.resolve("monitoring.refresh", "1.0.0");
  assert.equal(monitoringRefresh.status, "resolved");
  assert.deepEqual(event, {
    eventId: "audit-4b7-001",
    eventType: "command_requested",
    correlationId: "correlation-4b7-001",
    commandId: "monitoring.refresh",
    recordId: "record-4b7",
    sectionId: "monitoring-summary",
    timestamp: "2026-07-22T11:01:00.000Z",
    executionResult: { status: "not_attempted" },
    safety: {
      riskLevel: "low", category: "observability", confirmationRequired: false,
      userImpact: "none", systemImpact: "none",
      estimatedEffect: "Recomputes monitoring aggregates from already collected signals.",
      rollbackAvailability: "not-applicable", auditRequired: false,
    },
    confirmation: createCommandConfirmationModel(monitoringRefresh.status === "resolved" ? monitoringRefresh.command : undefined!),
    authority: { privilege: "high", capabilities: ["observability.reevaluate"], approvalGranted: true },
    commandVersion: "1.0.0",
    origin: "director-dashboard",
  });
}

/** Result statuses map to the canonical audit event types. */
function resultEventMapping(): void {
  const commandEnvelope = envelope();
  const notImplemented = new CommandExecutionEngine({ registry }).execute(commandEnvelope);
  const event = builder("2026-07-22T11:02:00.000Z", "audit-4b7-002").fromExecutionResult(commandEnvelope, notImplemented);
  assert.equal(event.eventType, "command_not_implemented");
  assert.equal(event.executionResult.status, "not_implemented");
  assert.equal(event.correlationId, commandEnvelope.metadata.correlationId);
}

/** Events and all snapshots are deeply immutable and isolated from inputs. */
function immutableEvents(): void {
  const commandEnvelope = envelope();
  const event = builder().requested(commandEnvelope);
  for (const value of [event, event.executionResult, event.safety, event.confirmation, event.confirmation.confirmationRequirements, event.authority, event.authority.capabilities]) {
    assert.equal(Object.isFrozen(value), true);
  }
  assert.notEqual(event.safety, commandEnvelope.safety);
  assert.notEqual(event.confirmation, commandEnvelope.confirmation);
  assert.notEqual(event.authority, commandEnvelope.authority);
  assert.throws(() => { (event as unknown as { eventId: string }).eventId = "changed"; });
  assert.throws(() => { (event.authority.capabilities as unknown as { push: (value: string) => void }).push("agent.lifecycle"); });
}

/** Functional append is ordered, append-only, and leaves all prior history intact. */
function appendOnlyTimeline(): void {
  const first = builder("2026-07-22T11:01:00.000Z", "audit-4b7-001").requested(envelope());
  const second = builder("2026-07-22T11:02:00.000Z", "audit-4b7-002").requested(envelope());
  const empty = createCommandAuditTimeline();
  const once = appendCommandAuditEvent(empty, first);
  const twice = appendCommandAuditEvent(once, second);
  assert.equal(empty.entries.length, 0);
  assert.equal(once.entries.length, 1);
  assert.equal(twice.entries.length, 2);
  assert.deepEqual(twice.entries.map((entry) => entry.position), [0, 1]);
  assert.deepEqual(twice.entries.map((entry) => entry.event.eventId), ["audit-4b7-001", "audit-4b7-002"]);
  assert.equal(Object.isFrozen(twice), true);
  assert.equal(Object.isFrozen(twice.entries), true);
  assert.equal(Object.isFrozen(twice.entries[0]), true);
  assert.throws(() => { (twice.entries as unknown as { pop: () => void }).pop(); });
  const earlier = builder("2026-07-22T11:00:59.000Z", "audit-4b7-earlier").requested(envelope());
  assert.throws(() => appendCommandAuditEvent(twice, earlier), TypeError);
}

/** Serialization remains deterministic JSON and contains no transport details. */
function serialization(): void {
  const event = builder().requested(envelope());
  const timeline = appendCommandAuditEvent(createCommandAuditTimeline(), event);
  const first = serializeCommandAuditTimeline(timeline);
  const second = serializeCommandAuditTimeline(timeline);
  assert.equal(first, second);
  assert.deepEqual(JSON.parse(first), timeline);
  for (const forbidden of ["function", "http://", "https://", "postgresql://", "accessToken", "providerPayload"]) {
    assert.equal(first.includes(forbidden), false, `serialization must not contain ${forbidden}`);
  }
}

/** Mismatched results and mutable history inputs fail closed. */
function rejectsInvalidInputs(): void {
  const commandEnvelope = envelope();
  const result = new CommandExecutionEngine({ registry }).execute(commandEnvelope);
  const mismatch = Object.freeze({ ...result, correlationId: "other" });
  assert.throws(() => builder().fromExecutionResult(commandEnvelope, mismatch), TypeError);
  assert.throws(() => appendCommandAuditEvent({ entries: [], appendOnly: true, authoritative: false }, builder().requested(commandEnvelope)), TypeError);
}

function main(): void {
  requestedEvent();
  resultEventMapping();
  immutableEvents();
  appendOnlyTimeline();
  serialization();
  rejectsInvalidInputs();
  console.log("director command history and audit checks passed");
}

main();
