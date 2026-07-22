import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardFoundation } from "../../src/components/director-dashboard/dashboard-foundation";
import { RecordDetailPanel } from "../../src/components/director-dashboard/record-detail-view";
import { SectionDetailList } from "../../src/components/director-dashboard/section-detail-list";
import { getDirectorDashboardUiModel } from "../../src/features/director-dashboard-ui/adapter.server";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import {
  createRecordDetailView,
  createSectionListView,
  UNAVAILABLE_FIELD,
} from "../../src/features/director-dashboard-navigation";
import { healthyRuntime, readyState } from "../helpers/director-dashboard-executive-overview";

const FEATURE_DIR = "src/features/director-dashboard-navigation";
const BOARD = "src/components/director-dashboard/widget-runtime-board.tsx";
const DETAIL = "src/components/director-dashboard/record-detail-view.tsx";
const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

const runtime = healthyRuntime({
  "active-agents": readyState("active-agents", [
    { id: "agent-1", label: "Alpha Agent", value: "org-a", status: "healthy" },
    { id: "agent-2", label: "Bravo Agent", value: "org-b", status: "critical" },
  ]),
});
const overview = createExecutiveOverview({ runtime, evaluatedAt });
const detail = createRecordDetailView({ overview, runtime, sectionId: "active-agents", recordId: "agent-1" })!;

function renderDetail(): string {
  return renderToStaticMarkup(createElement(RecordDetailPanel, {
    detail, onBackToList: () => {}, onBackToDashboard: () => {},
  }));
}

/** The panel renders identity, category, status, and provenance. */
function rendersEveryField(): void {
  const markup = renderDetail();
  for (const expected of [
    "Alpha Agent", "Record Detail", "Active Agents", "agent-1", "org-a", "healthy",
    "Agent ID", "Organization", "Health state", "Source snapshot", "Snapshot timestamp", "Evaluated at",
    "Record ID", "Category", "Description",
  ]) assert.equal(markup.includes(expected), true, `missing ${expected}`);
  assert.equal(markup.includes("Snapshot fresh"), true);
  assert.equal(markup.includes("evidence"), true);
}

/** Missing fields render "Unavailable" rather than a fabricated value. */
function rendersUnavailableFields(): void {
  const markup = renderDetail();
  assert.equal(markup.includes(UNAVAILABLE_FIELD), true, "description must render as Unavailable");
  assert.equal(detail.descriptionAvailable, false);
}

/** Both back affordances are present; no action controls are. */
function rendersBackNavigationOnly(): void {
  const markup = renderDetail();
  assert.equal(markup.includes("Back to Active Agents"), true);
  assert.equal(markup.includes("Back to dashboard"), true);
  for (const forbidden of ["Delete", "Approve", "Retry", "Execute", "Edit", "Save", "onSubmit", "<form", "<input"]) {
    assert.equal(markup.includes(forbidden), false, `detail must not offer ${forbidden}`);
  }
  const source = readFileSync(DETAIL, "utf8");
  for (const forbidden of ["fetch(", "useEffect", "setInterval", "XMLHttpRequest"]) {
    assert.equal(source.includes(forbidden), false, `detail must not ${forbidden}`);
  }
}

/** No sensitive value can reach a rendered detail. */
function rendersNoSensitiveDetail(): void {
  const markup = renderDetail();
  for (const forbidden of [
    "accessToken", "refreshToken", "apiKey", "password", "Bearer ", "postgresql://",
    "hiddenReasoning", "providerPayload", "memoryContent", "tenantId", "Error:", "at Object.",
  ]) assert.equal(markup.includes(forbidden), false, `markup must not expose ${forbidden}`);
}

/** List rows become record buttons only when drill-down is wired. */
function listRowsOpenRecords(): void {
  const list = createSectionListView({ overview, runtime, sectionId: "active-agents" })!;
  const withDrill = renderToStaticMarkup(createElement(SectionDetailList, {
    view: list, query: {}, onQueryChange: () => {}, onClose: () => {}, onOpenRecord: () => {},
  }));
  assert.equal(withDrill.includes("Open record Alpha Agent"), true);
  assert.equal(withDrill.includes("Open record Bravo Agent"), true);

  const withoutDrill = renderToStaticMarkup(createElement(SectionDetailList, {
    view: list, query: {}, onQueryChange: () => {}, onClose: () => {},
  }));
  assert.equal(withoutDrill.includes("Open record"), false, "records stay static without the callback");
  assert.equal(withoutDrill.includes("Alpha Agent"), true);
}

/** The record detail layer imports no runtime, storage, or memory module. */
function readsOnlyDashboardReadModels(): void {
  const forbidden = [
    "../runtime-projection", "../runtime-observability", "../organization-runtime",
    "../agent-runtime", "../workflow-runtime", "../memory", "../memory-engine", "../memory-crud",
    "../monitoring", "../diagnostics-read-models", "../evaluation", "../auth", "../observability",
    "../persistence", "@/db", "drizzle-orm", "pg", "postgres", "node:fs",
  ];
  for (const name of readdirSync(FEATURE_DIR).filter((file) => file.endsWith(".ts"))) {
    const source = readFileSync(join(FEATURE_DIR, name), "utf8");
    for (const specifier of forbidden) {
      assert.equal(source.includes(`"${specifier}`), false, `${name} must not import ${specifier}`);
    }
  }
  const detailSource = readFileSync(join(FEATURE_DIR, "record-detail.ts"), "utf8");
  // The detail is derived from the section list, never from a fresh query.
  assert.equal(detailSource.includes("createSectionListView"), true);
}

/** The board derives the detail rather than storing it. */
function boardDerivesDetailFromCurrentSnapshot(): void {
  const board = readFileSync(BOARD, "utf8");
  assert.equal(board.includes("const [openRecordId, setOpenRecordId]"), true, "only the record id is stored");
  assert.equal(board.includes("useState<RecordDetailView"), false, "the detail must not be stored in state");
  assert.equal(board.includes("createRecordDetailView({ overview, runtime, sectionId: openSectionId, recordId: openRecordId })"), true);
  // Back to list keeps the section open; back to dashboard clears both.
  assert.equal(board.includes("onBackToList={() => setOpenRecordId(undefined)}"), true);
  assert.equal(board.includes("onBackToDashboard={backToDashboard}"), true);
  // Opening a section resets any open record.
  const openSectionBody = board.slice(board.indexOf("const openSection ="), board.indexOf("const backToDashboard"));
  assert.equal(openSectionBody.includes("setOpenRecordId(undefined)"), true,
    "opening a section must clear any open record");
}

/** No public contract regression; the route still renders. */
function noPublicContractRegression(): void {
  const model = getDirectorDashboardUiModel();
  for (const key of ["snapshot", "widgets", "overview", "insights"]) {
    assert.equal(key in model, true, `DirectorDashboardUiModel.${key} must remain`);
  }
  const markup = renderToStaticMarkup(createElement(DashboardFoundation, { widgetRuntime: model }));
  for (const title of [
    "Director Dashboard", "Executive Overview", "Executive Insights", "Runtime Overview", "Refresh",
  ]) assert.equal(markup.includes(title), true, `missing ${title}`);
  // Nothing is drilled into on first render.
  assert.equal(markup.includes("Record Detail"), false);
  assert.equal(markup.includes("Back to overview"), false);
  const dataTypes = readFileSync("src/features/director-dashboard-data/types.ts", "utf8");
  assert.equal(dataTypes.includes("readonly authoritative: false;"), true);
}

function main(): void {
  rendersEveryField();
  rendersUnavailableFields();
  rendersBackNavigationOnly();
  rendersNoSensitiveDetail();
  listRowsOpenRecords();
  readsOnlyDashboardReadModels();
  boardDerivesDetailFromCurrentSnapshot();
  noPublicContractRegression();
  console.log("dashboard record detail ui checks passed");
}

main();
