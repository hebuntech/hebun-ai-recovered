import { DashboardFoundation } from "@/components/director-dashboard/dashboard-foundation";
import { getDirectorDashboardSnapshot } from "@/features/director-dashboard/foundation";

export default async function DirectorDashboardPage() {
  const snapshot = await getDirectorDashboardSnapshot();

  return <DashboardFoundation snapshot={snapshot} />;
}
