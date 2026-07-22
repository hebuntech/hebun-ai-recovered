import type { CommandConfirmationModel } from "./safety";
import type {
  CommandAuthorityContext,
  CommandCapability,
  CommandPrivilege,
  CommandSafetyMetadata,
  CommandValidationResult,
  DirectorCommandId,
} from "./types";
import { deepFreeze, validText } from "./validation";

export const COMMAND_REQUEST_ORIGINS = ["director-dashboard"] as const;
export type CommandRequestOrigin = (typeof COMMAND_REQUEST_ORIGINS)[number];

export interface RuntimeCommandEnvelopeMetadata {
  readonly correlationId: string;
  readonly requestTimestamp: string;
  readonly commandVersion: string;
  readonly requestOrigin: CommandRequestOrigin;
}

export interface RuntimeCommandEnvelope {
  readonly commandId: DirectorCommandId;
  readonly recordId: string;
  readonly sectionId: string;
  readonly metadata: RuntimeCommandEnvelopeMetadata;
  readonly confirmation: CommandConfirmationModel;
  readonly safety: CommandSafetyMetadata;
  readonly authority: CommandAuthorityContext;
  /** This transport object cannot perform work. */
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeCommandBusRequest {
  readonly validation: CommandValidationResult;
  readonly confirmation: CommandConfirmationModel;
  readonly authority: CommandAuthorityContext;
  readonly origin: CommandRequestOrigin;
}

export interface RuntimeCommandBusDependencies {
  readonly now: () => Date;
  readonly createCorrelationId: () => string;
}

function cloneAuthority(authority: CommandAuthorityContext): CommandAuthorityContext {
  return {
    privilege: authority.privilege as CommandPrivilege,
    capabilities: [...authority.capabilities] as readonly CommandCapability[],
    ...(authority.approvalGranted === undefined ? {} : { approvalGranted: authority.approvalGranted }),
  };
}

function cloneConfirmation(model: CommandConfirmationModel): CommandConfirmationModel {
  return {
    ...model,
    confirmationRequirements: [...model.confirmationRequirements],
  };
}

function cloneSafety(safety: CommandSafetyMetadata): CommandSafetyMetadata {
  return { ...safety };
}

/**
 * Pure command transport. It converts a prior validation result into an
 * immutable envelope and deliberately owns no delivery, queue, or runtime
 * integration. Time and correlation generation are injected to keep it
 * deterministic under test.
 */
export class CommandEnvelopeBus {
  readonly #now: () => Date;
  readonly #createCorrelationId: () => string;

  constructor(dependencies: RuntimeCommandBusDependencies) {
    this.#now = dependencies.now;
    this.#createCorrelationId = dependencies.createCorrelationId;
    Object.freeze(this);
  }

  createEnvelope(input: RuntimeCommandBusRequest): RuntimeCommandEnvelope {
    if (
      input.validation.status !== "accepted" ||
      input.validation.executed !== false ||
      !Object.isFrozen(input.validation) ||
      !Object.isFrozen(input.validation.definition) ||
      !Object.isFrozen(input.confirmation) ||
      input.confirmation.commandId !== input.validation.commandId ||
      !(COMMAND_REQUEST_ORIGINS as readonly string[]).includes(input.origin)
    ) {
      throw new TypeError("Invalid immutable command bus request.");
    }

    const correlationId = this.#createCorrelationId();
    if (!validText(correlationId)) throw new TypeError("Invalid command correlation id.");

    const requestedAt = this.#now();
    if (!(requestedAt instanceof Date) || Number.isNaN(requestedAt.valueOf())) {
      throw new TypeError("Invalid command request timestamp.");
    }

    const definition = input.validation.definition;
    return deepFreeze({
      commandId: definition.commandId,
      recordId: input.validation.targetRecordId,
      sectionId: definition.targetSectionId,
      metadata: {
        correlationId,
        requestTimestamp: requestedAt.toISOString(),
        commandVersion: definition.version,
        requestOrigin: input.origin,
      },
      confirmation: cloneConfirmation(input.confirmation),
      safety: cloneSafety(definition.safety),
      authority: cloneAuthority(input.authority),
      executable: false as const,
      authoritative: false as const,
    });
  }
}

/** JSON is the only serialization surface; it carries no behavior or target. */
export function serializeRuntimeCommandEnvelope(envelope: RuntimeCommandEnvelope): string {
  return JSON.stringify(envelope);
}
