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
  // No exported symbol suggests or performs execution.
  for (const exported of Object.keys(directorCommand)) {
    assert.equal(/^(execute|run|dispatch|invoke|perform|apply|commit|send)/i.test(exported), false,
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
  // No dashboard surface renders commands: discovery is model-only.
  const consumers = ["src/components", "src/app"].flatMap((root) => grep(root, "director-command"));
  assert.deepEqual(consumers, [], "no dashboard surface may render commands in this phase");
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
  console.log("director command boundary checks passed");
}

main();
