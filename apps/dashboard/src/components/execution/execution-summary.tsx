import {
  Play,
  Clock,
  XCircle,
  CheckCircle2,
  Timer,
  Repeat,
  Activity,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { executionMetrics as m } from "@/features/execution";

export function ExecutionSummary() {
  const tiles = [
    { label: "Running Sessions", value: `${m.runningSessions}`, icon: <Play className="size-4" /> },
    { label: "Queued Sessions", value: `${m.queuedSessions}`, icon: <Clock className="size-4" /> },
    { label: "Failed Sessions", value: `${m.failedSessions}`, icon: <XCircle className="size-4" /> },
    { label: "Completed Sessions", value: `${m.completedSessions}`, icon: <CheckCircle2 className="size-4" /> },
    { label: "Average Duration", value: m.averageDuration, icon: <Timer className="size-4" /> },
    { label: "Retry Rate", value: `${m.retryRate}%`, icon: <Repeat className="size-4" /> },
    { label: "Open Sessions", value: `${m.openSessions}`, icon: <Activity className="size-4" /> },
    { label: "Execution Health", value: `${m.executionHealth}`, icon: <Activity className="size-4" /> },
  ];
  return (
    <>
      {tiles.map((t) => (
        <div key={t.label} className="col-span-6 sm:col-span-4 xl:col-span-3">
          <StatCard label={t.label} value={t.value} icon={t.icon} />
        </div>
      ))}
    </>
  );
}
