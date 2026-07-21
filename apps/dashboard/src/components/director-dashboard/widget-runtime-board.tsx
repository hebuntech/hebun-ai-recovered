"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import { ExecutiveOverviewSection } from "@/components/director-dashboard/executive-overview-section";
import { ExecutiveInsightsSection } from "@/components/director-dashboard/executive-insights-section";
import {
  createExecutiveInsights,
  type ExecutiveInsight,
} from "@/features/director-dashboard-executive-insights";
import {
  createExecutiveOverview,
  type ExecutiveOverview,
} from "@/features/director-dashboard-executive-overview";
import {
  createDefaultWidgetRegistry,
  WidgetRefreshEngine,
  type DashboardWidgetId,
  type WidgetRuntimeSnapshot,
  type WidgetRuntimeState,
} from "@/features/director-dashboard-widget-runtime";
import type { DashboardSnapshot } from "@/features/director-dashboard-data";

const dashboardScope = Object.freeze({ kind: "platform" as const, authority: "hebun-dashboard", resolvedBy: "server" as const });
const widgetOrder: readonly DashboardWidgetId[] = [
  "runtime-overview", "active-agents", "active-workflows", "monitoring-summary",
  "health-summary", "diagnostics-summary", "evaluation-summary", "authentication-summary",
];

function stateCopy(state: WidgetRuntimeState): { readonly title: string; readonly description: string } {
  if (state.state === "loading") return { title: "Loading dashboard data", description: "Preparing the latest immutable dashboard snapshot." };
  if (state.state === "empty") return { title: "No data is currently available", description: "This widget has no records in the current dashboard snapshot." };
  if (state.state === "unavailable") return { title: "Data source unavailable", description: "The current dashboard snapshot cannot provide this widget safely." };
  return { title: "Widget unavailable", description: "This widget could not be prepared. Other dashboard widgets remain available." };
}

function titleFor(widgetId: DashboardWidgetId): string {
  return widgetId.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

export function WidgetRuntimeCard({ state }: { readonly state: WidgetRuntimeState }) {
  const model = state.viewModel;
  const copy = stateCopy(state);
  return (
    <SectionShell title={model?.title ?? titleFor(state.widgetId)} description={model ? `${model.primaryValue} records in the current snapshot.` : copy.description} eyebrow="Dashboard Data">
      {state.state === "ready" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-2xl font-semibold text-fg">{model?.primaryValue}</p>
            <Badge variant="info">{model?.displayStatus}</Badge>
          </div>
          <div className="divide-y divide-border">
            {model?.items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <p className="min-w-0 truncate text-sm text-fg">{item.label}</p>
                <span className="shrink-0 text-xs font-medium text-fg-secondary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : state.state === "loading" ? (
        <div className="flex min-h-32 flex-col justify-center gap-1 text-sm text-fg-secondary">
          <p className="font-medium text-fg">{copy.title}</p>
          <p>{copy.description}</p>
        </div>
      ) : (
        <EmptyState title={copy.title} description={copy.description} eyebrow={state.state} className="min-h-32 p-4" />
      )}
    </SectionShell>
  );
}

export function WidgetRuntimeBoard({ initialSnapshot, initialRuntime, initialOverview, initialInsights }: {
  readonly initialSnapshot?: DashboardSnapshot;
  readonly initialRuntime: WidgetRuntimeSnapshot;
  readonly initialOverview: ExecutiveOverview;
  readonly initialInsights: readonly ExecutiveInsight[];
}) {
  const [engine] = useState(() => new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0"));
  const [runtime, setRuntime] = useState(initialRuntime);
  const [overview, setOverview] = useState(initialOverview);
  const [insights, setInsights] = useState(initialInsights);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | undefined>(initialSnapshot);
  const applyRuntime = (next: WidgetRuntimeSnapshot) => {
    const nextOverview = createExecutiveOverview({ runtime: next, evaluatedAt: new Date() });
    setRuntime(next);
    setOverview(nextOverview);
    setInsights(createExecutiveInsights(nextOverview));
  };
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSnapshot(initialSnapshot);
      applyRuntime(initialSnapshot
        ? engine.switchSnapshot({ snapshot: initialSnapshot, authorityScope: dashboardScope })
        : engine.manualRefresh({ authorityScope: dashboardScope }));
    });
    return () => cancelAnimationFrame(frame);
  }, [engine, initialSnapshot]);
  const refresh = () => {
    applyRuntime(engine.beginRefresh());
    requestAnimationFrame(() => applyRuntime(engine.manualRefresh({ snapshot, authorityScope: dashboardScope })));
  };
  return (
    <div className="space-y-6">
      <ExecutiveOverviewSection overview={overview} />
      <ExecutiveInsightsSection insights={insights} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-fg-secondary">
          <Badge variant={snapshot ? "success" : "warning"}>{snapshot ? "Snapshot Ready" : "Snapshot Unavailable"}</Badge>
          <span>{snapshot ? `Generated ${new Date(snapshot.generatedAt).toLocaleString()}` : "No dashboard snapshot is available."}</span>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={widgetOrder.some((widgetId) => runtime.states[widgetId].state === "loading")}>
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {widgetOrder.map((widgetId) => <WidgetRuntimeCard key={widgetId} state={runtime.states[widgetId]} />)}
      </div>
    </div>
  );
}
