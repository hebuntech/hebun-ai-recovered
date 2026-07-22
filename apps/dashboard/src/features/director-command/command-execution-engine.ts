import { evaluateCommandPermission } from "./permissions";
import type { DirectorCommandRegistry } from "./registry";
import { createCommandConfirmationModel } from "./safety";
import type { RuntimeCommandEnvelope } from "./runtime-command-bus";
import { deepFreeze, validText } from "./validation";

export const COMMAND_EXECUTION_ERROR_CODES = [
  "INVALID_ENVELOPE",
  "UNKNOWN_COMMAND",
  "ENVELOPE_MISMATCH",
  "SAFETY_MISMATCH",
  "CONFIRMATION_MISMATCH",
  "CAPABILITY_NOT_GRANTED",
  "INSUFFICIENT_PRIVILEGE",
  "APPROVAL_REQUIRED",
  "CONFIRMATION_REQUIRED",
  "NOT_IMPLEMENTED",
  "ADAPTER_FAILURE",
  "INVALID_ADAPTER_RESULT",
] as const;

export type CommandExecutionErrorCode = (typeof COMMAND_EXECUTION_ERROR_CODES)[number];

export interface CommandExecutionError {
  readonly code: CommandExecutionErrorCode;
  readonly message: string;
}

export type CommandExecutionAdapterResult =
  | { readonly status: "accepted" }
  | { readonly status: "blocked"; readonly error: CommandExecutionError }
  | { readonly status: "not_implemented"; readonly error: CommandExecutionError };

/** The only boundary through which a future Runtime Authority may be reached. */
export interface CommandExecutionAdapter {
  execute(envelope: RuntimeCommandEnvelope): CommandExecutionAdapterResult;
}

export type CommandExecutionResult =
  | {
      readonly status: "accepted";
      readonly commandId: RuntimeCommandEnvelope["commandId"];
      readonly correlationId: string;
    }
  | {
      readonly status: "rejected" | "blocked" | "not_implemented";
      readonly commandId: RuntimeCommandEnvelope["commandId"];
      readonly correlationId: string;
      readonly error: CommandExecutionError;
    };

function error(code: CommandExecutionErrorCode, message: string): CommandExecutionError {
  return deepFreeze({ code, message });
}

/** Deterministic placeholder until a Runtime Authority adapter is introduced. */
export const NOT_IMPLEMENTED_COMMAND_EXECUTION_ADAPTER: CommandExecutionAdapter = Object.freeze({
  execute: () => deepFreeze({
    status: "not_implemented" as const,
    error: error("NOT_IMPLEMENTED", "No Runtime Authority adapter has been introduced."),
  }),
});

function result(
  status: CommandExecutionResult["status"],
  envelope: RuntimeCommandEnvelope,
  executionError?: CommandExecutionError,
): CommandExecutionResult {
  const base = {
    commandId: envelope.commandId,
    correlationId: envelope.metadata.correlationId,
  };
  return executionError
    ? deepFreeze({ ...base, status, error: { ...executionError } })
    : deepFreeze({ ...base, status: "accepted" as const });
}

function isCompleteEnvelope(envelope: RuntimeCommandEnvelope): boolean {
  return (
    Object.isFrozen(envelope) &&
    Object.isFrozen(envelope.metadata) &&
    Object.isFrozen(envelope.confirmation) &&
    Object.isFrozen(envelope.confirmation.confirmationRequirements) &&
    Object.isFrozen(envelope.safety) &&
    Object.isFrozen(envelope.authority) &&
    Object.isFrozen(envelope.authority.capabilities) &&
    envelope.executable === false &&
    envelope.authoritative === false &&
    validText(envelope.recordId) &&
    validText(envelope.sectionId) &&
    validText(envelope.metadata.correlationId) &&
    validText(envelope.metadata.commandVersion) &&
    !Number.isNaN(Date.parse(envelope.metadata.requestTimestamp))
  );
}

function isAdapterResult(value: CommandExecutionAdapterResult): boolean {
  if (value.status === "accepted") return true;
  return (
    (value.status === "blocked" || value.status === "not_implemented") &&
    typeof value.error?.code === "string" &&
    (COMMAND_EXECUTION_ERROR_CODES as readonly string[]).includes(value.error.code) &&
    validText(value.error.message)
  );
}

/**
 * Validates immutable envelopes and delegates only through its injected
 * adapter. It does not import dashboard, React, Runtime, provider, memory, or
 * persistence code, and it never builds or transports an envelope itself.
 */
export class CommandExecutionEngine {
  readonly #registry: DirectorCommandRegistry;
  readonly #adapter: CommandExecutionAdapter;

  constructor(input: { readonly registry: DirectorCommandRegistry; readonly adapter?: CommandExecutionAdapter }) {
    this.#registry = input.registry;
    this.#adapter = input.adapter ?? NOT_IMPLEMENTED_COMMAND_EXECUTION_ADAPTER;
    Object.freeze(this);
  }

  execute(envelope: RuntimeCommandEnvelope): CommandExecutionResult {
    if (!isCompleteEnvelope(envelope)) {
      return result("rejected", envelope, error("INVALID_ENVELOPE", "Envelope must be complete and deeply immutable."));
    }

    const resolution = this.#registry.resolve(envelope.commandId, envelope.metadata.commandVersion);
    if (resolution.status !== "resolved") {
      return result("rejected", envelope, error("UNKNOWN_COMMAND", "Envelope command and version are not registered."));
    }
    const definition = resolution.command;
    if (envelope.sectionId !== definition.targetSectionId) {
      return result("rejected", envelope, error("ENVELOPE_MISMATCH", "Envelope target does not match the registered command."));
    }
    if (JSON.stringify(envelope.safety) !== JSON.stringify(definition.safety)) {
      return result("rejected", envelope, error("SAFETY_MISMATCH", "Envelope safety snapshot does not match the registered command."));
    }
    if (JSON.stringify(envelope.confirmation) !== JSON.stringify(createCommandConfirmationModel(definition))) {
      return result("rejected", envelope, error("CONFIRMATION_MISMATCH", "Envelope confirmation snapshot does not match the registered command."));
    }

    const permission = evaluateCommandPermission(definition, envelope.authority);
    if (permission.status === "denied") {
      switch (permission.reasonCode) {
        case "CAPABILITY_NOT_GRANTED":
        case "INSUFFICIENT_PRIVILEGE":
        case "APPROVAL_REQUIRED":
          return result("blocked", envelope, error(permission.reasonCode, "Envelope authority does not meet the command requirement."));
        default:
          return result("rejected", envelope, error("INVALID_ENVELOPE", "Envelope permission state is invalid."));
      }
    }
    if (definition.safety.confirmationRequired) {
      return result("blocked", envelope, error("CONFIRMATION_REQUIRED", "This command requires an explicit future confirmation."));
    }

    try {
      const adapterResult = this.#adapter.execute(envelope);
      if (!isAdapterResult(adapterResult)) {
        return result("rejected", envelope, error("INVALID_ADAPTER_RESULT", "Adapter returned an invalid execution result."));
      }
      return adapterResult.status === "accepted"
        ? result("accepted", envelope)
        : result(adapterResult.status, envelope, adapterResult.error);
    } catch {
      return result("blocked", envelope, error("ADAPTER_FAILURE", "Adapter failed without completing a command."));
    }
  }
}
