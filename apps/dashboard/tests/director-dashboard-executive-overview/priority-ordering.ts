import assert from "node:assert/strict";
import {
  createExecutiveOverview,
  EXECUTIVE_SECTION_IDS,
  HEALTH_SEVERITY_RANK,
  orderByPriority,
  type ExecutiveSection,
} from "../../src/features/director-dashboard-executive-overview";
import { healthyRuntime, readyState, uniformRuntime } from "../helpers/director-dashboard-executive-overview";

const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

function section(sectionId: ExecutiveSection["sectionId"], health: ExecutiveSection["health"]): ExecutiveSection {
  return { sectionId, widgetId: "runtime-overview", label: sectionId, health, sourceState: "ready", recordCount: 0, reasonCode: "SECTION_HEALTHY" };
}

function ordersBySeverityFirst(): void {
  const ordered = orderByPriority([
    section("authentication-summary", "healthy"),
    section("monitoring-summary", "unknown"),
    section("runtime-status", "critical"),
    section("active-agents", "warning"),
    section("active-workflows", "unavailable"),
  ]);
  assert.deepEqual(ordered.map((entry) => entry.health), ["critical", "unavailable", "warning", "unknown", "healthy"]);
}

function tieBreaksOnCanonicalOrder(): void {
  const allCritical = EXECUTIVE_SECTION_IDS.map((sectionId) => section(sectionId, "critical"));
  const shuffled = [...allCritical].reverse();
  assert.deepEqual(
    orderByPriority(shuffled).map((entry) => entry.sectionId),
    [...EXECUTIVE_SECTION_IDS],
  );
  // Input order must not influence the result.
  assert.deepEqual(orderByPriority(shuffled), orderByPriority(allCritical));
}

function doesNotMutateInput(): void {
  const input = [section("active-agents", "healthy"), section("runtime-status", "critical")];
  const before = [...input];
  orderByPriority(input);
  assert.deepEqual(input, before);
}

function overviewSurfacesHighestPriorityFirst(): void {
  const overview = createExecutiveOverview({
    runtime: healthyRuntime({
      "diagnostics-summary": readyState("diagnostics-summary", [{ id: "d", label: "d", value: "critical", status: "FULL" }]),
      "active-agents": readyState("active-agents", [{ id: "a", label: "a", value: "org", status: "watch" }]),
      "evaluation-summary": { widgetId: "evaluation-summary", state: "unavailable", reason: "INVALID_SCOPE" },
    }),
    evaluatedAt,
  });
  assert.equal(overview.sections[0]?.sectionId, "diagnostics-summary");
  assert.equal(overview.sections[0]?.health, "critical");
  assert.equal(overview.sections[1]?.health, "unavailable");
  assert.equal(overview.sections[2]?.health, "warning");
  for (let index = 1; index < overview.sections.length; index += 1) {
    const previous = HEALTH_SEVERITY_RANK[overview.sections[index - 1]!.health];
    assert.equal(previous >= HEALTH_SEVERITY_RANK[overview.sections[index]!.health], true);
  }
}

function uniformSeverityKeepsCanonicalOrder(): void {
  const overview = createExecutiveOverview({ runtime: uniformRuntime("unavailable"), evaluatedAt });
  assert.deepEqual(overview.sections.map((entry) => entry.sectionId), [...EXECUTIVE_SECTION_IDS]);
}

ordersBySeverityFirst();
tieBreaksOnCanonicalOrder();
doesNotMutateInput();
overviewSurfacesHighestPriorityFirst();
uniformSeverityKeepsCanonicalOrder();
console.log("executive overview priority ordering checks passed");
