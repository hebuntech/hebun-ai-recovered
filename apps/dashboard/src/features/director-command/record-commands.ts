import type { RecordDetailView } from "../director-dashboard-navigation";
import { evaluateCommandPermission } from "./permissions";
import type { DirectorCommandRegistry } from "./registry";
import type {
  CommandAuthorityContext,
  CommandCapability,
  CommandCategory,
  CommandPrivilege,
  DirectorCommandId,
} from "./types";
import { deepFreeze } from "./validation";

/** How a command may be presented. None of these states permit execution. */
export const COMMAND_AVAILABILITY_STATES = [
  "available",
  "permission-required",
  "approval-required",
  "disabled",
  "unsupported",
] as const;

export type CommandAvailabilityState = (typeof COMMAND_AVAILABILITY_STATES)[number];

export const COMMAND_DISABLED_REASONS = [
  "NO_RECORD_STATUS",
  "CAPABILITY_NOT_GRANTED",
  "INSUFFICIENT_PRIVILEGE",
  "APPROVAL_REQUIRED",
] as const;

export type CommandDisabledReason = (typeof COMMAND_DISABLED_REASONS)[number];

/**
 * A single command as it would be shown against a record. Data only: it holds
 * no handler, no callback, and no target beyond the record identifier.
 */
export interface CommandPresentation {
  readonly commandId: DirectorCommandId;
  readonly label: string;
  readonly category: CommandCategory;
  readonly requiredCapability: CommandCapability;
  readonly requiredPrivilege: CommandPrivilege;
  readonly approvalRequired: boolean;
  readonly availability: CommandAvailabilityState;
  /** Stable code explaining a non-available state. Absent when available. */
  readonly disabledReason?: CommandDisabledReason;
}

export interface RecordCommandView {
  readonly sectionId: string;
  readonly recordId: string;
  readonly recordStatus: string;
  /**
   * `unsupported` when the record's section declares no commands at all
   * (platform status and runtime status today), otherwise `available`.
   * This describes discoverability, never runnability.
   */
  readonly state: "available" | "unsupported";
  readonly commands: readonly CommandPresentation[];
  /** Always false: no executor exists. */
  readonly executable: false;
  readonly authoritative: false;
}

/**
 * The record's status is the only applicability signal any read model carries.
 * When it is unreadable the command is disabled rather than guessed at — no
 * per-command state machine is invented here.
 */
function statusIsReadable(recordStatus: string): boolean {
  return recordStatus.trim() !== "" && recordStatus !== "unknown";
}

function presentation(
  command: ReturnType<DirectorCommandRegistry["list"]>[number],
  recordStatus: string,
  authority: CommandAuthorityContext,
): CommandPresentation {
  const base = {
    commandId: command.commandId,
    label: command.label,
    category: command.category,
    requiredCapability: command.permission.capability,
    requiredPrivilege: command.permission.minimumPrivilege,
    approvalRequired: command.permission.requiresApproval,
  } as const;

  if (!statusIsReadable(recordStatus)) {
    return { ...base, availability: "disabled", disabledReason: "NO_RECORD_STATUS" };
  }

  const decision = evaluateCommandPermission(command, authority);
  if (decision.status === "granted") return { ...base, availability: "available" };
  // The permission layer can only deny for these three reasons; anything else
  // would be a contract change and is refused rather than shown as available.
  switch (decision.reasonCode) {
    case "APPROVAL_REQUIRED":
      return { ...base, availability: "approval-required", disabledReason: "APPROVAL_REQUIRED" };
    case "CAPABILITY_NOT_GRANTED":
    case "INSUFFICIENT_PRIVILEGE":
      return { ...base, availability: "permission-required", disabledReason: decision.reasonCode };
    default:
      return { ...base, availability: "disabled", disabledReason: "NO_RECORD_STATUS" };
  }
}

/**
 * Derives the commands discoverable against one record.
 *
 * Reads the immutable record detail and the presented authority only. It calls
 * no runtime, performs no lookup, and produces no side effect — the result is
 * a frozen description of what *could* become available once an executor
 * exists. Nothing here can run a command.
 */
export function createRecordCommandView(input: {
  readonly registry: DirectorCommandRegistry;
  readonly detail: RecordDetailView;
  readonly authority: CommandAuthorityContext;
}): RecordCommandView {
  const declared = input.registry.listForSection(input.detail.sectionId);
  return deepFreeze({
    sectionId: input.detail.sectionId,
    recordId: input.detail.recordId,
    recordStatus: input.detail.status,
    state: declared.length === 0 ? "unsupported" : "available",
    commands: declared.map((command) => presentation(command, input.detail.status, input.authority)),
    executable: false as const,
    authoritative: false as const,
  });
}
