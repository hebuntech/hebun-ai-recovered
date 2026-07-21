import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WidgetRuntimeCard } from "../../src/components/director-dashboard/widget-runtime-board";
import { createDefaultWidgetRegistry, WidgetRefreshEngine, type WidgetRuntimeState } from "../../src/features/director-dashboard-widget-runtime";

function markup(state: WidgetRuntimeState): string {
  return renderToStaticMarkup(createElement(WidgetRuntimeCard, { state }));
}

function main(): void {
  assert.equal(markup({ widgetId: "runtime-overview", state: "loading" }).includes("Loading dashboard data"), true);
  assert.equal(markup({ widgetId: "monitoring-summary", state: "empty", viewModel: {
    widgetId: "monitoring-summary", sourceSnapshotId: "snapshot", title: "Monitoring Summary", primaryValue: "0", displayStatus: "available", items: [], authoritative: false,
  } }).includes("No data is currently available"), true);
  assert.equal(markup({ widgetId: "health-summary", state: "unavailable", reason: "INVALID_SCOPE" }).includes("Data source unavailable"), true);
  const failed = markup({ widgetId: "diagnostics-summary", state: "failed", reason: "WIDGET_BINDING_FAILED" });
  assert.equal(failed.includes("Widget unavailable"), true);
  assert.equal(failed.includes("WIDGET_BINDING_FAILED"), false);
  const unavailableRuntime = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0").manualRefresh({
    authorityScope: { kind: "platform", authority: "hebun-dashboard", resolvedBy: "server" },
  });
  assert.equal(Object.values(unavailableRuntime.states).every(({ state }) => state === "unavailable"), true);
  console.log("director dashboard widget state rendering checks passed");
}

main();
