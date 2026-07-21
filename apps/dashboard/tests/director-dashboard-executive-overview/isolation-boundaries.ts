import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import { healthyRuntime, readyState, uniformRuntime } from "../helpers/director-dashboard-executive-overview";

const FEATURE_DIR = "src/features/director-dashboard-executive-overview";
const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

/**
 * The Executive Overview aggregates the widget runtime only. It must never
 * reach past that layer into runtime authority, observability, persistence,
 * or the control plane.
 */
function readsOnlyThroughWidgetRuntime(): void {
  const forbidden = [
    "../runtime-projection", "../monitoring", "../diagnostics-read-models", "../evaluation",
    "../auth", "../observability", "../organization-runtime", "../workflow-runtime",
    "../agent-runtime", "../runtime-boundary", "../director-dashboard-data",
    "@/db", "drizzle-orm", "node:fs", "pg",
  ];
  const files = readdirSync(FEATURE_DIR).filter((name) => name.endsWith(".ts"));
  assert.equal(files.length > 0, true);
  for (const name of files) {
    const source = readFileSync(join(FEATURE_DIR, name), "utf8");
    for (const specifier of forbidden) {
      assert.equal(source.includes(`"${specifier}"`), false, `${name} must not import ${specifier}`);
    }
    assert.equal(
      source.includes("../director-dashboard-widget-runtime") || !source.includes("from \"../"),
      true,
      `${name} may only reach outward through the widget runtime`,
    );
  }
}

/** The overview carries states and counts — never identifiers or payloads. */
function exposesNoSensitiveDetail(): void {
  const overview = createExecutiveOverview({
    runtime: healthyRuntime({
      "authentication-summary": readyState("authentication-summary", [
        { id: "session-secret-1", label: "user-1@example.com", value: "aal2", status: "mfa" },
      ]),
      "active-agents": readyState("active-agents", [
        { id: "agent-secret-1", label: "Agent With Secret", value: "org-secret-1", status: "healthy" },
      ]),
    }),
    evaluatedAt,
  });
  const serialized = JSON.stringify(overview);
  for (const forbidden of [
    "session-secret-1", "user-1@example.com", "agent-secret-1", "org-secret-1", "Agent With Secret",
    "accessToken", "refreshToken", "hiddenReasoning", "providerPayload", "memoryContent",
    "tenantId", "userId", "stack", "Error:",
  ]) {
    assert.equal(serialized.includes(forbidden), false, `overview must not expose ${forbidden}`);
  }
}

/** Failure reasons are stable codes, never raw runtime detail. */
function reportsOnlyStableReasonCodes(): void {
  const overview = createExecutiveOverview({
    runtime: uniformRuntime("failed", "TypeError: secret internal detail at line 42"),
    evaluatedAt,
  });
  const serialized = JSON.stringify(overview);
  assert.equal(serialized.includes("TypeError"), false);
  assert.equal(serialized.includes("line 42"), false);
  for (const section of overview.sections) assert.equal(section.reasonCode, "SECTION_UNAVAILABLE");
}

readsOnlyThroughWidgetRuntime();
exposesNoSensitiveDetail();
reportsOnlyStableReasonCodes();
console.log("executive overview isolation and security checks passed");
