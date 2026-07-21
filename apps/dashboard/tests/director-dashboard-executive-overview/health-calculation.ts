import assert from "node:assert/strict";
import {
  calculateSectionHealth,
  createExecutiveOverview,
  EXECUTIVE_HEALTH_STATES,
  foldOrganizationHealth,
  HEALTH_SEVERITY_RANK,
  SECTION_RULES,
  type ExecutiveHealthState,
  type ExecutiveSectionId,
} from "../../src/features/director-dashboard-executive-overview";
import type { DashboardWidgetId, WidgetDisplayItem } from "../../src/features/director-dashboard-widget-runtime";
import { healthyRuntime, readyState } from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

function ruleFor(sectionId: ExecutiveSectionId) {
  const rule = SECTION_RULES.find((candidate) => candidate.sectionId === sectionId);
  assert.notEqual(rule, undefined);
  return rule!;
}

function sectionHealth(sectionId: ExecutiveSectionId, items: readonly WidgetDisplayItem[], displayStatus = "available"): ExecutiveHealthState {
  const rule = ruleFor(sectionId);
  return calculateSectionHealth(rule, readyState(rule.widgetId, items, displayStatus));
}

function item(overrides: Partial<WidgetDisplayItem> = {}): WidgetDisplayItem {
  return { id: "x", label: "x", value: "1", status: "healthy", ...overrides };
}

function severityRankIsTotalAndExplicit(): void {
  const ranks = EXECUTIVE_HEALTH_STATES.map((state) => HEALTH_SEVERITY_RANK[state]);
  assert.equal(new Set(ranks).size, EXECUTIVE_HEALTH_STATES.length);
  assert.equal(HEALTH_SEVERITY_RANK.critical > HEALTH_SEVERITY_RANK.unavailable, true);
  assert.equal(HEALTH_SEVERITY_RANK.unavailable > HEALTH_SEVERITY_RANK.warning, true);
  assert.equal(HEALTH_SEVERITY_RANK.warning > HEALTH_SEVERITY_RANK.unknown, true);
  assert.equal(HEALTH_SEVERITY_RANK.unknown > HEALTH_SEVERITY_RANK.healthy, true);
}

function foldsToWorstState(): void {
  assert.equal(foldOrganizationHealth([]), "unknown");
  assert.equal(foldOrganizationHealth(["healthy", "healthy"]), "healthy");
  assert.equal(foldOrganizationHealth(["healthy", "unknown"]), "unknown");
  assert.equal(foldOrganizationHealth(["unknown", "warning"]), "warning");
  assert.equal(foldOrganizationHealth(["warning", "unavailable"]), "unavailable");
  assert.equal(foldOrganizationHealth(["unavailable", "critical"]), "critical");
  assert.equal(foldOrganizationHealth(["critical", "healthy"]), "critical");
}

function mapsRuntimeStatusTokens(): void {
  assert.equal(sectionHealth("runtime-status", [item({ status: "healthy" })], "operational"), "healthy");
  assert.equal(sectionHealth("runtime-status", [item({ status: "stale" })], "operational"), "warning");
  assert.equal(sectionHealth("runtime-status", [item({ status: "uninitialized" })], "operational"), "warning");
  assert.equal(sectionHealth("runtime-status", [item({ status: "error" })], "error"), "critical");
  // A critical token anywhere outranks healthy peers.
  assert.equal(sectionHealth("runtime-status", [item({ status: "healthy" }), item({ status: "error" })], "error"), "critical");
}

function mapsPlatformStatusTokens(): void {
  assert.equal(sectionHealth("platform-status", [item({ value: "healthy" })], "healthy"), "healthy");
  assert.equal(sectionHealth("platform-status", [item({ value: "watch" })], "healthy"), "warning");
  assert.equal(sectionHealth("platform-status", [item({ value: "degraded" })], "degraded"), "warning");
  assert.equal(sectionHealth("platform-status", [item({ value: "critical" })], "critical"), "critical");
  assert.equal(sectionHealth("platform-status", [item({ value: "unknown" })], "healthy"), "unknown");
}

function mapsAgentAndWorkflowTokens(): void {
  for (const sectionId of ["active-agents", "active-workflows"] as const) {
    assert.equal(sectionHealth(sectionId, [item({ status: "healthy" })]), "healthy");
    assert.equal(sectionHealth(sectionId, [item({ status: "watch" })]), "warning");
    assert.equal(sectionHealth(sectionId, [item({ status: "degraded" })]), "warning");
    assert.equal(sectionHealth(sectionId, [item({ status: "critical" })]), "critical");
    assert.equal(sectionHealth(sectionId, [item({ status: "unknown" })]), "unknown");
  }
}

function mapsDiagnosticsSeverity(): void {
  assert.equal(sectionHealth("diagnostics-summary", [item({ value: "debug" })]), "healthy");
  assert.equal(sectionHealth("diagnostics-summary", [item({ value: "info" })]), "healthy");
  assert.equal(sectionHealth("diagnostics-summary", [item({ value: "warning" })]), "warning");
  assert.equal(sectionHealth("diagnostics-summary", [item({ value: "error" })]), "critical");
  assert.equal(sectionHealth("diagnostics-summary", [item({ value: "critical" })]), "critical");
}

function mapsEvaluationTokens(): void {
  assert.equal(sectionHealth("evaluation-summary", [item({ status: "passed" })]), "healthy");
  assert.equal(sectionHealth("evaluation-summary", [item({ status: "failed" })]), "warning");
  assert.equal(sectionHealth("evaluation-summary", [item({ status: "inconclusive" })]), "warning");
}

function countOnlySectionsStayHealthy(): void {
  // Monitoring and authentication expose no severity signal, so a readable
  // widget is healthy and never escalates on unrelated token values.
  assert.equal(sectionHealth("monitoring-summary", [item({ status: "critical", value: "critical" })]), "healthy");
  assert.equal(sectionHealth("authentication-summary", [item({ status: "critical", value: "critical" })]), "healthy");
}

function neverGuessesOnUnreadableWidgets(): void {
  for (const rule of SECTION_RULES) {
    const widgetId: DashboardWidgetId = rule.widgetId;
    assert.equal(calculateSectionHealth(rule, { widgetId, state: "unavailable", reason: "INVALID_SCOPE" }), "unavailable");
    assert.equal(calculateSectionHealth(rule, { widgetId, state: "failed", reason: "WIDGET_BINDING_FAILED" }), "unavailable");
    assert.equal(calculateSectionHealth(rule, { widgetId, state: "loading" }), "unknown");
    assert.equal(calculateSectionHealth(rule, { widgetId, state: "ready" }), "unknown", "ready without a view model must not be judged healthy");
  }
}

function organizationHealthMatchesWorstSection(): void {
  const overview = createExecutiveOverview({
    runtime: healthyRuntime({
      "active-agents": readyState("active-agents", [item({ id: "a", status: "watch" })]),
    }),
    evaluatedAt,
  });
  assert.equal(overview.organizationHealth, "warning");
  assert.equal(
    overview.organizationHealth,
    foldOrganizationHealth(overview.sections.map((section) => section.health)),
  );
}

severityRankIsTotalAndExplicit();
foldsToWorstState();
mapsRuntimeStatusTokens();
mapsPlatformStatusTokens();
mapsAgentAndWorkflowTokens();
mapsDiagnosticsSeverity();
mapsEvaluationTokens();
countOnlySectionsStayHealthy();
neverGuessesOnUnreadableWidgets();
organizationHealthMatchesWorstSection();
console.log("executive overview health calculation checks passed");
