import type { DashboardWidgetId, WidgetRuntimeState, WidgetViewModel } from "../director-dashboard-widget-runtime";
import type { ExecutiveHealthState, ExecutiveSectionId } from "./types";

/**
 * Authoritative severity ordering. Higher rank wins when folding several
 * section states into one organization health state, and when ordering
 * sections by priority. The ordering is intentionally explicit so the result
 * is transparent and reproducible.
 */
export const HEALTH_SEVERITY_RANK: Readonly<Record<ExecutiveHealthState, number>> = Object.freeze({
  healthy: 0,
  unknown: 1,
  warning: 2,
  unavailable: 3,
  critical: 4,
});

/** Which view-model field a section reads its canonical state tokens from. */
type TokenField = "status" | "value" | "none";

interface SectionRule {
  readonly sectionId: ExecutiveSectionId;
  readonly widgetId: DashboardWidgetId;
  readonly label: string;
  readonly tokenField: TokenField;
  /** Whether the widget-level displayStatus also contributes tokens. */
  readonly includeDisplayStatus: boolean;
  readonly criticalTokens: readonly string[];
  readonly warningTokens: readonly string[];
  readonly unknownTokens: readonly string[];
}

/**
 * Deterministic rule table. Every section maps a fixed set of canonical
 * tokens — produced by the widget runtime, never invented here — onto an
 * executive health state. Tokens that match nothing are healthy.
 */
export const SECTION_RULES: readonly SectionRule[] = Object.freeze([
  {
    sectionId: "platform-status", widgetId: "health-summary", label: "Platform Status",
    tokenField: "value", includeDisplayStatus: true,
    criticalTokens: ["critical"], warningTokens: ["degraded", "watch"], unknownTokens: ["unknown"],
  },
  {
    sectionId: "runtime-status", widgetId: "runtime-overview", label: "Runtime Status",
    tokenField: "status", includeDisplayStatus: true,
    criticalTokens: ["error"], warningTokens: ["stale", "uninitialized"], unknownTokens: [],
  },
  {
    sectionId: "active-agents", widgetId: "active-agents", label: "Active Agents",
    tokenField: "status", includeDisplayStatus: false,
    criticalTokens: ["critical"], warningTokens: ["watch", "degraded"], unknownTokens: ["unknown"],
  },
  {
    sectionId: "active-workflows", widgetId: "active-workflows", label: "Active Workflows",
    tokenField: "status", includeDisplayStatus: false,
    criticalTokens: ["critical"], warningTokens: ["watch", "degraded"], unknownTokens: ["unknown"],
  },
  {
    sectionId: "monitoring-summary", widgetId: "monitoring-summary", label: "Monitoring Summary",
    tokenField: "none", includeDisplayStatus: false,
    criticalTokens: [], warningTokens: [], unknownTokens: [],
  },
  {
    sectionId: "diagnostics-summary", widgetId: "diagnostics-summary", label: "Diagnostics Summary",
    tokenField: "value", includeDisplayStatus: false,
    criticalTokens: ["critical", "error"], warningTokens: ["warning"], unknownTokens: [],
  },
  {
    sectionId: "evaluation-summary", widgetId: "evaluation-summary", label: "Evaluation Summary",
    tokenField: "status", includeDisplayStatus: false,
    criticalTokens: [], warningTokens: ["failed", "inconclusive"], unknownTokens: [],
  },
  {
    sectionId: "authentication-summary", widgetId: "authentication-summary", label: "Authentication Summary",
    tokenField: "none", includeDisplayStatus: false,
    criticalTokens: [], warningTokens: [], unknownTokens: [],
  },
]);

function tokensOf(rule: SectionRule, viewModel: WidgetViewModel): readonly string[] {
  const tokens = rule.tokenField === "none"
    ? []
    : viewModel.items.map((item) => (rule.tokenField === "status" ? item.status ?? "" : item.value));
  return rule.includeDisplayStatus ? [...tokens, viewModel.displayStatus] : tokens;
}

/**
 * Health of a single section, derived only from canonical widget runtime
 * output. Never guesses: an unreadable widget is `unavailable`, a widget that
 * has not resolved yet is `unknown`, and an empty widget is `unknown` because
 * absence of records is not evidence of health.
 */
export function calculateSectionHealth(rule: SectionRule, state: WidgetRuntimeState): ExecutiveHealthState {
  if (state.state === "unavailable" || state.state === "failed") return "unavailable";
  if (state.state === "loading") return "unknown";
  if (state.state === "empty" || !state.viewModel) return "unknown";
  const tokens = tokensOf(rule, state.viewModel);
  if (tokens.some((token) => rule.criticalTokens.includes(token))) return "critical";
  if (tokens.some((token) => rule.warningTokens.includes(token))) return "warning";
  if (tokens.some((token) => rule.unknownTokens.includes(token))) return "unknown";
  return "healthy";
}

/** Folds section health states into one organization health state. */
export function foldOrganizationHealth(states: readonly ExecutiveHealthState[]): ExecutiveHealthState {
  if (states.length === 0) return "unknown";
  return states.reduce<ExecutiveHealthState>(
    (worst, state) => (HEALTH_SEVERITY_RANK[state] > HEALTH_SEVERITY_RANK[worst] ? state : worst),
    "healthy",
  );
}

export type { SectionRule };
