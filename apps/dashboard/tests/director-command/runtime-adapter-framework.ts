import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CommandEnvelopeBus, RUNTIME_ADAPTER_DESCRIPTORS, RuntimeAdapterRegistry, RuntimeTargetResolver,
  createCommandConfirmationModel, createDefaultCommandRegistry, createRuntimeAdapterConstructionPlan,
  createRuntimeExecutionRequest, selectRuntimeAdapter, validateCommandRequest,
} from "../../src/features/director-command";

const commands = createDefaultCommandRegistry();
function target() {
  const authority = Object.freeze({ privilege: "high" as const, capabilities: Object.freeze(["observability.reevaluate"] as const), approvalGranted: true });
  const validation = validateCommandRequest({ registry: commands, request: { commandId: "monitoring.refresh", version: "1.0.0", targetSectionId: "monitoring-summary", targetRecordId: "target-4c3" }, authority });
  assert.equal(validation.status, "accepted");
  const envelope = new CommandEnvelopeBus({ now: () => new Date("2026-07-29T12:00:00.000Z"), createCorrelationId: () => "correlation-4c3" }).createEnvelope({ validation, confirmation: createCommandConfirmationModel(validation.definition), authority, origin: "director-dashboard" });
  const request = createRuntimeExecutionRequest({ envelope, registry: commands });
  const result = new RuntimeTargetResolver({ registry: commands }).resolve(request);
  assert.equal(result.status, "resolved");
  return result.target;
}

function immutableRegistryAndAvailability(): void {
  const registry = new RuntimeAdapterRegistry({ descriptors: RUNTIME_ADAPTER_DESCRIPTORS });
  assert.equal(Object.isFrozen(registry), true);
  assert.equal(Object.isFrozen(registry.list()), true);
  assert.equal(Object.isFrozen(registry.list()[0]), true);
  const unavailable = selectRuntimeAdapter({ target: target(), registry });
  assert.equal(unavailable.status, "unavailable");
  assert.equal(unavailable.status === "unavailable" && unavailable.error.code, "ADAPTER_UNAVAILABLE");
  assert.throws(() => { (RUNTIME_ADAPTER_DESCRIPTORS as unknown as unknown[]).push({}); });
}

function selectionAndMutations(): void {
  const source = RUNTIME_ADAPTER_DESCRIPTORS.find(({ adapterFamily }) => adapterFamily === "monitoring")!;
  const available = { ...source, availability: "available" as const };
  const registry = new RuntimeAdapterRegistry({ descriptors: [available] });
  const selected = selectRuntimeAdapter({ target: target(), registry });
  assert.equal(selected.status, "selected");
  assert.equal(selected.status === "selected" && selected.descriptor.adapterId, "runtime-adapter.monitoring");
  const plan = createRuntimeAdapterConstructionPlan(available);
  assert.deepEqual(plan, { adapterId: "runtime-adapter.monitoring", targetFamily: "monitoring", status: "planned", executable: false, authoritative: false });
  assert.equal(Object.isFrozen(plan), true);
  assert.throws(() => new RuntimeAdapterRegistry({ descriptors: [available, available] }));
  const mismatch = new RuntimeAdapterRegistry({ descriptors: [{ ...available, capabilityRequirements: ["workflow.lifecycle"] }] });
  const result = selectRuntimeAdapter({ target: target(), registry: mismatch });
  assert.equal(result.status, "invalid");
  assert.equal(result.status === "invalid" && result.error.code, "ADAPTER_CAPABILITY_MISMATCH");
}

function boundaryContract(): void {
  const source = ["runtime-adapter-framework.ts", "runtime-adapter-registry.ts", "runtime-adapter-selection.ts"]
    .map((file) => readFileSync(`src/features/director-command/${file}`, "utf8")).join("\n");
  for (const forbidden of ["react", "next/", "postgres", "drizzle", "node:fs", "fetch(", "WebSocket", "setTimeout", "setInterval", "process.env", "eval(", "new Function", "../runtime-", "../memory", "../persistence", "provider", ".accept(", ".execute(", "new Runtime"]) {
    assert.equal(source.toLowerCase().includes(forbidden.toLowerCase()), false, `framework must not use ${forbidden}`);
  }
}
function main(): void { immutableRegistryAndAvailability(); selectionAndMutations(); boundaryContract(); console.log("runtime adapter framework checks passed"); }
main();
