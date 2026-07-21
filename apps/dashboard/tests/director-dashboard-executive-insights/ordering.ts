import assert from "node:assert/strict";
import {
  createExecutiveOverview,
  EXECUTIVE_SECTION_IDS,
  HEALTH_SEVERITY_RANK,
} from "../../src/features/director-dashboard-executive-overview";
import {
  createExecutiveInsights,
  orderInsights,
  type ExecutiveInsight,
} from "../../src/features/director-dashboard-executive-insights";
import { healthyRuntime, readyState, uniformRuntime } from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

function insight(sectionId: ExecutiveInsight["sectionId"], severity: ExecutiveInsight["severity"]): ExecutiveInsight {
  return {
    sectionId, title: sectionId, severity, summary: "s", evidenceCount: 0,
    evidenceSource: "runtime-overview", recommendedAction: "a", reasonCode: "SECTION_HEALTHY",
    evaluatedAt: "2026-07-21T12:01:00.000Z", authoritative: false,
  };
}

function ordersCriticalWarningUnknownHealthy(): void {
  const ordered = orderInsights([
    insight("authentication-summary", "healthy"),
    insight("monitoring-summary", "unknown"),
    insight("active-agents", "warning"),
    insight("runtime-status", "critical"),
  ]);
  assert.deepEqual(ordered.map((entry) => entry.severity), ["critical", "warning", "unknown", "healthy"]);
}

/** Unavailable sits between critical and warning, matching the overview rank. */
function placesUnavailableByOverviewRank(): void {
  const ordered = orderInsights([
    insight("authentication-summary", "healthy"),
    insight("monitoring-summary", "unknown"),
    insight("active-agents", "warning"),
    insight("active-workflows", "unavailable"),
    insight("runtime-status", "critical"),
  ]);
  assert.deepEqual(ordered.map((entry) => entry.severity), ["critical", "unavailable", "warning", "unknown", "healthy"]);
}

function tieBreaksOnCanonicalSectionOrder(): void {
  const all = EXECUTIVE_SECTION_IDS.map((sectionId) => insight(sectionId, "critical"));
  const shuffled = [...all].reverse();
  assert.deepEqual(orderInsights(shuffled).map((entry) => entry.sectionId), [...EXECUTIVE_SECTION_IDS]);
  // Input order must not change the result.
  assert.deepEqual(orderInsights(shuffled), orderInsights(all));
}

function doesNotMutateInput(): void {
  const input = [insight("active-agents", "healthy"), insight("runtime-status", "critical")];
  const before = [...input];
  orderInsights(input);
  assert.deepEqual(input, before);
}

function generatedInsightsAreSortedBySeverity(): void {
  const insights = createExecutiveInsights(createExecutiveOverview({
    runtime: healthyRuntime({
      "diagnostics-summary": readyState("diagnostics-summary", [{ id: "d", label: "d", value: "critical", status: "FULL" }]),
      "active-agents": readyState("active-agents", [{ id: "a", label: "a", value: "org", status: "watch" }]),
      "evaluation-summary": { widgetId: "evaluation-summary", state: "unavailable", reason: "INVALID_SCOPE" },
    }),
    evaluatedAt,
  }));
  assert.equal(insights[0]?.sectionId, "diagnostics-summary");
  assert.equal(insights[0]?.severity, "critical");
  assert.equal(insights[1]?.severity, "unavailable");
  assert.equal(insights[2]?.severity, "warning");
  for (let index = 1; index < insights.length; index += 1) {
    const previous = HEALTH_SEVERITY_RANK[insights[index - 1]!.severity];
    assert.equal(previous >= HEALTH_SEVERITY_RANK[insights[index]!.severity], true);
  }
}

/** Insight order must match the overview's own section order exactly. */
function mirrorsOverviewSectionOrder(): void {
  const overview = createExecutiveOverview({
    runtime: healthyRuntime({
      "health-summary": readyState("health-summary", [{ id: "h", label: "h", value: "critical", status: "FULL" }], "critical"),
      "active-workflows": { widgetId: "active-workflows", state: "failed", reason: "WIDGET_BINDING_FAILED" },
    }),
    evaluatedAt,
  });
  assert.deepEqual(
    createExecutiveInsights(overview).map((entry) => entry.sectionId),
    overview.sections.map((entry) => entry.sectionId),
  );
}

function uniformSeverityKeepsCanonicalOrder(): void {
  const insights = createExecutiveInsights(createExecutiveOverview({ runtime: uniformRuntime("unavailable"), evaluatedAt }));
  assert.deepEqual(insights.map((entry) => entry.sectionId), [...EXECUTIVE_SECTION_IDS]);
}

ordersCriticalWarningUnknownHealthy();
placesUnavailableByOverviewRank();
tieBreaksOnCanonicalSectionOrder();
doesNotMutateInput();
generatedInsightsAreSortedBySeverity();
mirrorsOverviewSectionOrder();
uniformSeverityKeepsCanonicalOrder();
console.log("executive insight ordering checks passed");
