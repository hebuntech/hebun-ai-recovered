import {
  COMMAND_PRIVILEGES,
  type CommandAuthorityContext,
  type CommandPrivilege,
  type CommandRejectionCode,
  type DirectorCommandDefinition,
} from "./types";

/** Privilege ordering. Higher satisfies lower; never the reverse. */
const PRIVILEGE_RANK: Readonly<Record<CommandPrivilege, number>> = Object.freeze(
  Object.fromEntries(COMMAND_PRIVILEGES.map((privilege, index) => [privilege, index])) as Record<CommandPrivilege, number>,
);

export function satisfiesPrivilege(held: CommandPrivilege, required: CommandPrivilege): boolean {
  return PRIVILEGE_RANK[held] >= PRIVILEGE_RANK[required];
}

export type PermissionDecision =
  | { readonly status: "granted" }
  | { readonly status: "denied"; readonly reasonCode: CommandRejectionCode };

/**
 * Decides whether a presented authority may raise a command.
 *
 * Pure and declarative: the authority is supplied by the caller and never
 * looked up here, so this performs no identity resolution, no session read,
 * and no side effect. Granting permission does not execute anything — no
 * executor exists.
 *
 * Order matters. Capability is checked before privilege so a missing grant is
 * never reported as a privilege problem, and approval is checked last so an
 * unauthorized caller can never learn that approval was the only obstacle.
 */
export function evaluateCommandPermission(
  definition: DirectorCommandDefinition,
  authority: CommandAuthorityContext,
): PermissionDecision {
  if (!authority.capabilities.includes(definition.permission.capability)) {
    return Object.freeze({ status: "denied", reasonCode: "CAPABILITY_NOT_GRANTED" });
  }
  if (!satisfiesPrivilege(authority.privilege, definition.permission.minimumPrivilege)) {
    return Object.freeze({ status: "denied", reasonCode: "INSUFFICIENT_PRIVILEGE" });
  }
  if (definition.permission.requiresApproval && authority.approvalGranted !== true) {
    return Object.freeze({ status: "denied", reasonCode: "APPROVAL_REQUIRED" });
  }
  return Object.freeze({ status: "granted" });
}

export { PRIVILEGE_RANK };
