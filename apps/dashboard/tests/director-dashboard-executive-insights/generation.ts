import assert from "node:assert/strict";
import {
  createExecutiveOverview,
  EXECUTIVE_SECTION_IDS,
} from "../../src/features/director-dashboard-executive-overview";
import { createExecutiveInsights } from "../../src/features/director-dashboard-executive-insights";
import { emptyRuntime, healthyRuntime, readyState, uniformRuntime } from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

function overviewOf(runtime: Parameters<typeof createExecutiveOverview>[0]["runtime"], at = evaluatedAt) {
  return createExecutiveOverview({ runtime, evaluatedAt: at });
}

function explainsEverySection(): void {
  const insights = createExecutiveInsights(overviewOf(healthyRuntime()));
  assert.equal(insights.length, EXECUTIVE_SECTION_IDS.length);
  assert.deepEqual(
    [...insights.map((insight) => insight.sectionId)].sort(),
    [...EXECUTIVE_SECTION_IDS].sort(),
  );
}

/** Severity must always agree with the section the insight explains. */
function neverDisagreesWithTheOverview(): void {
  const overview = overviewOf(healthyRuntime({
    "health-summary": readyState("health-summary", [{ id: "h", label: "runtime", value: "critical", status: "FULL" }], "critical"),
    "active-agents": readyState("active-agents", [{ id: "a", label: "Agent", value: "org", status: "watch" }]),
    "evaluation-summary": { widgetId: "evaluation-summary", state: "unavailable", reason: "INVALID_SCOPE" },
  }));
  for (const insight of createExecutiveInsights(overview)) {
    const section = overview.sections.find((candidate) => candidate.sectionId === insight.sectionId);
    assert.notEqual(section, undefined);
    assert.equal(insight.severity, section!.health);
    assert.equal(insight.reasonCode, section!.reasonCode);
    assert.equal(insight.evidenceCount, section!.recordCount);
    assert.equal(insight.evidenceSource, section!.widgetId);
    assert.equal(insight.title, section!.label);
  }
}

function explainsWhyPerReasonCode(): void {
  const overview = overviewOf(healthyRuntime({
    "health-summary": readyState("health-summary", [{ id: "h", label: "runtime", value: "critical", status: "FULL" }], "critical"),
    "active-agents": readyState("active-agents", [{ id: "a", label: "Agent", value: "org", status: "watch" }]),
    "diagnostics-summary": readyState("diagnostics-summary", []),
    "evaluation-summary": { widgetId: "evaluation-summary", state: "unavailable", reason: "INVALID_SCOPE" },
  }));
  const by = (sectionId: string) => createExecutiveInsights(overview).find((insight) => insight.sectionId === sectionId)!;

  const critical = by("platform-status");
  assert.equal(critical.summary, "Platform Status reports a critical state across 1 observed record.");
  assert.equal(critical.recommendedAction.includes("review the records"), true);

  const warning = by("active-agents");
  assert.equal(warning.summary, "Active Agents reports a degraded state across 1 observed record.");

  const empty = by("diagnostics-summary");
  assert.equal(empty.summary.includes("returned no records"), true);
  assert.equal(empty.evidenceCount, 0);

  const unavailable = by("evaluation-summary");
  assert.equal(unavailable.summary, "Evaluation Summary could not be read from the current snapshot.");

  const healthy = by("runtime-status");
  assert.equal(healthy.summary, "Runtime Status reports no issues across 1 observed record.");
  assert.equal(healthy.recommendedAction, "No action required.");
}

/** Record counts must be pluralized from the real count, never invented. */
function reportsEvidenceCountsFaithfully(): void {
  const overview = overviewOf(healthyRuntime({
    "active-agents": readyState("active-agents", [
      { id: "a1", label: "A1", value: "org", status: "healthy" },
      { id: "a2", label: "A2", value: "org", status: "healthy" },
      { id: "a3", label: "A3", value: "org", status: "healthy" },
    ]),
  }));
  const agents = createExecutiveInsights(overview).find((insight) => insight.sectionId === "active-agents")!;
  assert.equal(agents.evidenceCount, 3);
  assert.equal(agents.summary, "Active Agents reports no issues across 3 observed records.");
}

function carriesSnapshotTimestamps(): void {
  const withSnapshot = createExecutiveInsights(overviewOf(healthyRuntime()));
  for (const insight of withSnapshot) {
    assert.equal(insight.snapshotTimestamp, "2026-07-21T12:00:00.000Z");
    assert.equal(insight.evaluatedAt, "2026-07-21T12:01:00.000Z");
    assert.equal(insight.authoritative, false);
  }
  // No refresh time known: the field is omitted rather than guessed.
  for (const insight of createExecutiveInsights(overviewOf(uniformRuntime("unavailable")))) {
    assert.equal(insight.snapshotTimestamp, undefined);
    assert.equal("snapshotTimestamp" in insight, false);
  }
}

function isDeeplyImmutable(): void {
  const insights = createExecutiveInsights(overviewOf(healthyRuntime()));
  assert.equal(Object.isFrozen(insights), true);
  assert.equal(Object.isFrozen(insights[0]), true);
  assert.throws(() => {
    (insights as unknown as { push: (value: unknown) => void }).push({});
  });
}

function isDeterministic(): void {
  assert.deepEqual(
    createExecutiveInsights(overviewOf(healthyRuntime())),
    createExecutiveInsights(overviewOf(healthyRuntime())),
  );
}

function reportsEmptyState(): void {
  const insights = createExecutiveInsights(overviewOf(emptyRuntime()));
  assert.equal(insights.length, EXECUTIVE_SECTION_IDS.length);
  for (const insight of insights) {
    assert.equal(insight.severity, "unknown");
    assert.equal(insight.reasonCode, "SECTION_EMPTY");
    assert.equal(insight.evidenceCount, 0);
    assert.equal(insight.summary.includes("no records"), true);
  }
}

function reportsUnavailableState(): void {
  for (const state of ["unavailable", "failed"] as const) {
    const insights = createExecutiveInsights(overviewOf(uniformRuntime(state, "DASHBOARD_SNAPSHOT_UNAVAILABLE")));
    assert.equal(insights.length, EXECUTIVE_SECTION_IDS.length);
    for (const insight of insights) {
      assert.equal(insight.severity, "unavailable");
      assert.equal(insight.reasonCode, "SECTION_UNAVAILABLE");
      assert.equal(insight.evidenceCount, 0);
      assert.equal(insight.recommendedAction.includes("Refresh the dashboard"), true);
    }
  }
}

function reportsLoadingState(): void {
  for (const insight of createExecutiveInsights(overviewOf(uniformRuntime("loading")))) {
    assert.equal(insight.severity, "unknown");
    assert.equal(insight.reasonCode, "SECTION_LOADING");
    assert.equal(insight.summary.includes("has not resolved"), true);
  }
}

explainsEverySection();
neverDisagreesWithTheOverview();
explainsWhyPerReasonCode();
reportsEvidenceCountsFaithfully();
carriesSnapshotTimestamps();
isDeeplyImmutable();
isDeterministic();
reportsEmptyState();
reportsUnavailableState();
reportsLoadingState();
console.log("executive insight generation checks passed");
