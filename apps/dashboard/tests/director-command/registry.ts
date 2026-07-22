import assert from "node:assert/strict";
import {
  COMMAND_CATEGORIES,
  COMMAND_DEFINITION_VERSION,
  COMMAND_PRIVILEGES,
  COMMAND_RISK_LEVELS,
  createDefaultCommandRegistry,
  DIRECTOR_COMMAND_DEFINITIONS,
  DIRECTOR_COMMAND_IDS,
  DirectorCommandRegistry,
  type DirectorCommandDefinition,
} from "../../src/features/director-command";
import { NAVIGABLE_SECTION_IDS } from "../../src/features/director-dashboard-navigation";

const registry = createDefaultCommandRegistry();

function definition(overrides: Partial<DirectorCommandDefinition> = {}): DirectorCommandDefinition {
  return {
    commandId: "workflow.pause",
    version: "1.0.0",
    label: "Pause Workflow",
    description: "Hold a running workflow.",
    category: "lifecycle",
    risk: "medium",
    targetSectionId: "active-workflows",
    permission: { capability: "workflow.lifecycle", minimumPrivilege: "medium", requiresApproval: true },
    executable: false,
    ...overrides,
  } as DirectorCommandDefinition;
}

/** Every declared command id is registered exactly once. */
function registersEveryCommand(): void {
  assert.equal(registry.list().length, DIRECTOR_COMMAND_IDS.length);
  assert.deepEqual(
    [...registry.list().map(({ commandId }) => commandId)].sort(),
    [...DIRECTOR_COMMAND_IDS].sort(),
  );
  for (const commandId of DIRECTOR_COMMAND_IDS) {
    assert.equal(registry.resolve(commandId, COMMAND_DEFINITION_VERSION).status, "resolved");
  }
}

/** Identifiers, categories, risk, privileges and targets are all canonical. */
function definitionsUseCanonicalVocabulary(): void {
  for (const command of registry.list()) {
    assert.equal((DIRECTOR_COMMAND_IDS as readonly string[]).includes(command.commandId), true);
    assert.equal((COMMAND_CATEGORIES as readonly string[]).includes(command.category), true);
    assert.equal((COMMAND_RISK_LEVELS as readonly string[]).includes(command.risk), true);
    assert.equal((COMMAND_PRIVILEGES as readonly string[]).includes(command.permission.minimumPrivilege), true);
    // Targets reuse the dashboard's own navigable sections, not a parallel list.
    assert.equal((NAVIGABLE_SECTION_IDS as readonly string[]).includes(command.targetSectionId), true);
  }
}

/** Unknown commands and versions resolve to a typed miss, never a throw. */
function unsupportedCommandHandling(): void {
  assert.deepEqual(registry.resolve("agent.nuke", "1.0.0"), {
    status: "unknown_command", commandId: "agent.nuke", version: "1.0.0",
  });
  assert.equal(registry.resolve("workflow.pause", "9.9.9").status, "unknown_command");
  assert.equal(registry.resolve("", "").status, "unknown_command");
  assert.deepEqual(registry.listForSection("evaluation-summary"), []);
  assert.deepEqual(registry.listForSection("not-a-section"), []);
}

/** Section filtering returns only that section's commands. */
function listsBySection(): void {
  assert.deepEqual(
    registry.listForSection("active-workflows").map(({ commandId }) => commandId),
    ["workflow.retry", "workflow.pause", "workflow.resume"],
  );
  assert.deepEqual(registry.listForSection("active-agents").map(({ commandId }) => commandId), ["agent.restart"]);
  for (const command of registry.listForSection("active-agents")) {
    assert.equal(command.targetSectionId, "active-agents");
  }
}

/** Invalid definitions are refused at construction. */
function rejectsInvalidDefinitions(): void {
  const invalid: readonly Partial<DirectorCommandDefinition>[] = [
    { commandId: "not.a.command" as never },
    { version: "" },
    { label: "" },
    { description: "   " },
    { category: "made-up" as never },
    { risk: "catastrophic" as never },
    { targetSectionId: "evaluation-summary" as never },
    { permission: { capability: "nope", minimumPrivilege: "medium", requiresApproval: true } as never },
    { permission: { capability: "workflow.lifecycle", minimumPrivilege: "root", requiresApproval: true } as never },
    { permission: { capability: "workflow.lifecycle", minimumPrivilege: "medium", requiresApproval: "yes" } as never },
  ];
  for (const overrides of invalid) {
    assert.throws(() => new DirectorCommandRegistry([definition(overrides)]), TypeError,
      `must reject ${JSON.stringify(overrides)}`);
  }
  assert.throws(() => new DirectorCommandRegistry([definition(), definition()]), TypeError, "duplicates");
}

/** A command claiming to be executable cannot be registered in this phase. */
function rejectsExecutableClaims(): void {
  assert.throws(() => new DirectorCommandRegistry([definition({ executable: true as never })]), TypeError);
  for (const command of registry.list()) assert.equal(command.executable, false);
}

/** Definitions are data: any behaviour makes the definition invalid. */
function rejectsBehaviour(): void {
  for (const carrier of [
    { ...definition(), execute: () => undefined },
    { ...definition(), validate: () => true },
    { ...definition(), simulate: async () => undefined },
    { ...definition(), permission: { capability: "workflow.lifecycle", minimumPrivilege: "medium", requiresApproval: true, hook: () => undefined } },
  ] as unknown as DirectorCommandDefinition[]) {
    assert.throws(() => new DirectorCommandRegistry([carrier]), TypeError, "behaviour must be refused");
  }
  // Nothing already registered carries a callable value.
  for (const command of registry.list()) {
    for (const value of Object.values(command)) assert.notEqual(typeof value, "function");
    for (const value of Object.values(command.permission)) assert.notEqual(typeof value, "function");
  }
}

/** The registry and its definitions are immutable. */
function isImmutable(): void {
  assert.equal(Object.isFrozen(registry), true);
  assert.equal(Object.isFrozen(DIRECTOR_COMMAND_DEFINITIONS), true);
  const command = registry.list()[0]!;
  assert.equal(Object.isFrozen(command), true);
  assert.equal(Object.isFrozen(command.permission), true);
  assert.throws(() => {
    (command as unknown as { label: string }).label = "tampered";
  });
  assert.throws(() => {
    (command.permission as unknown as { requiresApproval: boolean }).requiresApproval = false;
  });
  assert.throws(() => {
    (registry.list() as unknown as { push: (value: unknown) => void }).push({});
  });
  assert.notEqual(command.label, "tampered");
  // There is no mutator on the registry: the catalogue cannot drift at runtime.
  for (const mutator of ["register", "add", "remove", "clear", "set"]) {
    assert.equal(mutator in registry, false, `registry must not expose ${mutator}`);
  }
}

/** Copies handed out cannot be used to corrupt the registry. */
function listDoesNotLeakInternals(): void {
  const first = registry.list();
  const second = registry.list();
  assert.deepEqual(first, second);
  assert.equal(registry.list().length, DIRECTOR_COMMAND_IDS.length);
}

function main(): void {
  registersEveryCommand();
  definitionsUseCanonicalVocabulary();
  unsupportedCommandHandling();
  listsBySection();
  rejectsInvalidDefinitions();
  rejectsExecutableClaims();
  rejectsBehaviour();
  isImmutable();
  listDoesNotLeakInternals();
  console.log("director command registry checks passed");
}

main();
