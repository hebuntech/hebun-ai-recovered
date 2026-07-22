import type { CommandExecutionResult } from "./command-execution-engine";
import type { CommandConfirmationModel } from "./safety";
import type { RuntimeCommandEnvelope } from "./runtime-command-bus";
import type { CommandAuthorityContext, CommandSafetyMetadata, DirectorCommandId } from "./types";
import { deepFreeze, validText } from "./validation";

export const COMMAND_AUDIT_EVENT_TYPES = [
  "command_requested",
  "command_validated",
  "command_blocked",
  "command_rejected",
  "command_not_implemented",
] as const;

export type CommandAuditEventType = (typeof COMMAND_AUDIT_EVENT_TYPES)[number];

export type CommandAuditExecutionResult = CommandExecutionResult | { readonly status: "not_attempted" };

export interface CommandAuditEvent {
  readonly eventId: string;
  readonly eventType: CommandAuditEventType;
  readonly correlationId: string;
  readonly commandId: DirectorCommandId;
  readonly recordId: string;
  readonly sectionId: string;
  readonly timestamp: string;
  readonly executionResult: CommandAuditExecutionResult;
  readonly safety: CommandSafetyMetadata;
  readonly confirmation: CommandConfirmationModel;
  readonly authority: CommandAuthorityContext;
  readonly commandVersion: string;
  readonly origin: RuntimeCommandEnvelope["metadata"]["requestOrigin"];
}

export interface CommandHistoryEntry {
  readonly position: number;
  readonly event: CommandAuditEvent;
}

export interface CommandAuditTimeline {
  readonly entries: readonly CommandHistoryEntry[];
  readonly appendOnly: true;
  readonly authoritative: false;
}

export interface CommandAuditEventBuilderDependencies {
  readonly now: () => Date;
  readonly createEventId: () => string;
}

function cloneConfirmation(model: CommandConfirmationModel): CommandConfirmationModel {
  return { ...model, confirmationRequirements: [...model.confirmationRequirements] };
}

function cloneAuthority(authority: CommandAuthorityContext): CommandAuthorityContext {
  return {
    privilege: authority.privilege,
    capabilities: [...authority.capabilities],
    ...(authority.approvalGranted === undefined ? {} : { approvalGranted: authority.approvalGranted }),
  };
}

function cloneResult(result: CommandAuditExecutionResult): CommandAuditExecutionResult {
  return result.status === "not_attempted"
    ? { status: "not_attempted" }
    : "error" in result
      ? { ...result, error: { ...result.error } }
      : { ...result };
}

function typeFor(result: CommandExecutionResult): CommandAuditEventType {
  switch (result.status) {
    case "accepted": return "command_validated";
    case "blocked": return "command_blocked";
    case "rejected": return "command_rejected";
    case "not_implemented": return "command_not_implemented";
  }
}

function completeEnvelope(envelope: RuntimeCommandEnvelope): boolean {
  return (
    Object.isFrozen(envelope) &&
    Object.isFrozen(envelope.metadata) &&
    Object.isFrozen(envelope.confirmation) &&
    Object.isFrozen(envelope.confirmation.confirmationRequirements) &&
    Object.isFrozen(envelope.safety) &&
    Object.isFrozen(envelope.authority) &&
    Object.isFrozen(envelope.authority.capabilities) &&
    validText(envelope.recordId) &&
    validText(envelope.sectionId) &&
    validText(envelope.metadata.correlationId) &&
    validText(envelope.metadata.commandVersion)
  );
}

/** Creates immutable audit events only; it does not retain, transmit, or persist them. */
export class CommandAuditEventBuilder {
  readonly #now: () => Date;
  readonly #createEventId: () => string;

  constructor(dependencies: CommandAuditEventBuilderDependencies) {
    this.#now = dependencies.now;
    this.#createEventId = dependencies.createEventId;
    Object.freeze(this);
  }

  requested(envelope: RuntimeCommandEnvelope): CommandAuditEvent {
    return this.#create(envelope, "command_requested", { status: "not_attempted" });
  }

  fromExecutionResult(envelope: RuntimeCommandEnvelope, result: CommandExecutionResult): CommandAuditEvent {
    if (!Object.isFrozen(result)) throw new TypeError("Execution result must be immutable.");
    if (result.commandId !== envelope.commandId || result.correlationId !== envelope.metadata.correlationId) {
      throw new TypeError("Execution result does not belong to the envelope.");
    }
    return this.#create(envelope, typeFor(result), result);
  }

  #create(
    envelope: RuntimeCommandEnvelope,
    eventType: CommandAuditEventType,
    executionResult: CommandAuditExecutionResult,
  ): CommandAuditEvent {
    if (!completeEnvelope(envelope)) throw new TypeError("Audit event requires a complete immutable envelope.");
    const eventId = this.#createEventId();
    if (!validText(eventId)) throw new TypeError("Invalid command audit event id.");
    const timestamp = this.#now();
    if (!(timestamp instanceof Date) || Number.isNaN(timestamp.valueOf())) {
      throw new TypeError("Invalid command audit timestamp.");
    }
    return deepFreeze({
      eventId,
      eventType,
      correlationId: envelope.metadata.correlationId,
      commandId: envelope.commandId,
      recordId: envelope.recordId,
      sectionId: envelope.sectionId,
      timestamp: timestamp.toISOString(),
      executionResult: cloneResult(executionResult),
      safety: { ...envelope.safety },
      confirmation: cloneConfirmation(envelope.confirmation),
      authority: cloneAuthority(envelope.authority),
      commandVersion: envelope.metadata.commandVersion,
      origin: envelope.metadata.requestOrigin,
    });
  }
}

/** Empty immutable timeline. All later entries arrive through functional append. */
export function createCommandAuditTimeline(): CommandAuditTimeline {
  return deepFreeze({ entries: [], appendOnly: true as const, authoritative: false as const });
}

/**
 * Returns a new timeline with one final event. Existing entries are copied,
 * never mutated, reordered, removed, or retained in a mutable store.
 */
export function appendCommandAuditEvent(
  timeline: CommandAuditTimeline,
  event: CommandAuditEvent,
): CommandAuditTimeline {
  if (!Object.isFrozen(timeline) || !Object.isFrozen(timeline.entries) || !Object.isFrozen(event)) {
    throw new TypeError("Audit timeline and event must be immutable.");
  }
  const last = timeline.entries.at(-1)?.event;
  if (last && event.timestamp < last.timestamp) {
    throw new TypeError("Audit event timestamp cannot precede existing history.");
  }
  return deepFreeze({
    entries: [...timeline.entries, { position: timeline.entries.length, event }],
    appendOnly: true as const,
    authoritative: false as const,
  });
}

/** Deterministic JSON serialization only; no write, transport, or storage behavior exists. */
export function serializeCommandAuditTimeline(timeline: CommandAuditTimeline): string {
  return JSON.stringify(timeline);
}
