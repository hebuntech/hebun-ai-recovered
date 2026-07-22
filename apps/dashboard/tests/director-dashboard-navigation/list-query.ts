import assert from "node:assert/strict";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import { createSectionListView } from "../../src/features/director-dashboard-navigation";
import { healthyRuntime, readyState } from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

const runtime = healthyRuntime({
  "active-agents": readyState("active-agents", [
    { id: "a-3", label: "Charlie", value: "org-b", status: "critical" },
    { id: "a-1", label: "alpha", value: "org-a", status: "healthy" },
    { id: "a-2", label: "Bravo", value: "org-c", status: "watch" },
    { id: "a-4", label: "Delta", value: "org-a", status: "healthy" },
  ]),
});
const overview = createExecutiveOverview({ runtime, evaluatedAt });
const view = (query?: Parameters<typeof createSectionListView>[0]["query"]) =>
  createSectionListView({ overview, runtime, sectionId: "active-agents", query })!;

/** Default ordering is by label, ascending, and is case-insensitive. */
function defaultSort(): void {
  const rows = view().rows;
  assert.deepEqual(rows.map(({ label }) => label), ["alpha", "Bravo", "Charlie", "Delta"]);
  assert.equal(view().query.sortField, "label");
  assert.equal(view().query.sortDirection, "asc");
}

/** Every sort field works in both directions. */
function sortingAcrossFields(): void {
  assert.deepEqual(
    view({ sortField: "label", sortDirection: "desc" }).rows.map(({ label }) => label),
    ["Delta", "Charlie", "Bravo", "alpha"],
  );
  assert.deepEqual(
    view({ sortField: "value", sortDirection: "asc" }).rows.map(({ value }) => value),
    ["org-a", "org-a", "org-b", "org-c"],
  );
  assert.deepEqual(
    view({ sortField: "status", sortDirection: "asc" }).rows.map(({ status }) => status),
    ["critical", "healthy", "healthy", "watch"],
  );
}

/**
 * Equal keys break on record id, so ordering is always deterministic.
 *
 * The fixture deliberately lists the tied records in reverse id order: a sort
 * that merely relied on the engine's stability would preserve source order and
 * produce a different result.
 */
function deterministicTieBreak(): void {
  const tied = healthyRuntime({
    "active-agents": readyState("active-agents", [
      { id: "z-9", label: "Same", value: "org-a", status: "healthy" },
      { id: "m-5", label: "Same", value: "org-a", status: "healthy" },
      { id: "a-1", label: "Same", value: "org-a", status: "healthy" },
    ]),
  });
  const tiedView = (direction: "asc" | "desc") => createSectionListView({
    overview: createExecutiveOverview({ runtime: tied, evaluatedAt }),
    runtime: tied,
    sectionId: "active-agents",
    query: { sortField: "value", sortDirection: direction },
  })!;
  assert.deepEqual(tiedView("asc").rows.map(({ id }) => id), ["a-1", "m-5", "z-9"], "ties resolve by id");
  assert.deepEqual(tiedView("desc").rows.map(({ id }) => id), ["a-1", "m-5", "z-9"],
    "the tie-break stays ascending by id in both directions");
  assert.deepEqual(tiedView("asc").rows, tiedView("asc").rows, "repeat queries are identical");

  const ascending = view({ sortField: "value", sortDirection: "asc" }).rows;
  assert.deepEqual(ascending.slice(0, 2).map(({ id }) => id), ["a-1", "a-4"]);
  assert.deepEqual(view({ sortField: "value" }).rows, ascending);
}

/** Search matches label, value, and status, case-insensitively. */
function searching(): void {
  assert.deepEqual(view({ search: "brav" }).rows.map(({ id }) => id), ["a-2"]);
  assert.deepEqual(view({ search: "ORG-A" }).rows.map(({ id }) => id), ["a-1", "a-4"]);
  assert.deepEqual(view({ search: "critical" }).rows.map(({ id }) => id), ["a-3"]);
  assert.equal(view({ search: "   " }).rows.length, 4, "blank search must not filter");
  assert.equal(view({ search: "nothing-matches" }).rows.length, 0);
  // Filtering never changes the honest totals.
  assert.equal(view({ search: "brav" }).totalCount, 4);
  assert.equal(view({ search: "brav" }).evidenceCount, 4);
}

/** Status filtering uses the facets derived from the unfiltered records. */
function statusFiltering(): void {
  assert.deepEqual(view().statusFacets, ["critical", "healthy", "watch"]);
  assert.deepEqual(view({ status: "healthy" }).rows.map(({ id }) => id), ["a-1", "a-4"]);
  assert.equal(view({ status: "" }).rows.length, 4, "empty status means all statuses");
  assert.equal(view({ status: "not-a-status" }).rows.length, 0);
  // Facets stay complete even while filtered, so the filter can be changed back.
  assert.deepEqual(view({ status: "healthy" }).statusFacets, ["critical", "healthy", "watch"]);
}

/** Search and status filters compose. */
function combinedQuery(): void {
  const combined = view({ status: "healthy", search: "org-a", sortField: "label", sortDirection: "desc" });
  assert.deepEqual(combined.rows.map(({ id }) => id), ["a-4", "a-1"]);
  assert.equal(combined.totalCount, 4);
  assert.equal(combined.rows.length, 2);
}

/** The applied query is echoed back so the UI can render its own state. */
function queryIsEchoed(): void {
  const applied = view({ search: "org", status: "healthy", sortField: "status", sortDirection: "desc" });
  assert.equal(applied.query.search, "org");
  assert.equal(applied.query.status, "healthy");
  assert.equal(applied.query.sortField, "status");
  assert.equal(applied.query.sortDirection, "desc");
}

/** Records missing a status are labelled, never dropped or invented. */
function missingStatusIsExplicit(): void {
  const withoutStatus = healthyRuntime({
    "monitoring-summary": readyState("monitoring-summary", [{ id: "m-1", label: "monitor", value: "1" }]),
  });
  const list = createSectionListView({
    overview: createExecutiveOverview({ runtime: withoutStatus, evaluatedAt }),
    runtime: withoutStatus,
    sectionId: "monitoring-summary",
  })!;
  assert.equal(list.rows.length, 1);
  assert.equal(list.rows[0]?.status, "unknown");
  assert.deepEqual(list.statusFacets, ["unknown"]);
}

function main(): void {
  defaultSort();
  sortingAcrossFields();
  deterministicTieBreak();
  searching();
  statusFiltering();
  combinedQuery();
  queryIsEchoed();
  missingStatusIsExplicit();
  console.log("dashboard navigation list query checks passed");
}

main();
