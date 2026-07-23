import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as directorCommand from "../../src/features/director-command";
import { createDefaultCommandRegistry } from "../../src/features/director-command";

const FEATURE_DIR = "src/features/director-command";
const sources = readdirSync(FEATURE_DIR)
  .filter((name) => name.endsWith(".ts"))
  .map((name) => ({ name, text: readFileSync(join(FEATURE_DIR, name), "utf8") }));

/** No runtime, memory, storage, provider, or observability access. */
function reachesNoAuthority(): void {
  const forbidden = [
    "../runtime-projection", "../runtime-observability", "../runtime-boundary", "../runtime-activation",
    "../organization-runtime", "../agent-runtime", "../workflow-runtime", "../execution",
    "../memory", "../memory-engine", "../memory-crud", "../memory-runtime",
    "../persistence", "../observability", "../monitoring", "../diagnostics-read-models",
    "../evaluation", "../auth", "../providers", "../provider-invocation", "../orchestration",
    "../commands", "@/db", "drizzle-orm", "pg", "postgres", "node:fs", "node:child_process",
  ];
  assert.equal(sources.length > 0, true);
  for (const { name, text } of sources) {
    for (const specifier of forbidden) {
      assert.equal(text.includes(`"${specifier}`), false, `${name} must not import ${specifier}`);
    }
  }
}

/** The only outward dependency is the dashboard's navigable section list. */
function importsOnlyNavigationIdentifiers(): void {
  const outward = sources.flatMap(({ text }) => [...text.matchAll(/from "(\.\.\/[^"]+)"/g)].map((match) => match[1]));
  assert.deepEqual([...new Set(outward)], ["../director-dashboard-navigation"]);
}

/** No execution surface exists anywhere in the feature. */
function exposesNoExecution(): void {
  const all = sources.map(({ text }) => text).join("\n");
  for (const forbidden of [
    "fetch(", "XMLHttpRequest", "WebSocket", "setTimeout", "setInterval",
    "child_process", "eval(", "new Function", "process.env",
  ]) {
    assert.equal(all.includes(forbidden), false, `feature must not use ${forbidden}`);
  }
  // Phase 4C.1 exports named Runtime execution *contracts*. They are not
  // callable execution entry points and remain explicitly non-authoritative.
  const runtimeArchitectureContracts = new Set([
    "RUNTIME_ADAPTER_FAMILIES", "RUNTIME_EXECUTION_ARCHITECTURE", "RUNTIME_EXECUTION_ERROR_CODES",
    "RUNTIME_EXECUTION_LIFECYCLE_STATES", "RUNTIME_TARGET_KINDS", "UNRESOLVED_RUNTIME_EXECUTION_AUTHORITY",
    "RuntimeExecutionGateway", "RUNTIME_TARGET_RESOLUTION_ERROR_CODES", "RUNTIME_TARGET_RESOLUTION_MAPPING",
    "RUNTIME_TARGET_RESOLUTION_SOURCES", "RUNTIME_TARGET_RESOLUTION_VERSION", "RuntimeTargetResolver",
    "RUNTIME_ADAPTER_AVAILABILITY_STATES", "RUNTIME_ADAPTER_DESCRIPTORS", "RUNTIME_ADAPTER_ERROR_CODES", "RuntimeAdapterRegistry",
    "RUNTIME_CONCURRENCY_SCOPES", "RUNTIME_CONFLICT_CLASSIFICATIONS", "RUNTIME_FRESHNESS_CLASSIFICATIONS", "RUNTIME_IDEMPOTENCY_ERROR_CODES", "RUNTIME_REPLAY_CLASSIFICATIONS",
    "RUNTIME_CANCELLATION_POLICIES", "RUNTIME_EXECUTION_READINESS_STATES", "RUNTIME_ROLLBACK_CLASSIFICATIONS", "RUNTIME_SAFETY_CLASSIFICATIONS", "RUNTIME_SAFETY_ERROR_CODES", "RUNTIME_TIMEOUT_CLASSES",
    "RUNTIME_EXECUTION_OUTCOMES", "RUNTIME_OUTCOME_ERROR_CODES", "RUNTIME_PROJECTION_TARGETS", "RUNTIME_RESULT_CLASSIFICATIONS",
    "RUNTIME_COMPENSATION_STRATEGIES", "RUNTIME_FAILURE_CLASSIFICATIONS", "RUNTIME_RECOVERY_ELIGIBILITY", "RUNTIME_RECOVERY_ERROR_CODES", "RUNTIME_RECOVERY_READINESS", "RUNTIME_RECOVERY_STRATEGIES", "RUNTIME_TERMINALITY",
  "RUNTIME_EXECUTION_INTEGRATION_VERSION", "RUNTIME_INTEGRATION_ERROR_CODES", "RUNTIME_INTEGRATION_GATES", "RUNTIME_INTEGRATION_STAGES",
    "RUNTIME_AUTHORITY_ERROR_CODES", "RUNTIME_AUTHORITY_REASON_CODES", "RUNTIME_AUTHORITY_STATUSES", "RUNTIME_AUTHORITY_VERSION",
    "RUNTIME_AUTHORITY_IDENTITY_ERROR_CODES", "RUNTIME_AUTHORITY_IDENTITY_VERSION", "RUNTIME_AUTHORITY_PRINCIPAL_TYPES",
    "RUNTIME_POLICY_EFFECTS", "RUNTIME_POLICY_ERROR_CODES", "RUNTIME_POLICY_VERSION",
    "RUNTIME_RISK_VERSION", "RUNTIME_RISK_LEVELS", "RUNTIME_RISK_DOMAINS", "RUNTIME_IMPACT_SCOPES", "RUNTIME_BLAST_RADII", "RUNTIME_REVERSIBILITY", "RUNTIME_DATA_SENSITIVITIES", "RUNTIME_SIDE_EFFECT_PROFILES", "RUNTIME_APPROVAL_MODES", "RUNTIME_APPROVAL_CONSTRAINTS", "RUNTIME_RISK_ERROR_CODES",
  ]);
  // No other exported symbol suggests or performs execution.
  for (const exported of Object.keys(directorCommand)) {
    assert.equal(runtimeArchitectureContracts.has(exported) || !/^(execute|run|dispatch|invoke|perform|apply|commit|send)/i.test(exported), true,
      `${exported} must not be an execution entry point`);
  }
  assert.equal("executeCommand" in directorCommand, false);
  assert.equal("dispatchCommand" in directorCommand, false);
}

/** Every exported value is data or a pure function; none mutate the registry. */
function exportsAreInertOrPure(): void {
  const registry = createDefaultCommandRegistry();
  const before = JSON.stringify(registry.list());
  // Calling every pure entry point must leave the catalogue untouched.
  directorCommand.validateCommandRequest({
    registry,
    request: { commandId: "workflow.pause", version: "1.0.0", targetSectionId: "active-workflows", targetRecordId: "wf-1" },
    authority: { privilege: "high", capabilities: ["workflow.lifecycle"], approvalGranted: true },
  });
  directorCommand.evaluateCommandPermission(registry.list()[0]!, { privilege: "high", capabilities: [] });
  directorCommand.satisfiesPrivilege("high", "baseline");
  assert.equal(JSON.stringify(registry.list()), before, "no entry point may mutate the registry");
}

/** Definitions carry no secrets, payloads, or endpoints. */
function definitionsCarryNoSensitiveData(): void {
  const serialized = JSON.stringify(directorCommand.DIRECTOR_COMMAND_DEFINITIONS);
  for (const forbidden of [
    "accessToken", "refreshToken", "apiKey", "password", "secret", "Bearer ",
    "postgresql://", "http://", "https://", "endpoint", "providerPayload",
    "hiddenReasoning", "memoryContent", "tenantId",
  ]) {
    assert.equal(serialized.toLowerCase().includes(forbidden.toLowerCase()), false,
      `definitions must not contain ${forbidden}`);
  }
}

/** The legacy CRUD command pipeline is untouched and unused here. */
function legacyCommandPipelineUntouched(): void {
  const all = sources.map(({ text }) => text).join("\n");
  assert.equal(all.includes("features/commands"), false);
  assert.equal(all.includes("registerCommand"), false);
  // The legacy module still exists for its own consumers.
  assert.equal(readFileSync("src/features/commands/registry.ts", "utf8").includes("export function registerCommand"), true);
}

/** No dashboard contract was modified by this phase. */
function dashboardContractsUnchanged(): void {
  const dataTypes = readFileSync("src/features/director-dashboard-data/types.ts", "utf8");
  assert.equal(dataTypes.includes("readonly authoritative: false;"), true);
  const navigationTypes = readFileSync("src/features/director-dashboard-navigation/types.ts", "utf8");
  assert.equal(navigationTypes.includes("export const NAVIGABLE_SECTION_IDS"), true);
  // The record detail contract is consumed, never extended: commands are
  // derived alongside it rather than added to it.
  assert.equal(navigationTypes.includes("commands"), false, "RecordDetailView must not gain a commands field");
  /*
   * From Phase 4B.3 the dashboard presents commands, so consuming the feature
   * is expected. What must stay true is the set of consumers and what they may
   * do: read the presentation model, never reach an execution surface.
   */
  const consumers = ["src/components", "src/app"].flatMap((root) => grep(root, "director-command")).sort();
  assert.deepEqual(consumers, [
    "src/components/director-dashboard/director-command-center-panel.tsx",
    "src/components/director-dashboard/record-command-panel.tsx",
    "src/components/director-dashboard/record-detail-view.tsx",
    "src/components/director-dashboard/widget-runtime-board.tsx",
  ], "only the record command panel, the detail view and the board may consume commands");

  for (const file of consumers) {
    const text = readFileSync(file, "utf8");
    for (const forbidden of ["validateCommandRequest", "evaluateCommandPermission", "executeCommand", "dispatchCommand"]) {
      assert.equal(text.includes(forbidden), false, `${file} must not reach ${forbidden}`);
    }
  }
  // No route or page consumes the feature: presentation lives in the board.
  assert.deepEqual(grep("src/app", "director-command"), []);
}

/** The integration reads record details; it never reaches past them. */
function integrationConsumesReadModelsOnly(): void {
  const integration = sources.find(({ name }) => name === "record-commands.ts");
  assert.notEqual(integration, undefined);
  const text = integration!.text;
  assert.equal(text.includes('from "../director-dashboard-navigation"'), true);
  // It takes the detail as an argument rather than building one itself, so it
  // cannot reach a snapshot, a runtime, or a widget on its own.
  for (const forbidden of [
    "createRecordDetailView", "createSectionListView", "createExecutiveOverview",
    "getDirectorDashboardUiModel", "runtimeProjectionRegistry", "materializeRuntimeEvidence",
  ]) {
    assert.equal(text.includes(forbidden), false, `integration must not call ${forbidden}`);
  }
}

/** Phase 4C.8 is terminal in this declarative chain; earlier layers cannot depend on it. */
function runtimeIntegrationHasNoReverseDependencies(): void {
  const integration = sources.find(({ name }) => name === "runtime-execution-integration.ts");
  assert.notEqual(integration, undefined);
  for (const { name, text } of sources) {
    if (name !== "runtime-execution-integration.ts" && name.startsWith("runtime-")) {
      assert.equal(text.includes("runtime-execution-integration"), false, `${name} must not depend on Phase 4C.8`);
    }
  }
}

/** Phase 4D.1 may consume Runtime contracts, but no prior Runtime contract may consume it. */
function runtimeAuthorityHasNoReverseDependencies(): void {
  const authority = sources.find(({ name }) => name === "runtime-authority.ts");
  assert.notEqual(authority, undefined);
  for (const { name, text } of sources) {
    if (name !== "runtime-authority.ts" && name !== "runtime-authority-identity.ts" && name !== "runtime-policy.ts" && name !== "runtime-risk-classification.ts" && name.startsWith("runtime-")) {
      assert.equal(text.includes('from "./runtime-authority"'), false, `${name} must not depend on Phase 4D.1`);
    }
  }
}

/** Phase 4D.2 can consume authority contracts, but no prior Runtime layer can depend on identity binding. */
function runtimeAuthorityIdentityHasNoReverseDependencies(): void {
  const identity = sources.find(({ name }) => name === "runtime-authority-identity.ts");
  assert.notEqual(identity, undefined);
  for (const { name, text } of sources) {
    if (name !== "runtime-authority-identity.ts" && name !== "runtime-policy.ts" && name !== "runtime-risk-classification.ts" && name.startsWith("runtime-")) {
      assert.equal(text.includes('from "./runtime-authority-identity"'), false, `${name} must not depend on Phase 4D.2`);
    }
  }
}

/** Phase 4D.3 is declarative only; no previous Runtime layer may consume its policy model. */
function runtimePolicyHasNoReverseDependencies(): void {
  const policy = sources.find(({ name }) => name === "runtime-policy.ts");
  assert.notEqual(policy, undefined);
  for (const { name, text } of sources) {
    if (name !== "runtime-policy.ts" && name !== "runtime-risk-classification.ts" && name.startsWith("runtime-")) {
      assert.equal(text.includes('from "./runtime-policy"'), false, `${name} must not depend on Phase 4D.3`);
    }
  }
}

/** Phase 4D.4 is terminal metadata; no prior Runtime or Authority layer may consume it. */
function runtimeRiskHasNoReverseDependencies(): void {
  const risk = sources.find(({ name }) => name === "runtime-risk-classification.ts");
  assert.notEqual(risk, undefined);
  for (const { name, text } of sources) {
    if (name !== "runtime-risk-classification.ts" && name.startsWith("runtime-")) {
      assert.equal(text.includes('from "./runtime-risk-classification"'), false, `${name} must not depend on Phase 4D.4`);
    }
  }
}

function grep(root: string, needle: string): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry.name) && readFileSync(path, "utf8").includes(needle)) found.push(path);
    }
  };
  walk(root);
  return found;
}

function main(): void {
  reachesNoAuthority();
  importsOnlyNavigationIdentifiers();
  exposesNoExecution();
  exportsAreInertOrPure();
  definitionsCarryNoSensitiveData();
  legacyCommandPipelineUntouched();
  dashboardContractsUnchanged();
  integrationConsumesReadModelsOnly();
  runtimeIntegrationHasNoReverseDependencies();
  runtimeAuthorityHasNoReverseDependencies();
  runtimeAuthorityIdentityHasNoReverseDependencies();
  runtimePolicyHasNoReverseDependencies();
  runtimeRiskHasNoReverseDependencies();
  console.log("director command boundary checks passed");
}

main();
