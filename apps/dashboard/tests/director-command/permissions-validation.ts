import assert from "node:assert/strict";
import {
  COMMAND_PRIVILEGES,
  createDefaultCommandRegistry,
  evaluateCommandPermission,
  satisfiesPrivilege,
  validateCommandRequest,
  type CommandAuthorityContext,
  type CommandRequest,
} from "../../src/features/director-command";

const registry = createDefaultCommandRegistry();
const pause = registry.resolve("workflow.pause", "1.0.0");
assert.equal(pause.status, "resolved");
const pauseCommand = pause.status === "resolved" ? pause.command : undefined!;

const request: CommandRequest = {
  commandId: "workflow.pause",
  version: "1.0.0",
  targetSectionId: "active-workflows",
  targetRecordId: "wf-approval-review",
};
const authorized: CommandAuthorityContext = {
  privilege: "high",
  capabilities: ["workflow.lifecycle"],
  approvalGranted: true,
};
const validate = (overrides: Partial<CommandRequest> = {}, authority: CommandAuthorityContext = authorized) =>
  validateCommandRequest({ registry, request: { ...request, ...overrides }, authority });

/** Privilege ordering is a total order; higher satisfies lower only. */
function privilegeOrdering(): void {
  assert.deepEqual([...COMMAND_PRIVILEGES], ["baseline", "medium", "high"]);
  assert.equal(satisfiesPrivilege("high", "baseline"), true);
  assert.equal(satisfiesPrivilege("high", "high"), true);
  assert.equal(satisfiesPrivilege("medium", "medium"), true);
  assert.equal(satisfiesPrivilege("baseline", "medium"), false);
  assert.equal(satisfiesPrivilege("medium", "high"), false);
  assert.equal(satisfiesPrivilege("baseline", "high"), false);
}

/** Permission is denied for the right reason, in a fixed order. */
function permissionDecisions(): void {
  assert.deepEqual(
    evaluateCommandPermission(pauseCommand, { privilege: "high", capabilities: [] }),
    { status: "denied", reasonCode: "CAPABILITY_NOT_GRANTED" },
  );
  assert.deepEqual(
    evaluateCommandPermission(pauseCommand, { privilege: "baseline", capabilities: ["workflow.lifecycle"] }),
    { status: "denied", reasonCode: "INSUFFICIENT_PRIVILEGE" },
  );
  assert.deepEqual(
    evaluateCommandPermission(pauseCommand, { privilege: "high", capabilities: ["workflow.lifecycle"] }),
    { status: "denied", reasonCode: "APPROVAL_REQUIRED" },
  );
  assert.deepEqual(evaluateCommandPermission(pauseCommand, authorized), { status: "granted" });
  assert.equal(Object.isFrozen(evaluateCommandPermission(pauseCommand, authorized)), true);
}

/** Capability is checked before privilege, and approval last. */
function denialOrderDoesNotLeak(): void {
  const noneOfIt: CommandAuthorityContext = { privilege: "baseline", capabilities: [] };
  const decision = evaluateCommandPermission(pauseCommand, noneOfIt);
  assert.equal(decision.status === "denied" && decision.reasonCode, "CAPABILITY_NOT_GRANTED",
    "an unauthorized caller must not learn that approval was the only obstacle");
}

/** Approval is only satisfied by an explicit grant. */
function approvalRequiresExplicitGrant(): void {
  for (const approvalGranted of [undefined, false, "true" as never, 1 as never]) {
    const decision = evaluateCommandPermission(pauseCommand, {
      privilege: "high", capabilities: ["workflow.lifecycle"], approvalGranted,
    });
    assert.equal(decision.status, "denied", `approvalGranted=${String(approvalGranted)} must not pass`);
  }
  // A command that needs no approval passes without one.
  const resume = registry.resolve("workflow.resume", "1.0.0");
  assert.equal(
    evaluateCommandPermission(
      resume.status === "resolved" ? resume.command : pauseCommand,
      { privilege: "medium", capabilities: ["workflow.lifecycle"] },
    ).status,
    "granted",
  );
}

/** A validated request is never an executed one. */
function acceptanceIsNotExecution(): void {
  const result = validate();
  assert.equal(result.status, "accepted");
  assert.equal(result.status === "accepted" && result.executed, false);
  assert.equal(result.status === "accepted" && result.commandId, "workflow.pause");
  assert.equal(result.status === "accepted" && result.targetRecordId, "wf-approval-review");
  assert.equal(Object.isFrozen(result), true);
}

/** Every rejection path returns its own stable code. */
function rejectionCodes(): void {
  assert.equal(validate({ commandId: "agent.nuke" }).status === "rejected" &&
    validate({ commandId: "agent.nuke" }).status, "rejected");
  const cases: readonly [Partial<CommandRequest>, CommandAuthorityContext, string][] = [
    [{ commandId: "agent.nuke" }, authorized, "UNKNOWN_COMMAND"],
    [{ version: "2.0.0" }, authorized, "UNKNOWN_COMMAND"],
    [{ targetSectionId: "active-agents" }, authorized, "INVALID_TARGET_SECTION"],
    [{ targetSectionId: "" }, authorized, "INVALID_TARGET_SECTION"],
    [{ targetRecordId: "" }, authorized, "INVALID_TARGET_RECORD"],
    [{ targetRecordId: "   " }, authorized, "INVALID_TARGET_RECORD"],
    [{}, { privilege: "high", capabilities: [] }, "CAPABILITY_NOT_GRANTED"],
    [{}, { privilege: "baseline", capabilities: ["workflow.lifecycle"] }, "INSUFFICIENT_PRIVILEGE"],
    [{}, { privilege: "high", capabilities: ["workflow.lifecycle"] }, "APPROVAL_REQUIRED"],
  ];
  for (const [overrides, authority, expected] of cases) {
    const result = validate(overrides, authority);
    assert.equal(result.status, "rejected", `${expected} must reject`);
    assert.equal(result.status === "rejected" && result.reasonCode, expected);
  }
}

/** A command may only be raised against the section it declares. */
function targetSectionIsEnforced(): void {
  for (const command of registry.list()) {
    const wrongSection = command.targetSectionId === "active-agents" ? "active-workflows" : "active-agents";
    const result = validateCommandRequest({
      registry,
      request: { commandId: command.commandId, version: command.version, targetSectionId: wrongSection, targetRecordId: "r-1" },
      authority: { privilege: "high", capabilities: [command.permission.capability], approvalGranted: true },
    });
    assert.equal(result.status, "rejected");
    assert.equal(result.status === "rejected" && result.reasonCode, "INVALID_TARGET_SECTION");
  }
}

/** Validation is pure: repeated calls agree and nothing is mutated. */
function validationIsPure(): void {
  const before = registry.list();
  assert.deepEqual(validate(), validate());
  assert.deepEqual(registry.list(), before);
  const rejected = validate({ targetRecordId: "" });
  assert.equal(Object.isFrozen(rejected), true);
}

function main(): void {
  privilegeOrdering();
  permissionDecisions();
  denialOrderDoesNotLeak();
  approvalRequiresExplicitGrant();
  acceptanceIsNotExecution();
  rejectionCodes();
  targetSectionIsEnforced();
  validationIsPure();
  console.log("director command permission and validation checks passed");
}

main();
