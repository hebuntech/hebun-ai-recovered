import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardFoundation } from "../../src/components/director-dashboard/dashboard-foundation";
import { getDirectorDashboardUiModel } from "../../src/features/director-dashboard-ui/adapter.server";
import {
  DASHBOARD_PLATFORM_AUTHORITY,
  DASHBOARD_SCOPE,
} from "../../src/features/director-dashboard-ui/scope";

const COMPONENTS = "src/components/director-dashboard";
const BOARD = join(COMPONENTS, "widget-runtime-board.tsx");
const FOUNDATION = join(COMPONENTS, "dashboard-foundation.tsx");
const ADAPTER = "src/features/director-dashboard-ui/adapter.server.ts";

/** The canonical scope keeps the existing authority and stays immutable. */
function canonicalScopeIdentity(): void {
  assert.equal(DASHBOARD_PLATFORM_AUTHORITY, "hebun-dashboard");
  assert.equal(DASHBOARD_SCOPE.kind, "platform");
  assert.equal(DASHBOARD_SCOPE.kind === "platform" && DASHBOARD_SCOPE.authority, "hebun-dashboard");
  assert.equal(DASHBOARD_SCOPE.resolvedBy, "server");
  assert.equal(Object.isFrozen(DASHBOARD_SCOPE), true);
  assert.throws(() => {
    (DASHBOARD_SCOPE as unknown as { authority: string }).authority = "other";
  });
  assert.equal(DASHBOARD_SCOPE.kind === "platform" && DASHBOARD_SCOPE.authority, "hebun-dashboard");
  // No tenant scope and no scope switching were introduced.
  assert.equal("tenantId" in DASHBOARD_SCOPE, false);
}

/** Every dashboard consumer uses the canonical definition, none redeclares it. */
function allConsumersUseCanonicalScope(): void {
  for (const file of [ADAPTER, BOARD]) {
    const source = readFileSync(file, "utf8");
    assert.equal(source.includes("DASHBOARD_SCOPE"), true, `${file} must import the canonical scope`);
    assert.equal(
      /authority:\s*"hebun-dashboard"/.test(source),
      false,
      `${file} must not redeclare the platform authority`,
    );
  }
  // The literal exists in exactly one dashboard definition.
  const declarations = readdirSync(COMPONENTS)
    .filter((name) => name.endsWith(".tsx"))
    .filter((name) => /authority:\s*"hebun-dashboard"/.test(readFileSync(join(COMPONENTS, name), "utf8")));
  assert.deepEqual(declarations, [], "no dashboard component may declare its own scope");
  const scopeSource = readFileSync("src/features/director-dashboard-ui/scope.ts", "utf8");
  assert.equal((scopeSource.match(/hebun-dashboard/g) ?? []).length, 1);
}

/** Scope behaviour is unchanged: the adapter still produces a valid snapshot. */
function scopeBehaviourUnchanged(): void {
  const model = getDirectorDashboardUiModel();
  assert.notEqual(model.snapshot, undefined, "canonical scope must still validate");
  assert.equal(model.snapshot!.authorityScope.kind, "platform");
  assert.equal(
    model.snapshot!.authorityScope.kind === "platform" && model.snapshot!.authorityScope.authority,
    "hebun-dashboard",
  );
  // The 4A.1 platform-scope rule is untouched.
  const aggregation = readFileSync("src/features/director-dashboard-data/aggregation.ts", "utf8");
  assert.equal(aggregation.includes("if (source.authenticationSessions.length > 0) return false;"), true);
}

/** The unreachable legacy render path and its orphans are gone. */
function legacyPathRemoved(): void {
  const removed = [
    "active-goals-section", "active-missions-section", "agent-activity-section", "alerts-risks-section",
    "company-overview-section", "director-insights-section", "executive-timeline-section",
    "knowledge-overview-section", "memory-overview-section", "opportunities-section",
    "organizational-health-section", "recent-decisions-section", "workflow-activity-section",
    "signal-list", "timeline-list", "health-indicator",
  ];
  for (const name of removed) {
    assert.equal(existsSync(join(COMPONENTS, `${name}.tsx`)), false, `${name} must be removed`);
  }
  const foundation = readFileSync(FOUNDATION, "utf8");
  assert.equal(foundation.includes("DirectorDashboardSnapshot"), false, "legacy branch must be gone");
  assert.equal(foundation.includes("snapshot?:"), false);
  assert.equal(foundation.includes("memoryProvider"), false);
  assert.equal(foundation.includes("Badge"), false, "unused import must be gone");
}

/** Nothing still-referenced was removed, and no orphan export remains. */
function noOrphansAndNothingLiveRemoved(): void {
  for (const name of readdirSync(COMPONENTS).filter((file) => file.endsWith(".tsx"))) {
    const base = name.replace(/\.tsx$/, "");
    const consumers = ["src", "tests"].flatMap((root) => grep(root, `director-dashboard/${base}`))
      .filter((file) => !file.endsWith(name));
    assert.equal(consumers.length > 0, true, `${base} is an orphan and must not remain`);
  }
  // Still-referenced paths were preserved.
  assert.equal(existsSync("src/features/director-dashboard/foundation.ts"), true);
  assert.equal(existsSync(join(COMPONENTS, "ai-transformation-section.tsx")), true);
  assert.equal(existsSync(join(COMPONENTS, "item-list.tsx")), true);
  assert.equal(existsSync(join(COMPONENTS, "metric-grid.tsx")), true);
  const foundationSource = readFileSync("src/features/director-dashboard/foundation.ts", "utf8");
  assert.equal(foundationSource.includes("export async function getDirectorDashboardSnapshot"), true,
    "the legacy read API is still consumed by persistence parity tests and must remain");
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

/** The route still renders, with no public API regression. */
function noPublicApiRegression(): void {
  const model = getDirectorDashboardUiModel();
  const markup = renderToStaticMarkup(createElement(DashboardFoundation, { widgetRuntime: model }));
  for (const title of [
    "Director Dashboard", "Executive Overview", "Executive Insights", "Runtime Overview",
    "Active Agents", "Active Workflows", "Monitoring Summary", "Health Summary",
    "Diagnostics Summary", "Evaluation Summary", "Authentication Summary", "Refresh",
  ]) assert.equal(markup.includes(title), true, `missing ${title}`);
  // The model contract handed to the UI is unchanged.
  for (const key of ["snapshot", "widgets", "overview", "insights"]) {
    assert.equal(key in model, true, `DirectorDashboardUiModel.${key} must remain`);
  }
  // Rendering without a model stays a no-op rather than throwing.
  assert.equal(renderToStaticMarkup(createElement(DashboardFoundation, {})), "");
}

/** The refresh path fans one snapshot out to every layer, in order. */
function refreshOrderingPreserved(): void {
  const board = readFileSync(BOARD, "utf8");
  const applyStart = board.indexOf("const applyRuntime");
  assert.equal(applyStart >= 0, true);
  const applyBody = board.slice(applyStart, board.indexOf("useEffect(", applyStart));
  const order = ["createExecutiveOverview", "setRuntime", "setOverview", "setInsights"]
    .map((token) => applyBody.indexOf(token));
  assert.equal(order.every((index) => index >= 0), true, "all layers must update together");
  assert.equal(order.slice(1).every((index, position) => index > order[position]!), true,
    "widgets, then overview, then insights");
  // Insights derive from the same overview object that was published.
  assert.equal(applyBody.includes("createExecutiveInsights(nextOverview)"), true);
  assert.equal(board.includes("requestAnimationFrame("), false, "raw rAF must be replaced by the scheduler");
  assert.equal(board.includes("scheduleFrame("), true);
  // Stale-result protection.
  assert.equal(board.includes("refreshToken"), true);
  assert.equal((board.match(/if \(refreshToken\.current !== token\) return;/g) ?? []).length, 2,
    "both scheduled paths must drop superseded results");
}

function main(): void {
  canonicalScopeIdentity();
  allConsumersUseCanonicalScope();
  scopeBehaviourUnchanged();
  legacyPathRemoved();
  noOrphansAndNothingLiveRemoved();
  noPublicApiRegression();
  refreshOrderingPreserved();
  console.log("dashboard scope and legacy removal checks passed");
}

main();
