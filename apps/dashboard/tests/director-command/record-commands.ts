import assert from "node:assert/strict";
import {
  COMMAND_AVAILABILITY_STATES,
  createDefaultCommandRegistry,
  createRecordCommandView,
  type CommandAuthorityContext,
} from "../../src/features/director-command";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import {
  createRecordDetailView,
  createSectionListView,
  NAVIGABLE_SECTION_IDS,
  type RecordDetailView,
} from "../../src/features/director-dashboard-navigation";
import { healthyRuntime, readyState } from "../helpers/director-dashboard-executive-overview";

const registry = createDefaultCommandRegistry();
const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

const ALL_CAPABILITIES = [
  "agent.lifecycle", "workflow.lifecycle", "workflow.recovery", "observability.reevaluate",
] as const;
const fullAuthority: CommandAuthorityContext = {
  privilege: "high",
  capabilities: ALL_CAPABILITIES,
  approvalGranted: true,
};

function detailFor(sectionId: string, runtime = healthyRuntime()): RecordDetailView {
  const overview = createExecutiveOverview({ runtime, evaluatedAt });
  const list = createSectionListView({ overview, runtime, sectionId })!;
  return createRecordDetailView({ overview, runtime, sectionId, recordId: list.rows[0]!.id })!;
}

const view = (sectionId: string, authority: CommandAuthorityContext = fullAuthority, runtime = healthyRuntime()) =>
  createRecordCommandView({ registry, detail: detailFor(sectionId, runtime), authority });

/** Each section exposes exactly the commands the registry declares for it. */
function registryIntegration(): void {
  const expected: Readonly<Record<string, readonly string[]>> = {
    "active-agents": ["agent.restart"],
    "active-workflows": ["workflow.retry", "workflow.pause", "workflow.resume"],
    "diagnostics-summary": ["diagnostics.re-evaluate"],
    "monitoring-summary": ["monitoring.refresh"],
    "platform-status": [],
    "runtime-status": [],
  };
  for (const sectionId of NAVIGABLE_SECTION_IDS) {
    const derived = view(sectionId);
    assert.deepEqual(derived.commands.map(({ commandId }) => commandId), expected[sectionId], sectionId);
    assert.deepEqual(
      derived.commands.map(({ commandId }) => commandId),
      registry.listForSection(sectionId).map(({ commandId }) => commandId),
      "presentation must mirror the registry",
    );
  }
}

/** Platform and runtime records declare no commands and read unsupported. */
function unsupportedRecords(): void {
  for (const sectionId of ["platform-status", "runtime-status"]) {
    const derived = view(sectionId);
    assert.equal(derived.state, "unsupported");
    assert.equal(derived.commands.length, 0);
  }
  for (const sectionId of ["active-agents", "active-workflows", "diagnostics-summary", "monitoring-summary"]) {
    assert.equal(view(sectionId).state, "available");
  }
}

/** Every presented command carries the full metadata the phase requires. */
function presentationCarriesRequiredMetadata(): void {
  const derived = view("active-workflows");
  for (const command of derived.commands) {
    const declared = registry.listForSection("active-workflows")
      .find((candidate) => candidate.commandId === command.commandId)!;
    assert.equal(command.label, declared.label);
    assert.equal(command.category, declared.category);
    assert.equal(command.requiredCapability, declared.permission.capability);
    assert.equal(command.requiredPrivilege, declared.permission.minimumPrivilege);
    assert.equal(command.approvalRequired, declared.permission.requiresApproval);
    assert.equal((COMMAND_AVAILABILITY_STATES as readonly string[]).includes(command.availability), true);
    // A disabled reason accompanies every non-available state, and only those.
    assert.equal(command.availability === "available", command.disabledReason === undefined);
  }
}

/** Permission outcomes drive the availability state. */
function permissionIntegration(): void {
  const noGrants = view("active-workflows", { privilege: "high", capabilities: [] });
  for (const command of noGrants.commands) {
    assert.equal(command.availability, "permission-required");
    assert.equal(command.disabledReason, "CAPABILITY_NOT_GRANTED");
  }

  const lowPrivilege = view("active-workflows", { privilege: "baseline", capabilities: ALL_CAPABILITIES });
  for (const command of lowPrivilege.commands) {
    assert.equal(command.availability, "permission-required");
    assert.equal(command.disabledReason, "INSUFFICIENT_PRIVILEGE");
  }

  const noApproval = view("active-workflows", { privilege: "high", capabilities: ALL_CAPABILITIES });
  const byId = new Map(noApproval.commands.map((command) => [command.commandId, command]));
  assert.equal(byId.get("workflow.retry")?.availability, "approval-required");
  assert.equal(byId.get("workflow.pause")?.availability, "approval-required");
  // Resume needs no approval, so it is available without one.
  assert.equal(byId.get("workflow.resume")?.availability, "available");
  assert.equal(byId.get("workflow.resume")?.disabledReason, undefined);

  for (const command of view("active-workflows").commands) {
    assert.equal(command.availability, "available");
  }
}

/** An unreadable record status disables commands rather than guessing. */
function disabledStateGeneration(): void {
  for (const status of ["unknown", "", "   "]) {
    const runtime = healthyRuntime({
      "active-agents": readyState("active-agents", [
        { id: "agent-1", label: "Agent", value: "org-1", ...(status ? { status } : {}) },
      ]),
    });
    const derived = view("active-agents", fullAuthority, runtime);
    assert.equal(derived.commands.length, 1);
    assert.equal(derived.commands[0]?.availability, "disabled", `status "${status}" must disable`);
    assert.equal(derived.commands[0]?.disabledReason, "NO_RECORD_STATUS");
  }
  // A readable status is judged on permission instead.
  assert.equal(view("active-agents").commands[0]?.availability, "available");
}

/** Nothing in the presentation model can execute. */
function carriesNoExecutionPath(): void {
  const derived = view("active-workflows");
  assert.equal(derived.executable, false);
  assert.equal(derived.authoritative, false);
  for (const value of Object.values(derived)) assert.notEqual(typeof value, "function");
  for (const command of derived.commands) {
    for (const value of Object.values(command)) assert.notEqual(typeof value, "function");
    for (const forbidden of ["onClick", "handler", "execute", "run", "dispatch", "href", "action", "endpoint"]) {
      assert.equal(forbidden in command, false, `presentation must not carry ${forbidden}`);
    }
  }
  const serialized = JSON.stringify(derived);
  for (const forbidden of ["http://", "https://", "Bearer ", "accessToken", "tenantId", "postgresql://"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
}

/** The presentation model is deeply immutable. */
function isImmutable(): void {
  const derived = view("active-workflows");
  assert.equal(Object.isFrozen(derived), true);
  assert.equal(Object.isFrozen(derived.commands), true);
  assert.equal(Object.isFrozen(derived.commands[0]), true);
  assert.throws(() => {
    (derived.commands as unknown as { push: (value: unknown) => void }).push({});
  });
  assert.throws(() => {
    (derived.commands[0] as unknown as { availability: string }).availability = "available";
  });
  assert.throws(() => {
    (derived as unknown as { executable: boolean }).executable = true;
  });
  assert.equal(derived.executable, false);
}

/** Derivation is pure: it never mutates the registry or the detail. */
function derivationIsPure(): void {
  const detail = detailFor("active-workflows");
  const before = JSON.stringify(registry.list());
  const detailBefore = JSON.stringify(detail);
  const first = createRecordCommandView({ registry, detail, authority: fullAuthority });
  const second = createRecordCommandView({ registry, detail, authority: fullAuthority });
  assert.deepEqual(first, second, "same inputs must give the same result");
  assert.equal(JSON.stringify(registry.list()), before, "registry must be untouched");
  assert.equal(JSON.stringify(detail), detailBefore, "record detail must be untouched");
}

/** The view is bound to the record it was derived from. */
function bindsToItsRecord(): void {
  const detail = detailFor("active-agents");
  const derived = createRecordCommandView({ registry, detail, authority: fullAuthority });
  assert.equal(derived.sectionId, detail.sectionId);
  assert.equal(derived.recordId, detail.recordId);
  assert.equal(derived.recordStatus, detail.status);
}

function main(): void {
  registryIntegration();
  unsupportedRecords();
  presentationCarriesRequiredMetadata();
  permissionIntegration();
  disabledStateGeneration();
  carriesNoExecutionPath();
  isImmutable();
  derivationIsPure();
  bindsToItsRecord();
  console.log("director command record integration checks passed");
}

main();
