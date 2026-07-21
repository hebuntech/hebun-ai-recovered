import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import {
  createExecutiveInsights,
  NARRATIVE_RULES,
} from "../../src/features/director-dashboard-executive-insights";
import { healthyRuntime, readyState, uniformRuntime } from "../helpers/director-dashboard-executive-overview";

const FEATURE_DIR = "src/features/director-dashboard-executive-insights";
const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");

/**
 * Insights derive from the Executive Overview. They must never reach past it
 * into the widget runtime's data, the dashboard data layer, runtime authority,
 * memory, observability, or the control plane.
 */
function readsOnlyThroughTheExecutiveOverview(): void {
  const forbidden = [
    "../runtime-projection", "../monitoring", "../diagnostics-read-models", "../evaluation",
    "../auth", "../observability", "../organization-runtime", "../workflow-runtime",
    "../agent-runtime", "../runtime-boundary", "../director-dashboard-data", "../memory",
    "../memory-engine", "@/db", "drizzle-orm", "node:fs", "pg",
  ];
  const files = readdirSync(FEATURE_DIR).filter((name) => name.endsWith(".ts"));
  assert.equal(files.length > 0, true);
  for (const name of files) {
    const source = readFileSync(join(FEATURE_DIR, name), "utf8");
    for (const specifier of forbidden) {
      assert.equal(source.includes(`"${specifier}"`), false, `${name} must not import ${specifier}`);
    }
  }
  // The widget runtime may only be referenced for its canonical widget id type.
  const types = readFileSync(join(FEATURE_DIR, "types.ts"), "utf8");
  assert.equal(types.includes("import type"), true);
  for (const name of ["generation.ts", "priority.ts", "rules.ts"]) {
    assert.equal(
      readFileSync(join(FEATURE_DIR, name), "utf8").includes("../director-dashboard-widget-runtime"),
      false,
      `${name} must derive from the overview, not the widget runtime`,
    );
  }
}

/** Only sanitized summaries may leave this layer. */
function exposesNoSensitiveDetail(): void {
  const overview = createExecutiveOverview({
    runtime: healthyRuntime({
      "authentication-summary": readyState("authentication-summary", [
        { id: "session-secret-1", label: "user-1@example.com", value: "aal2", status: "mfa" },
      ]),
      "active-agents": readyState("active-agents", [
        { id: "agent-secret-1", label: "Agent With Secret", value: "org-secret-1", status: "critical" },
      ]),
    }),
    evaluatedAt,
  });
  const serialized = JSON.stringify(createExecutiveInsights(overview));
  for (const forbidden of [
    "session-secret-1", "user-1@example.com", "agent-secret-1", "org-secret-1", "Agent With Secret",
    "accessToken", "refreshToken", "hiddenReasoning", "providerPayload", "memoryContent",
    "tenantId", "userId", "stack", "Error:",
  ]) {
    assert.equal(serialized.includes(forbidden), false, `insights must not expose ${forbidden}`);
  }
}

/** Raw runtime failure text must never reach an insight summary. */
function neverEchoesRuntimeFailureText(): void {
  const overview = createExecutiveOverview({
    runtime: uniformRuntime("failed", "TypeError: secret internal detail at line 42"),
    evaluatedAt,
  });
  const serialized = JSON.stringify(createExecutiveInsights(overview));
  assert.equal(serialized.includes("TypeError"), false);
  assert.equal(serialized.includes("line 42"), false);
  assert.equal(serialized.includes("secret internal detail"), false);
}

/** Every summary must come from the fixed template table, not runtime input. */
function buildsNarrativeOnlyFromTemplates(): void {
  const overview = createExecutiveOverview({ runtime: healthyRuntime(), evaluatedAt });
  for (const insight of createExecutiveInsights(overview)) {
    const rule = NARRATIVE_RULES[insight.reasonCode];
    assert.equal(insight.summary, rule.summary(insight.title, insight.evidenceCount));
    assert.equal(insight.recommendedAction, rule.recommendedAction(insight.title));
  }
}

readsOnlyThroughTheExecutiveOverview();
exposesNoSensitiveDetail();
neverEchoesRuntimeFailureText();
buildsNarrativeOnlyFromTemplates();
console.log("executive insight isolation and security checks passed");
