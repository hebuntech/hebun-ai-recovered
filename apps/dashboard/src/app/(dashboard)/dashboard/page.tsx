import { DashboardFoundation } from "@/components/director-dashboard/dashboard-foundation";
import { getDirectorDashboardUiModel } from "@/features/director-dashboard-ui/adapter.server";

export default async function DirectorDashboardPage() {
  const widgetRuntime = getDirectorDashboardUiModel();

  return <DashboardFoundation widgetRuntime={widgetRuntime} />;
}
