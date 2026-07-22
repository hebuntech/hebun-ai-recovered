import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardFoundation } from "../../src/components/director-dashboard/dashboard-foundation";
import { ExecutiveOverviewSection } from "../../src/components/director-dashboard/executive-overview-section";
import { SectionDetailList } from "../../src/components/director-dashboard/section-detail-list";
import { getDirectorDashboardUiModel } from "../../src/features/director-dashboard-ui/adapter.server";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import {
  createSectionListView,
  NAVIGABLE_SECTION_IDS,
} from "../../src/features/director-dashboard-navigation";
import { healthyRuntime, readyState } from "../helpers/director-dashboard-executive-overview";

const FEATURE_DIR = "src/features/director-dashboard-navigation";
const BOARD = "src/components/director-dashboard/widget-runtime-board.tsx";
const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

/** Navigation reads only dashboard read models — never runtime or storage. */
function readsOnlyDashboardReadModels(): void {
  const forbidden = [
    "../runtime-projection", "../runtime-observability", "../organization-runtime",
    "../agent-runtime", "../workflow-runtime", "../memory", "../memory-engine", "../memory-crud",
    "../monitoring", "../diagnostics-read-models", "../evaluation", "../auth", "../observability",
    "../persistence", "@/db", "drizzle-orm", "pg", "postgres", "node:fs",
  ];
  const files = readdirSync(FEATURE_DIR).filter((name) => name.endsWith(".ts"));
  assert.equal(files.length > 0, true);
  for (const name of files) {
    const source = readFileSync(join(FEATURE_DIR, name), "utf8");
    for (const specifier of forbidden) {
      assert.equal(source.includes(`"${specifier}`), false, `${name} must not import ${specifier}`);
    }
  }
}

/** The layer is read-only: it exposes no mutation surface. */
function exposesNoMutation(): void {
  const source = readdirSync(FEATURE_DIR)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => readFileSync(join(FEATURE_DIR, name), "utf8"))
    .join("\n");
  for (const forbidden of [
    "export function create" + "Agent", "export function update", "export function delete",
    "export function execute", "export function approve", "export function retry",
    "fetch(", "XMLHttpRequest", "localStorage", "sessionStorage",
  ]) {
    assert.equal(source.includes(forbidden), false, `navigation must not expose ${forbidden}`);
  }
  // The detail list renders no action controls.
  const list = readFileSync("src/components/director-dashboard/section-detail-list.tsx", "utf8");
  for (const forbidden of ["Delete", "Approve", "Retry", "Execute", "Edit", "onSubmit", "<form"]) {
    assert.equal(list.includes(forbidden), false, `detail list must not offer ${forbidden}`);
  }
}

/** No sensitive value can reach a rendered list. */
function rendersNoSensitiveDetail(): void {
  const runtime = healthyRuntime({
    "active-agents": readyState("active-agents", [
      { id: "agent-1", label: "Agent", value: "org-1", status: "healthy" },
    ]),
  });
  const view = createSectionListView({
    overview: createExecutiveOverview({ runtime, evaluatedAt }),
    runtime,
    sectionId: "active-agents",
  })!;
  const markup = renderToStaticMarkup(createElement(SectionDetailList, {
    view, query: {}, onQueryChange: () => {}, onClose: () => {},
  }));
  for (const forbidden of [
    "accessToken", "refreshToken", "apiKey", "password", "Bearer ", "postgresql://",
    "hiddenReasoning", "providerPayload", "memoryContent", "tenantId", "Error:", "at Object.",
  ]) assert.equal(markup.includes(forbidden), false, `markup must not expose ${forbidden}`);
}

/** A list renders its records with snapshot provenance and query controls. */
function rendersRecordsAndControls(): void {
  const runtime = healthyRuntime({
    "active-agents": readyState("active-agents", [
      { id: "a-1", label: "Alpha Agent", value: "org-a", status: "healthy" },
      { id: "a-2", label: "Bravo Agent", value: "org-b", status: "critical" },
    ]),
  });
  const view = createSectionListView({
    overview: createExecutiveOverview({ runtime, evaluatedAt }),
    runtime,
    sectionId: "active-agents",
  })!;
  const markup = renderToStaticMarkup(createElement(SectionDetailList, {
    view, query: {}, onQueryChange: () => {}, onClose: () => {},
  }));
  assert.equal(markup.includes("Alpha Agent"), true);
  assert.equal(markup.includes("Bravo Agent"), true);
  assert.equal(markup.includes("Back to overview"), true);
  assert.equal(markup.includes("2 records in the current snapshot"), true);
  assert.equal(markup.includes("Search records"), true);
  assert.equal(markup.includes("All statuses"), true);
  assert.equal(markup.includes("Snapshot fresh"), true);
}

/** Empty and unavailable lists render their canonical states, not records. */
function rendersEmptyAndUnavailable(): void {
  const runtime = healthyRuntime();
  const overview = createExecutiveOverview({ runtime, evaluatedAt });
  const unsupported = createSectionListView({ overview, runtime, sectionId: "evaluation-summary" })!;
  const markup = renderToStaticMarkup(createElement(SectionDetailList, {
    view: unsupported, query: {}, onQueryChange: () => {}, onClose: () => {},
  }));
  assert.equal(markup.includes("No records to explore"), true);
  assert.equal(markup.includes("Search records"), false, "no controls without records");
}

/** Only navigable sections become buttons; the rest stay static rows. */
function overviewOffersNavigationForSupportedSections(): void {
  const runtime = healthyRuntime();
  const overview = createExecutiveOverview({ runtime, evaluatedAt });
  const withNav = renderToStaticMarkup(createElement(ExecutiveOverviewSection, {
    overview, navigableSectionIds: NAVIGABLE_SECTION_IDS, onOpenSection: () => {},
  }));
  for (const label of ["Active Agents", "Active Workflows", "Monitoring Summary", "Diagnostics Summary", "Runtime Status", "Platform Status"]) {
    assert.equal(withNav.includes(`Open ${label} records`), true, `${label} must be openable`);
  }
  for (const label of ["Evaluation Summary", "Authentication Summary"]) {
    assert.equal(withNav.includes(`Open ${label} records`), false, `${label} must not be openable`);
  }
  assert.equal((withNav.match(/<button/g) ?? []).length, 6);

  // Without navigation props the section renders exactly as before.
  const staticMarkup = renderToStaticMarkup(createElement(ExecutiveOverviewSection, { overview }));
  assert.equal(staticMarkup.includes("<button"), false);
  for (const label of ["Active Agents", "Platform Status", "Evaluation Summary"]) {
    assert.equal(staticMarkup.includes(label), true);
  }
}

/** The board derives the list rather than storing it, so refresh replaces it. */
function boardDerivesListFromCurrentSnapshot(): void {
  const board = readFileSync(BOARD, "utf8");
  assert.equal(board.includes("const [openSectionId, setOpenSectionId]"), true, "only the section id is stored");
  assert.equal(board.includes("useState<SectionListView"), false, "the list must not be stored in state");
  assert.equal(board.includes("createSectionListView({ overview, runtime, sectionId: openSectionId"), true);
}

/** The dashboard route still renders with no public contract regression. */
function noPublicContractRegression(): void {
  const model = getDirectorDashboardUiModel();
  for (const key of ["snapshot", "widgets", "overview", "insights"]) {
    assert.equal(key in model, true, `DirectorDashboardUiModel.${key} must remain`);
  }
  const markup = renderToStaticMarkup(createElement(DashboardFoundation, { widgetRuntime: model }));
  for (const title of [
    "Director Dashboard", "Executive Overview", "Executive Insights", "Runtime Overview",
    "Active Agents", "Monitoring Summary", "Diagnostics Summary", "Refresh",
  ]) assert.equal(markup.includes(title), true, `missing ${title}`);
  // No drill-down is open on first render.
  assert.equal(markup.includes("Back to overview"), false);
  // Dashboard contracts were not modified by this phase.
  const dataTypes = readFileSync("src/features/director-dashboard-data/types.ts", "utf8");
  assert.equal(dataTypes.includes("readonly authoritative: false;"), true);
}

function main(): void {
  readsOnlyDashboardReadModels();
  exposesNoMutation();
  rendersNoSensitiveDetail();
  rendersRecordsAndControls();
  rendersEmptyAndUnavailable();
  overviewOffersNavigationForSupportedSections();
  boardDerivesListFromCurrentSnapshot();
  noPublicContractRegression();
  console.log("dashboard navigation boundary and ui checks passed");
}

main();
