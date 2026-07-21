import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getDirectorDashboardUiModel } from "../../src/features/director-dashboard-ui/adapter.server";
import {
  flushRuntimeObservabilityForTests,
  materializeRuntimeEvidence,
  monitorIdFor,
  INSTRUMENTED_COMPONENTS,
} from "../../src/features/runtime-observability";

const ADAPTER = "src/features/director-dashboard-ui/adapter.server.ts";
const PLATFORM_AUTHORITY = "hebun-dashboard";

async function model() {
  const result = getDirectorDashboardUiModel();
  await flushRuntimeObservabilityForTests();
  return result;
}

/** The placeholder arrays are gone for the three wired sources. */
function placeholdersRemoved(): void {
  const source = readFileSync(ADAPTER, "utf8");
  for (const field of ["monitoringAggregates", "healthSnapshots", "diagnosticsProjections"]) {
    assert.equal(source.includes(`${field}: []`), false, `${field} must no longer be hard-coded empty`);
  }
  assert.equal(source.includes("evidence.monitoringAggregates"), true);
  assert.equal(source.includes("evidence.healthSnapshots"), true);
  assert.equal(source.includes("evidence.diagnosticsProjections"), true);
  // Authentication and evaluation stay deliberately disconnected.
  assert.equal(source.includes("evaluationSummaries: [], authenticationSessions: []"), true);
}

/** Monitoring evidence reaches the read model from the real producer. */
async function monitoringWired(): Promise<void> {
  const { snapshot } = await model();
  const producer = materializeRuntimeEvidence().monitoringAggregates;
  assert.equal(snapshot!.models.monitoringSummary.length > 0, true, "monitoring must carry records");
  const monitorIds = new Set(snapshot!.models.monitoringSummary.map(({ monitorId }) => monitorId));
  for (const component of INSTRUMENTED_COMPONENTS) {
    assert.equal(monitorIds.has(monitorIdFor(component)), true, `${component} monitor must reach the dashboard`);
  }
  // Every dashboard row traces back to a producer record; none is invented.
  // Identity excludes the aggregate key, which embeds the rolling window bounds
  // and therefore legitimately differs between materialization instants.
  const identity = (item: { monitorId: string; component: string; signalType: string }) =>
    `${item.monitorId}|${item.component}|${item.signalType}`;
  const producerIdentities = new Set(producer.map(identity));
  for (const item of snapshot!.models.monitoringSummary) {
    assert.equal(producerIdentities.has(identity(item)), true, `row ${identity(item)} must originate from the producer`);
  }
  assert.equal(snapshot!.models.monitoringSummary.length, producer.length);
}

/** Health evidence is the producer's already-calculated state. */
async function healthWired(): Promise<void> {
  const { snapshot } = await model();
  const producer = materializeRuntimeEvidence().healthSnapshots;
  assert.equal(snapshot!.models.healthSummary.length > 0, true, "health must carry records");
  const byId = new Map(producer.map((item) => [item.snapshotId, item]));
  for (const item of snapshot!.models.healthSummary) {
    // The dashboard must not recompute health; it may only carry it.
    const origin = [...byId.values()].find((candidate) => candidate.monitorId === item.monitorId);
    assert.notEqual(origin, undefined, `${item.monitorId} must originate from the health producer`);
    assert.equal(item.healthState, origin!.state);
    assert.equal(item.evidenceCompleteness, origin!.evidenceCompleteness);
  }
  const adapter = readFileSync(ADAPTER, "utf8");
  for (const forbidden of ["evaluateMonitor", "aggregateMonitoringSignals", "rebuildProjection", "projectCanonicalSignals"]) {
    assert.equal(adapter.includes(forbidden), false, `adapter must not call ${forbidden}`);
  }
}

/** Diagnostics evidence reaches the read model from the real producer. */
async function diagnosticsWired(): Promise<void> {
  const { snapshot } = await model();
  const producer = materializeRuntimeEvidence().diagnosticsProjections;
  assert.equal(snapshot!.models.diagnosticsSummary.length > 0, true, "diagnostics must carry records");
  const producerIds = new Set(producer.map(({ projectionId }) => projectionId));
  for (const item of snapshot!.models.diagnosticsSummary) {
    assert.equal(producerIds.has(item.projectionId), true, `${item.projectionId} must originate from the producer`);
  }
}

/** Platform scope is preserved end to end; no tenant identity may appear. */
async function platformScopePreserved(): Promise<void> {
  const { snapshot } = await model();
  assert.equal(snapshot!.authorityScope.kind, "platform");
  assert.equal(snapshot!.authorityScope.kind === "platform" && snapshot!.authorityScope.authority, PLATFORM_AUTHORITY);
  const evidence = materializeRuntimeEvidence();
  for (const aggregate of evidence.monitoringAggregates) {
    assert.equal(aggregate.platformAuthority, PLATFORM_AUTHORITY);
    assert.equal(aggregate.tenantId, undefined);
  }
  for (const projection of evidence.diagnosticsProjections) {
    assert.equal(projection.platformAuthority, PLATFORM_AUTHORITY);
    assert.equal(projection.tenantId, undefined);
  }
  // The 4A.1 scope rule is intact and still forbids sessions under platform scope.
  const aggregation = readFileSync("src/features/director-dashboard-data/aggregation.ts", "utf8");
  assert.equal(aggregation.includes("if (source.authenticationSessions.length > 0) return false;"), true);
}

/** Authentication and evaluation remain deliberately disconnected. */
async function authenticationAndEvaluationUnchanged(): Promise<void> {
  const { snapshot, widgets } = await model();
  assert.equal(snapshot!.models.authenticationSummary.length, 0);
  assert.equal(snapshot!.models.evaluationSummary.length, 0);
  assert.equal(widgets.states["authentication-summary"].state, "empty");
  assert.equal(widgets.states["evaluation-summary"].state, "empty");
}

/** Completeness now reflects real evidence rather than MISSING. */
async function completenessReflectsEvidence(): Promise<void> {
  const { snapshot } = await model();
  assert.notEqual(snapshot!.completeness, "MISSING", "completeness must no longer be MISSING");
  const evidence = materializeRuntimeEvidence();
  const rank = { FULL: 0, PARTIAL: 1, UNKNOWN: 2, MISSING: 3 } as const;
  const expected = [...evidence.healthSnapshots, ...evidence.diagnosticsProjections]
    .map(({ evidenceCompleteness }) => evidenceCompleteness)
    .reduce((worst, value) => (rank[value] > rank[worst] ? value : worst), "FULL" as const);
  assert.equal(snapshot!.completeness, expected, "completeness must be the producer's worst evidence");
}

/** Widgets bind the newly connected evidence. */
async function widgetsConsumeEvidence(): Promise<void> {
  const { widgets } = await model();
  for (const widgetId of ["monitoring-summary", "health-summary", "diagnostics-summary"] as const) {
    assert.equal(widgets.states[widgetId].state, "ready", `${widgetId} must be ready`);
    assert.equal((widgets.states[widgetId].viewModel?.items.length ?? 0) > 0, true);
  }
}

/** Executive Overview judges the real evidence, and never calls it healthy for free. */
async function overviewConsumesEvidence(): Promise<void> {
  const { overview } = await model();
  const producer = materializeRuntimeEvidence().healthSnapshots;
  const platform = overview.sections.find(({ sectionId }) => sectionId === "platform-status");
  assert.equal(platform?.reasonCode !== "SECTION_EMPTY", true, "platform status must now have evidence");
  assert.equal(platform?.recordCount, producer.length);
  // Platform health must equal what the health producer reported, not a default.
  const worst = producer.some(({ state }) => state === "critical") ? "critical"
    : producer.some(({ state }) => state === "degraded" || state === "watch") ? "warning"
      : producer.some(({ state }) => state === "unknown") ? "unknown" : "healthy";
  assert.equal(platform?.health, worst, "platform health must come from the health producer");

  for (const sectionId of ["monitoring-summary", "diagnostics-summary"] as const) {
    const section = overview.sections.find((candidate) => candidate.sectionId === sectionId);
    assert.equal(section?.reasonCode !== "SECTION_EMPTY", true, `${sectionId} must now have evidence`);
    assert.equal((section?.recordCount ?? 0) > 0, true);
  }
}

/** Executive Insights explain the real evidence with real counts. */
async function insightsExplainEvidence(): Promise<void> {
  const { insights, overview } = await model();
  assert.equal(insights.length, overview.sections.length);
  for (const sectionId of ["platform-status", "monitoring-summary", "diagnostics-summary"] as const) {
    const insight = insights.find((candidate) => candidate.sectionId === sectionId);
    const section = overview.sections.find((candidate) => candidate.sectionId === sectionId);
    assert.notEqual(insight, undefined);
    assert.equal(insight!.evidenceCount, section!.recordCount);
    assert.equal(insight!.severity, section!.health);
    assert.equal(insight!.summary.includes(String(section!.recordCount)), true, "summary must cite the real count");
    assert.equal(insight!.summary.includes("returned no records"), false);
  }
}

/** Snapshots handed to the dashboard are immutable. */
async function immutableSnapshots(): Promise<void> {
  const { snapshot } = await model();
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot!.models.monitoringSummary), true);
  assert.equal(Object.isFrozen(snapshot!.models.healthSummary), true);
  assert.equal(Object.isFrozen(snapshot!.models.diagnosticsSummary), true);
  assert.throws(() => {
    (snapshot!.models.healthSummary as unknown as { push: (value: unknown) => void }).push({});
  });
  const evidence = materializeRuntimeEvidence();
  assert.equal(Object.isFrozen(evidence.monitoringAggregates), true);
  assert.equal(Object.isFrozen(evidence.healthSnapshots), true);
}

/** The adapter stays read-only and imports nothing forbidden. */
function adapterBoundaries(): void {
  const source = readFileSync(ADAPTER, "utf8");
  for (const forbidden of ["drizzle-orm", '"pg"', "@/db", "postgres", "storage-manager", "memory-adapter", "/persistence"]) {
    assert.equal(source.includes(forbidden), false, `adapter must not import ${forbidden}`);
  }
  // Runtime observability is reached only through its public read API.
  assert.equal(source.includes('from "../runtime-observability"'), true);
  assert.equal(source.includes("runtime-observability/"), false, "no deep import into producer internals");
  // No mutation of any producer or registry.
  for (const mutator of ["observeProjectionRefresh", "observeRuntimeStartup", "resetRuntimeObservability", ".append(", "register("]) {
    assert.equal(source.includes(mutator), false, `adapter must not call ${mutator}`);
  }
}

/** Downstream contracts are untouched by this phase. */
function contractsUnchanged(): void {
  const dataTypes = readFileSync("src/features/director-dashboard-data/types.ts", "utf8");
  assert.equal(dataTypes.includes("readonly monitoringAggregates: readonly MonitoringAggregate[];"), true);
  assert.equal(dataTypes.includes("readonly healthSnapshots: readonly HealthSnapshot[];"), true);
  assert.equal(dataTypes.includes("readonly diagnosticsProjections: readonly DiagnosticsProjection[];"), true);
  assert.equal(dataTypes.includes("readonly authoritative: false;"), true);
}

async function main(): Promise<void> {
  placeholdersRemoved();
  await monitoringWired();
  await healthWired();
  await diagnosticsWired();
  await platformScopePreserved();
  await authenticationAndEvaluationUnchanged();
  await completenessReflectsEvidence();
  await widgetsConsumeEvidence();
  await overviewConsumesEvidence();
  await insightsExplainEvidence();
  await immutableSnapshots();
  adapterBoundaries();
  contractsUnchanged();
  console.log("dashboard evidence producer wiring checks passed");
}

void main();
