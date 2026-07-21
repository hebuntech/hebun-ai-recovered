import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardFoundation } from "../../src/components/director-dashboard/dashboard-foundation";
import { ExecutiveOverviewSection } from "../../src/components/director-dashboard/executive-overview-section";
import { getDirectorDashboardUiModel } from "../../src/features/director-dashboard-ui/adapter.server";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import { emptyRuntime, healthyRuntime, readyState, uniformRuntime } from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

function render(runtime: Parameters<typeof createExecutiveOverview>[0]["runtime"]): string {
  return renderToStaticMarkup(
    createElement(ExecutiveOverviewSection, { overview: createExecutiveOverview({ runtime, evaluatedAt }) }),
  );
}

function rendersEverySectionAndTotals(): void {
  const markup = render(healthyRuntime());
  for (const label of [
    "Executive Overview", "Platform Status", "Runtime Status", "Active Agents", "Active Workflows",
    "Monitoring Summary", "Diagnostics Summary", "Evaluation Summary", "Authentication Summary",
  ]) assert.equal(markup.includes(label), true, `missing ${label}`);
  assert.equal(markup.includes("Organization healthy"), true);
  assert.equal(markup.includes("0 critical"), true);
  assert.equal(markup.includes("Snapshot fresh"), true);
}

function rendersDegradedAndUnavailableStates(): void {
  const critical = render(healthyRuntime({
    "health-summary": readyState("health-summary", [{ id: "h", label: "runtime", value: "critical", status: "FULL" }], "critical"),
  }));
  assert.equal(critical.includes("Organization critical"), true);
  assert.equal(critical.includes("1 critical"), true);

  const unavailable = render(uniformRuntime("unavailable", "DASHBOARD_SNAPSHOT_UNAVAILABLE"));
  assert.equal(unavailable.includes("Organization unavailable"), true);
  assert.equal(unavailable.includes("8 unavailable"), true);
  assert.equal(unavailable.includes("Snapshot unknown"), true);

  const empty = render(emptyRuntime());
  assert.equal(empty.includes("Organization unknown"), true);
  assert.equal(empty.includes("0 records"), true);
}

/** The overview never leaks record-level detail into the page. */
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

/** Phase 4A.3 regression: the widget board and page still render unchanged. */
function preservesExistingDashboard(): void {
  const model = getDirectorDashboardUiModel();
  const markup = renderToStaticMarkup(createElement(DashboardFoundation, { widgetRuntime: model }));
  assert.equal(markup.includes("Executive Overview"), true);
  for (const title of [
    "Director Dashboard", "Runtime Overview", "Active Agents", "Active Workflows", "Monitoring Summary",
    "Health Summary", "Diagnostics Summary", "Evaluation Summary", "Authentication Summary",
  ]) assert.equal(markup.includes(title), true, `missing ${title}`);
  assert.equal(markup.includes("Snapshot Ready"), true);
  assert.equal(markup.includes("Refresh"), true);

  // No new page or navigation entry was introduced.
  const section = readFileSync("src/components/director-dashboard/executive-overview-section.tsx", "utf8");
  assert.equal(section.includes("next/link"), false);
  assert.equal(section.includes("href"), false);

  // The overview refreshes through the same manual refresh path as the widgets.
  const board = readFileSync("src/components/director-dashboard/widget-runtime-board.tsx", "utf8");
  assert.equal(board.includes("createExecutiveOverview"), true);
  assert.equal(board.includes("<ExecutiveOverviewSection"), true);
  for (const forbiddenImport of [
    "features/runtime", "features/monitoring", "features/diagnostics",
    "features/evaluation", "features/auth", "features/observability",
  ]) assert.equal(board.includes(forbiddenImport), false);
}

rendersEverySectionAndTotals();
rendersDegradedAndUnavailableStates();
rendersNoSensitiveDetail();
preservesExistingDashboard();
console.log("executive overview ui rendering checks passed");
