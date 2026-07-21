import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardFoundation } from "../../src/components/director-dashboard/dashboard-foundation";
import { getDirectorDashboardUiModel } from "../../src/features/director-dashboard-ui/adapter.server";

function main(): void {
  const model = getDirectorDashboardUiModel();
  const markup = renderToStaticMarkup(createElement(DashboardFoundation, { widgetRuntime: model }));
  for (const title of [
    "Runtime Overview", "Active Agents", "Active Workflows", "Monitoring Summary",
    "Health Summary", "Diagnostics Summary", "Evaluation Summary", "Authentication Summary",
  ]) assert.equal(markup.includes(title), true);
  assert.equal(markup.includes("Snapshot Ready"), true);
  assert.equal(markup.includes("Snapshot MISSING"), false);
  assert.equal(markup.includes("Refresh"), true);
  for (const forbidden of ["accessToken", "refreshToken", "hiddenReasoning", "providerPayload", "memoryContent"]) {
    assert.equal(markup.includes(forbidden), false);
  }
  const page = readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");
  const board = readFileSync("src/components/director-dashboard/widget-runtime-board.tsx", "utf8");
  assert.equal(page.includes("getDirectorDashboardUiModel"), true);
  assert.equal(page.includes("getDirectorDashboardSnapshot"), false);
  for (const forbiddenImport of ["features/runtime", "features/monitoring", "features/diagnostics", "features/evaluation", "features/auth", "features/observability"]) {
    assert.equal(board.includes(forbiddenImport), false);
  }
  console.log("director dashboard route and ready-widget rendering checks passed");
}

main();
