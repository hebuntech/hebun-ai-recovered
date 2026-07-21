import { PageHeader } from "@/components/layout/page-header";
import type { DirectorDashboardUiModel } from "@/features/director-dashboard-ui/adapter.server";
import { WidgetRuntimeBoard } from "@/components/director-dashboard/widget-runtime-board";

interface DashboardFoundationProps {
  widgetRuntime?: DirectorDashboardUiModel;
}

export function DashboardFoundation({ widgetRuntime }: DashboardFoundationProps) {
  if (!widgetRuntime) return null;

  return (
    <>
      <PageHeader
        title="Director Dashboard"
        context="The operational control center of the company. Every widget reads the current immutable dashboard snapshot."
      />
      <WidgetRuntimeBoard
        initialSnapshot={widgetRuntime.snapshot}
        initialRuntime={widgetRuntime.widgets}
        initialOverview={widgetRuntime.overview}
        initialInsights={widgetRuntime.insights}
      />
    </>
  );
}
