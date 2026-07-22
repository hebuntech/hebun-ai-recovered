import { evaluateCommandPermission } from "./permissions";
import type { DirectorCommandRegistry } from "./registry";
import type {
  CommandAuthorityContext,
  CommandRequest,
  CommandValidationResult,
} from "./types";
import { validText } from "./validation";

/**
 * Validates a command request against the registry and the presented authority.
 *
 * This is the last layer before a future executor, and it deliberately stops
 * short of one. An `accepted` result means the request is well-formed and
 * authorized; `executed` is always false because nothing can run yet.
 *
 * Validation is shape and authority only. It reads no dashboard snapshot, no
 * runtime state, and no storage, so it can never be the path by which a
 * command reaches the runtime.
 */
export function validateCommandRequest(input: {
  readonly registry: DirectorCommandRegistry;
  readonly request: CommandRequest;
  readonly authority: CommandAuthorityContext;
}): CommandValidationResult {
  const resolution = input.registry.resolve(input.request.commandId, input.request.version);
  if (resolution.status !== "resolved") {
    return Object.freeze({ status: "rejected", reasonCode: "UNKNOWN_COMMAND" });
  }
  const definition = resolution.command;

  if (input.request.targetSectionId !== definition.targetSectionId) {
    return Object.freeze({ status: "rejected", reasonCode: "INVALID_TARGET_SECTION" });
  }
  if (!validText(input.request.targetRecordId)) {
    return Object.freeze({ status: "rejected", reasonCode: "INVALID_TARGET_RECORD" });
  }

  const permission = evaluateCommandPermission(definition, input.authority);
  if (permission.status !== "granted") {
    return Object.freeze({ status: "rejected", reasonCode: permission.reasonCode });
  }

  return Object.freeze({
    status: "accepted",
    commandId: definition.commandId,
    definition,
    targetRecordId: input.request.targetRecordId,
    executed: false,
  });
}
