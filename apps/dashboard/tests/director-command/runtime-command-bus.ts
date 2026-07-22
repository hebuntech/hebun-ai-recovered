import assert from "node:assert/strict";
import {
  createCommandConfirmationModel,
  createDefaultCommandRegistry,
  CommandEnvelopeBus,
  serializeRuntimeCommandEnvelope,
  validateCommandRequest,
  type CommandAuthorityContext,
} from "../../src/features/director-command";

const registry = createDefaultCommandRegistry();
const authority: CommandAuthorityContext = Object.freeze({
  privilege: "high",
  capabilities: Object.freeze(["workflow.lifecycle"] as const),
  approvalGranted: true,
});

function acceptedRequest() {
  const validation = validateCommandRequest({
    registry,
    request: {
      commandId: "workflow.pause",
      version: "1.0.0",
      targetSectionId: "active-workflows",
      targetRecordId: "workflow-42",
    },
    authority,
  });
  assert.equal(validation.status, "accepted");
  return validation;
}

function bus(overrides: Partial<{ now: () => Date; createCorrelationId: () => string }> = {}) {
  return new CommandEnvelopeBus({
    now: () => new Date("2026-07-22T09:30:00.000Z"),
    createCorrelationId: () => "correlation-4b5-001",
    ...overrides,
  });
}

function input() {
  const validation = acceptedRequest();
  assert.equal(validation.status, "accepted");
  return {
    validation,
    confirmation: createCommandConfirmationModel(validation.definition),
    authority,
    origin: "director-dashboard" as const,
  };
}

/** The bus constructs the complete envelope from a prior immutable validation. */
function envelopeConstruction(): void {
  const envelope = bus().createEnvelope(input());
  const pause = registry.resolve("workflow.pause", "1.0.0");
  assert.equal(pause.status, "resolved");
  assert.deepEqual(envelope, {
    commandId: "workflow.pause",
    recordId: "workflow-42",
    sectionId: "active-workflows",
    metadata: {
      correlationId: "correlation-4b5-001",
      requestTimestamp: "2026-07-22T09:30:00.000Z",
      commandVersion: "1.0.0",
      requestOrigin: "director-dashboard",
    },
    confirmation: createCommandConfirmationModel(pause.status === "resolved" ? pause.command : undefined!),
    safety: {
      riskLevel: "medium",
      category: "operational",
      confirmationRequired: true,
      userImpact: "limited",
      systemImpact: "localized",
      estimatedEffect: "Holds one running workflow at its current step.",
      rollbackAvailability: "available",
      auditRequired: true,
    },
    authority: { privilege: "high", capabilities: ["workflow.lifecycle"], approvalGranted: true },
    executable: false,
    authoritative: false,
  });
}

/** Correlation and timestamp come only from explicit, deterministic inputs. */
function metadataGeneration(): void {
  const envelope = bus({
    createCorrelationId: () => "correlation-custom-7",
    now: () => new Date("2026-01-02T03:04:05.678Z"),
  }).createEnvelope(input());
  assert.equal(envelope.metadata.correlationId, "correlation-custom-7");
  assert.equal(envelope.metadata.requestTimestamp, "2026-01-02T03:04:05.678Z");
  assert.equal(envelope.metadata.commandVersion, "1.0.0");
  assert.equal(envelope.metadata.requestOrigin, "director-dashboard");
}

/** Every nested envelope snapshot is deeply immutable and isolated from input. */
function immutableSnapshots(): void {
  const request = input();
  const envelope = bus().createEnvelope(request);
  assert.equal(Object.isFrozen(envelope), true);
  assert.equal(Object.isFrozen(envelope.metadata), true);
  assert.equal(Object.isFrozen(envelope.confirmation), true);
  assert.equal(Object.isFrozen(envelope.confirmation.confirmationRequirements), true);
  assert.equal(Object.isFrozen(envelope.safety), true);
  assert.equal(Object.isFrozen(envelope.authority), true);
  assert.equal(Object.isFrozen(envelope.authority.capabilities), true);
  assert.notEqual(envelope.confirmation, request.confirmation);
  assert.notEqual(envelope.safety, request.validation.status === "accepted" && request.validation.definition.safety);
  assert.notEqual(envelope.authority, request.authority);
  assert.throws(() => {
    (envelope.metadata as unknown as { correlationId: string }).correlationId = "changed";
  });
  assert.throws(() => {
    (envelope.authority.capabilities as unknown as { push: (value: string) => void }).push("agent.lifecycle");
  });
}

/** Serialization is stable JSON data and cannot acquire behavior. */
function serialization(): void {
  const envelope = bus().createEnvelope(input());
  const serialized = serializeRuntimeCommandEnvelope(envelope);
  assert.deepEqual(JSON.parse(serialized), envelope);
  for (const forbidden of ["function", "http://", "https://", "Bearer ", "accessToken", "postgresql://"]) {
    assert.equal(serialized.includes(forbidden), false, `serialization must not contain ${forbidden}`);
  }
}

/** Reject malformed, unvalidated, or mismatched construction requests. */
function failClosedValidation(): void {
  const accepted = acceptedRequest();
  assert.equal(accepted.status, "accepted");
  const confirmation = createCommandConfirmationModel(accepted.definition);
  assert.throws(() => bus().createEnvelope({
    validation: { ...accepted, executed: true as never }, confirmation, authority, origin: "director-dashboard",
  }), TypeError);
  assert.throws(() => bus().createEnvelope({
    validation: accepted,
    confirmation: { ...confirmation, commandId: "agent.restart" },
    authority,
    origin: "director-dashboard",
  }), TypeError);
  assert.throws(() => bus({ createCorrelationId: () => "   " }).createEnvelope(input()), TypeError);
  assert.throws(() => bus({ now: () => new Date("invalid") }).createEnvelope(input()), TypeError);
  assert.throws(() => bus().createEnvelope({ ...input(), origin: "external" as never }), TypeError);
}

/** The bus has no execution, delivery, queue, or authority behavior. */
function busIsInert(): void {
  const instance = bus();
  assert.equal(Object.isFrozen(instance), true);
  for (const forbidden of ["dispatch", "execute", "enqueue", "queue", "send", "run", "invoke"]) {
    assert.equal(forbidden in instance, false, `bus must not expose ${forbidden}`);
  }
  const envelope = instance.createEnvelope(input());
  assert.equal(envelope.executable, false);
  assert.equal(envelope.authoritative, false);
  for (const value of Object.values(envelope)) assert.notEqual(typeof value, "function");
}

function main(): void {
  envelopeConstruction();
  metadataGeneration();
  immutableSnapshots();
  serialization();
  failClosedValidation();
  busIsInert();
  console.log("director command runtime bus checks passed");
}

main();
