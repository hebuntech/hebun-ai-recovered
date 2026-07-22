import type { NavigableSectionId } from "../director-dashboard-navigation";

/**
 * Canonical Director command identifiers.
 *
 * These are declarations only. Nothing in this feature executes a command,
 * calls runtime, or produces a side effect — the executor does not exist yet.
 */
export const DIRECTOR_COMMAND_IDS = [
  "agent.restart",
  "workflow.retry",
  "workflow.pause",
  "workflow.resume",
  "diagnostics.re-evaluate",
  "monitoring.refresh",
] as const;

export type DirectorCommandId = (typeof DIRECTOR_COMMAND_IDS)[number];

/** What kind of change a command would make once an executor exists. */
export const COMMAND_CATEGORIES = ["lifecycle", "recovery", "observability"] as const;
export type CommandCategory = (typeof COMMAND_CATEGORIES)[number];

/** Blast radius of the command, used to drive approval requirements. */
export const COMMAND_RISK_LEVELS = ["low", "medium", "high"] as const;
export type CommandRiskLevel = (typeof COMMAND_RISK_LEVELS)[number];

/**
 * Privilege vocabulary, matching the tiers the governance surface already
 * uses, so a future authority model does not have to reconcile two scales.
 */
export const COMMAND_PRIVILEGES = ["baseline", "medium", "high"] as const;
export type CommandPrivilege = (typeof COMMAND_PRIVILEGES)[number];

export const COMMAND_CAPABILITIES = [
  "agent.lifecycle",
  "workflow.lifecycle",
  "workflow.recovery",
  "observability.reevaluate",
] as const;
export type CommandCapability = (typeof COMMAND_CAPABILITIES)[number];

export interface CommandPermission {
  readonly capability: CommandCapability;
  readonly minimumPrivilege: CommandPrivilege;
  /** Whether a governance approval gate must clear before any future execution. */
  readonly requiresApproval: boolean;
}

/**
 * An immutable command declaration. Data only — it carries no validate,
 * simulate, or execute function, so a definition can never be invoked.
 */
export interface DirectorCommandDefinition {
  readonly commandId: DirectorCommandId;
  readonly version: string;
  readonly label: string;
  readonly description: string;
  readonly category: CommandCategory;
  readonly risk: CommandRiskLevel;
  /** Dashboard section whose records this command would target. */
  readonly targetSectionId: NavigableSectionId;
  readonly permission: CommandPermission;
  /** Always false: no executor exists in this phase. */
  readonly executable: false;
}

export interface CommandRequest {
  readonly commandId: string;
  readonly version: string;
  readonly targetSectionId: string;
  readonly targetRecordId: string;
}

/** Authority presented with a request. Declarative; never looked up here. */
export interface CommandAuthorityContext {
  readonly privilege: CommandPrivilege;
  readonly capabilities: readonly CommandCapability[];
  readonly approvalGranted?: boolean;
}

export const COMMAND_REJECTION_CODES = [
  "UNKNOWN_COMMAND",
  "INVALID_TARGET_SECTION",
  "INVALID_TARGET_RECORD",
  "CAPABILITY_NOT_GRANTED",
  "INSUFFICIENT_PRIVILEGE",
  "APPROVAL_REQUIRED",
] as const;
export type CommandRejectionCode = (typeof COMMAND_REJECTION_CODES)[number];

/**
 * The outcome of validating a request. `accepted` means the request is
 * well-formed and authorized — never that anything ran. No executor exists.
 */
export type CommandValidationResult =
  | {
      readonly status: "accepted";
      readonly commandId: DirectorCommandId;
      readonly definition: DirectorCommandDefinition;
      readonly targetRecordId: string;
      readonly executed: false;
    }
  | { readonly status: "rejected"; readonly reasonCode: CommandRejectionCode };
