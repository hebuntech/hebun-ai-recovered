import type { DirectorCommandDefinition, CommandSafetyRiskLevel } from "./types";
import { deepFreeze } from "./validation";

export interface CommandConfirmationModel {
  readonly commandId: DirectorCommandDefinition["commandId"];
  readonly title: string;
  readonly summary: string;
  readonly warningText: string;
  readonly confirmationRequirements: readonly string[];
  readonly auditRequirement: string;
  /** A model may describe a future action, but it cannot invoke one. */
  readonly executable: false;
  readonly authoritative: false;
}

const warningByRisk: Readonly<Record<CommandSafetyRiskLevel, string>> = Object.freeze({
  informational: "Informational command metadata only; no action can be taken here.",
  low: "Review the estimated effect before a future executor is introduced.",
  medium: "This command could affect an active operational record; verify its target before any future execution.",
  high: "This command could materially affect an active operation; explicit confirmation and governance review are required.",
  critical: "This command could have critical impact; it requires explicit confirmation, governance approval, and an audit record.",
});

/**
 * Produces the confirmation information for a registered command.
 *
 * This is deliberately a pure projection of immutable registry metadata. It
 * does not inspect a record, read authority, contact runtime, or provide an
 * execution handle. A future executor would consume this model separately.
 */
export function createCommandConfirmationModel(definition: DirectorCommandDefinition): CommandConfirmationModel {
  const safety = definition.safety;
  const confirmationRequirements = [
    safety.confirmationRequired
      ? "Explicit user confirmation is required before any future execution."
      : "No additional user confirmation is declared.",
    definition.permission.requiresApproval
      ? "Governance approval is required before any future execution."
      : "No governance approval is declared.",
    `Rollback availability: ${safety.rollbackAvailability}.`,
  ];

  return deepFreeze({
    commandId: definition.commandId,
    title: `Confirm ${definition.label}`,
    summary: definition.description,
    warningText: warningByRisk[safety.riskLevel],
    confirmationRequirements,
    auditRequirement: safety.auditRequired
      ? "An audit record is required before any future execution."
      : "No audit record is declared.",
    executable: false as const,
    authoritative: false as const,
  });
}
