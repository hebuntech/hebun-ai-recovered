import {
  DASHBOARD_WIDGET_IDS,
  type DashboardWidgetDefinition,
} from "./types";
import { deepFreeze, validVersion } from "./validation";

export type WidgetResolution =
  | { readonly status: "resolved"; readonly widget: DashboardWidgetDefinition }
  | { readonly status: "unknown_widget"; readonly widgetId: string; readonly version: string };

const sectionBindings: Readonly<Record<DashboardWidgetDefinition["widgetId"], {
  readonly sectionId: DashboardWidgetDefinition["sectionId"];
  readonly readModel: DashboardWidgetDefinition["readModel"];
}>> = Object.freeze({
  "runtime-overview": { sectionId: "runtime-overview", readModel: "runtimeOverview" },
  "active-agents": { sectionId: "agent-overview", readModel: "agentOverview" },
  "active-workflows": { sectionId: "workflow-overview", readModel: "workflowOverview" },
  "monitoring-summary": { sectionId: "monitoring-summary", readModel: "monitoringSummary" },
  "health-summary": { sectionId: "health-summary", readModel: "healthSummary" },
  "diagnostics-summary": { sectionId: "diagnostics-summary", readModel: "diagnosticsSummary" },
  "evaluation-summary": { sectionId: "evaluation-summary", readModel: "evaluationSummary" },
  "authentication-summary": { sectionId: "authentication-summary", readModel: "authenticationSummary" },
});

function validate(input: DashboardWidgetDefinition): DashboardWidgetDefinition {
  const expected = sectionBindings[input.widgetId];
  if (!(DASHBOARD_WIDGET_IDS as readonly string[]).includes(input.widgetId) || !validVersion(input.version) ||
      !expected || input.sectionId !== expected.sectionId || input.readModel !== expected.readModel ||
      !["manual", "snapshot-switch"].includes(input.refreshStrategy) || !["eager", "deferred"].includes(input.loadingStrategy)) {
    throw new TypeError("Invalid dashboard widget definition.");
  }
  return deepFreeze({ ...input });
}

export class WidgetRegistry {
  readonly #entries: ReadonlyMap<string, DashboardWidgetDefinition>;

  constructor(entries: readonly DashboardWidgetDefinition[]) {
    const mapped = new Map<string, DashboardWidgetDefinition>();
    for (const input of entries) {
      const widget = validate(input);
      const key = WidgetRegistry.key(widget.widgetId, widget.version);
      if (mapped.has(key)) throw new TypeError("Duplicate dashboard widget definition.");
      mapped.set(key, widget);
    }
    this.#entries = mapped;
    Object.freeze(this);
  }

  resolve(widgetId: string, version: string): WidgetResolution {
    const widget = this.#entries.get(WidgetRegistry.key(widgetId, version));
    return widget
      ? Object.freeze({ status: "resolved", widget })
      : Object.freeze({ status: "unknown_widget", widgetId, version });
  }

  list(): readonly DashboardWidgetDefinition[] {
    return Object.freeze([...this.#entries.values()]);
  }

  private static key(widgetId: string, version: string): string {
    return `${widgetId}@${version}`;
  }
}

export function createDefaultWidgetRegistry(version = "1.0.0"): WidgetRegistry {
  return new WidgetRegistry(DASHBOARD_WIDGET_IDS.map((widgetId) => ({
    widgetId,
    version,
    ...sectionBindings[widgetId],
    refreshStrategy: "manual" as const,
    loadingStrategy: "eager" as const,
  })));
}
