"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Activity, CheckCircle2, Gauge, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { subscribe as subscribeAgents, getSnapshot as getAgentSnapshot } from "@/features/agent-crud";
import {
  getExecutiveQueueMonitor,
  subscribe as subscribeQueue,
  getSnapshot as getQueueSnapshot,
} from "@/features/execution-queue";

export function QueueMonitor() {
  const queueSnap = useSyncExternalStore(subscribeQueue, getQueueSnapshot, getQueueSnapshot);
  const agentSnap = useSyncExternalStore(subscribeAgents, getAgentSnapshot, getAgentSnapshot);

  const monitor = useMemo(() => {
    void queueSnap;
    void agentSnap;
    return getExecutiveQueueMonitor();
  }, [queueSnap, agentSnap]);

  const { rows, totals } = monitor;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Queues"
          value={String(totals.activeQueues)}
          caption={`${totals.entries} entries`}
          icon={<Layers className="size-4" />}
        />
        <StatCard
          label="Queue Depth"
          value={String(totals.queueDepth)}
          caption={`${totals.running} running · ${totals.paused} paused`}
          icon={<Activity className="size-4" />}
        />
        <StatCard
          label="Completed"
          value={String(totals.completed)}
          caption={`throughput ${totals.throughput}%`}
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatCard
          label="Transition Rate"
          value={String(totals.transitionRate)}
          caption={`${totals.transitionCount} transitions · ${totals.retrying} retrying`}
          icon={<Gauge className="size-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle>Executive Queue Monitor</CardTitle>
            <span className="text-xs text-fg-muted">
              Stateful execution queues across active agents · deterministic transitions · offline
            </span>
          </div>
          <Badge
            variant={
              totals.health === "healthy"
                ? "success"
                : totals.health === "degraded"
                  ? "warning"
                  : totals.health === "stalled"
                    ? "error"
                    : "neutral"
            }
          >
            execution {totals.health}
          </Badge>
        </CardHeader>
        <CardContent className="ui-table-wrap">
          {rows.length === 0 ? (
            <p className="text-sm text-fg-muted">No active queues.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Agent</th>
                  <th className="pb-3 pr-4 font-medium">Depth</th>
                  <th className="pb-3 pr-4 font-medium">Running</th>
                  <th className="pb-3 pr-4 font-medium">Paused</th>
                  <th className="pb-3 pr-4 font-medium">Retrying</th>
                  <th className="pb-3 pr-4 font-medium">Completed</th>
                  <th className="pb-3 pr-4 font-medium">Failed</th>
                  <th className="pb-3 pr-4 font-medium">Throughput</th>
                  <th className="pb-3 pr-4 font-medium">Transitions</th>
                  <th className="pb-3 pr-4 font-medium">Health</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.queueId} className="border-t border-border/70 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-fg">{row.agentName}</p>
                      <p className="text-xs text-fg-muted">{row.agentId}</p>
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.depth}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.running}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.paused}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.retrying}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.completed}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.failed}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.throughput}%</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.transitionCount}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={row.badge}>{row.health}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
