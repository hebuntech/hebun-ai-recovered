import assert from "node:assert/strict";
import {
  COMMAND_ROLLBACK_AVAILABILITY,
  COMMAND_SAFETY_RISK_LEVELS,
  createCommandConfirmationModel,
  createDefaultCommandRegistry,
  type DirectorCommandDefinition,
} from "../../src/features/director-command";

const registry = createDefaultCommandRegistry();

function command(commandId: string): DirectorCommandDefinition {
  const resolved = registry.resolve(commandId, "1.0.0");
  assert.equal(resolved.status, "resolved");
  return resolved.status === "resolved" ? resolved.command : undefined!;
}

/** Every registry declaration carries complete immutable safety metadata. */
function safetyMetadataIsComplete(): void {
  for (const definition of registry.list()) {
    const safety = definition.safety;
    assert.equal((COMMAND_SAFETY_RISK_LEVELS as readonly string[]).includes(safety.riskLevel), true);
    assert.equal((COMMAND_ROLLBACK_AVAILABILITY as readonly string[]).includes(safety.rollbackAvailability), true);
    assert.equal(typeof safety.confirmationRequired, "boolean");
    assert.equal(typeof safety.auditRequired, "boolean");
    assert.equal(safety.estimatedEffect.trim().length > 0, true);
    assert.equal(Object.isFrozen(safety), true);
  }
}

/** Safety classification is fixed by command metadata, never by runtime state. */
function riskMappingIsDeclared(): void {
  assert.equal(command("agent.restart").safety.riskLevel, "high");
  assert.equal(command("workflow.retry").safety.riskLevel, "high");
  assert.equal(command("workflow.pause").safety.riskLevel, "medium");
  assert.equal(command("workflow.resume").safety.riskLevel, "medium");
  assert.equal(command("diagnostics.re-evaluate").safety.riskLevel, "low");
  assert.equal(command("monitoring.refresh").safety.riskLevel, "low");
}

/** Rollback and audit requirements remain command-specific data. */
function rollbackAndAuditMetadata(): void {
  assert.equal(command("workflow.pause").safety.rollbackAvailability, "available");
  assert.equal(command("workflow.resume").safety.rollbackAvailability, "available");
  assert.equal(command("workflow.retry").safety.rollbackAvailability, "unavailable");
  assert.equal(command("diagnostics.re-evaluate").safety.rollbackAvailability, "not-applicable");
  assert.equal(command("agent.restart").safety.auditRequired, true);
  assert.equal(command("workflow.pause").safety.auditRequired, true);
  assert.equal(command("monitoring.refresh").safety.auditRequired, false);
}

/** Confirmation is a complete inert projection of one declaration. */
function confirmationGeneration(): void {
  const pause = command("workflow.pause");
  const model = createCommandConfirmationModel(pause);
  assert.deepEqual(model, {
    commandId: "workflow.pause",
    title: "Confirm Pause Workflow",
    summary: "Hold a running workflow at its current step without cancelling it.",
    warningText: "This command could affect an active operational record; verify its target before any future execution.",
    confirmationRequirements: [
      "Explicit user confirmation is required before any future execution.",
      "Governance approval is required before any future execution.",
      "Rollback availability: available.",
    ],
    auditRequirement: "An audit record is required before any future execution.",
    executable: false,
    authoritative: false,
  });
  assert.equal(Object.isFrozen(model), true);
  assert.equal(Object.isFrozen(model.confirmationRequirements), true);
  assert.throws(() => {
    (model as unknown as { title: string }).title = "tampered";
  });
  assert.throws(() => {
    (model.confirmationRequirements as unknown as { push: (value: string) => void }).push("tampered");
  });
}

/** Low-risk, no-approval commands produce their own declared requirements. */
function noApprovalConfirmation(): void {
  const model = createCommandConfirmationModel(command("monitoring.refresh"));
  assert.equal(model.confirmationRequirements.includes("No additional user confirmation is declared."), true);
  assert.equal(model.confirmationRequirements.includes("No governance approval is declared."), true);
  assert.equal(model.confirmationRequirements.includes("Rollback availability: not-applicable."), true);
  assert.equal(model.auditRequirement, "No audit record is declared.");
}

/** The model is deterministic, non-authoritative, and has no executable path. */
function modelIsInert(): void {
  const source = createCommandConfirmationModel.toString();
  for (const forbidden of ["fetch(", "dispatch", "execute", "runtime", "postgres", "memory", "provider"]) {
    assert.equal(source.toLowerCase().includes(forbidden), false, `confirmation factory must not contain ${forbidden}`);
  }
  const first = createCommandConfirmationModel(command("workflow.retry"));
  const second = createCommandConfirmationModel(command("workflow.retry"));
  assert.deepEqual(first, second);
  assert.equal(first.executable, false);
  assert.equal(first.authoritative, false);
  for (const value of Object.values(first)) assert.notEqual(typeof value, "function");
}

function main(): void {
  safetyMetadataIsComplete();
  riskMappingIsDeclared();
  rollbackAndAuditMetadata();
  confirmationGeneration();
  noApprovalConfirmation();
  modelIsInert();
  console.log("director command safety and confirmation checks passed");
}

main();
