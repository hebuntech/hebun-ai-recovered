import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardFoundation } from "../../src/components/director-dashboard/dashboard-foundation";
import { ExecutiveInsightsSection } from "../../src/components/director-dashboard/executive-insights-section";
import { getDirectorDashboardUiModel } from "../../src/features/director-dashboard-ui/adapter.server";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import { createExecutiveInsights } from "../../src/features/director-dashboard-executive-insights";
import { emptyRuntime, healthyRuntime, readyState, uniformRuntime } from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

function render(runtime: Parameters<typeof createExecutiveOverview>[0]["runtime"]): string {
  const insights = createExecutiveInsights(createExecutiveOverview({ runtime, evaluatedAt }));
  return renderToStaticMarkup(createElement(ExecutiveInsightsSection, { insights }));
}

function rendersEveryInsight(): void {
  const markup = render(healthyRuntime());
  assert.equal(markup.includes("Executive Insights"), true);
  for (const label of [
    "Platform Status", "Runtime Status", "Active Agents", "Active Workflows",
    "Monitoring Summary", "Diagnostics Summary", "Evaluation Summary", "Authentication Summary",
  ]) assert.equal(markup.includes(label), true, `missing ${label}`);
  assert.equal(markup.includes("reports no issues across"), true);
  assert.equal(markup.includes("No action required."), true);
}

function rendersDegradedAndUnavailableStates(): void {
  const critical = render(healthyRuntime({
    "health-summary": readyState("health-summary", [{ id: "h", label: "runtime", value: "critical", status: "FULL" }], "critical"),
  }));
  assert.equal(critical.includes("Platform Status reports a critical state"), true);

  const unavailable = render(uniformRuntime("unavailable", "DASHBOARD_SNAPSHOT_UNAVAILABLE"));
  assert.equal(unavailable.includes("could not be read from the current snapshot"), true);
  assert.equal(unavailable.includes("Refresh the dashboard"), true);

  const empty = render(emptyRuntime());
  assert.equal(empty.includes("returned no records in the current snapshot"), true);
}

/** No sections to explain must render the empty state, not a blank card. */
function rendersEmptyInsightList(): void {
  const markup = renderToStaticMarkup(createElement(ExecutiveInsightsSection, { insights: [] }));
  assert.equal(markup.includes("No insights are currently available"), true);
}

function rendersNoSensitiveDetail(): void {
  const markup = render(healthyRuntime({
    "authentication-summary": readyState("authentication-summary", [
      { id: "session-secret-1", label: "user-1@example.com", value: "aal2", status: "mfa" },
    ]),
  }));
  for (const forbidden of [
    "session-secret-1", "user-1@example.com", "accessToken", "refreshToken",
    "hiddenReasoning", "providerPayload", "memoryContent",
  ]) assert.equal(markup.includes(forbidden), false, `markup must not expose ${forbidden}`);
}

/** Phase 4A.3 and 4A.4 regression: overview and widgets still render. */
function preservesExistingDashboard(): void {
  const model = getDirectorDashboardUiModel();
  const markup = renderToStaticMarkup(createElement(DashboardFoundation, { widgetRuntime: model }));
  assert.equal(markup.includes("Executive Insights"), true);
  assert.equal(markup.includes("Executive Overview"), true);
  for (const title of [
    "Director Dashboard", "Runtime Overview", "Active Agents", "Active Workflows", "Monitoring Summary",
    "Health Summary", "Diagnostics Summary", "Evaluation Summary", "Authentication Summary",
  ]) assert.equal(markup.includes(title), true, `missing ${title}`);
  assert.equal(markup.includes("Snapshot Ready"), true);
  assert.equal(markup.includes("Refresh"), true);
  assert.equal(model.insights.length, model.overview.sections.length);

  // No new page, route, or navigation entry.
  const section = readFileSync("src/components/director-dashboard/executive-insights-section.tsx", "utf8");
  assert.equal(section.includes("next/link"), false);
  assert.equal(section.includes("href"), false);

  // Insights refresh through the same manual refresh path as the widgets.
  const board = readFileSync("src/components/director-dashboard/widget-runtime-board.tsx", "utf8");
  assert.equal(board.includes("createExecutiveInsights"), true);
  assert.equal(board.includes("<ExecutiveInsightsSection"), true);
  assert.equal(board.includes("<ExecutiveOverviewSection"), true);
  for (const forbiddenImport of [
    "features/runtime", "features/monitoring", "features/diagnostics",
    "features/evaluation", "features/auth", "features/observability",
  ]) assert.equal(board.includes(forbiddenImport), false);
}

rendersEveryInsight();
rendersDegradedAndUnavailableStates();
rendersEmptyInsightList();
rendersNoSensitiveDetail();
preservesExistingDashboard();
console.log("executive insight ui rendering checks passed");
