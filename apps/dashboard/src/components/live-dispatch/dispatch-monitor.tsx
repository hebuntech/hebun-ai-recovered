"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Activity, CheckCircle2, ListChecks, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { getSnapshot, subscribe } from "@/features/agent-crud";
import {
  getNodeSnapshot,
  getRelationshipSnapshot,
  subscribeNodes,
  subscribeRelationships,
} from "@/features/knowledge-crud";
import {
  getSnapshot as getMemorySnapshot,
  subscribe as subscribeMemory,
} from "@/features/memory-crud";
import { getExecutiveDispatchMonitor } from "@/features/live-dispatch";

function subscribeAll(callback: () => void): () => void {
  const unsubs = [
    subscribe(callback),
    subscribeMemory(callback),
    subscribeNodes(callback),
    subscribeRelationships(callback),
  ];
  return () => unsubs.forEach((unsub) => unsub());
}

function storeVersion(): string {
  return `${getSnapshot().length}:${getMemorySnapshot().length}:${getNodeSnapshot().length}:${getRelationshipSnapshot().length}`;
}

export function DispatchMonitor() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);

  const monitor = useMemo(() => {
    void version;
    return getExecutiveDispatchMonitor();
  }, [version]);

  const { rows, totals } = monitor;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Global Queue"
          value={String(totals.queued + totals.executing + totals.completed + totals.failed)}
          caption={`${totals.candidates} candidates`}
          icon={<ListChecks className="size-4" />}
        />
        <StatCard
          label="Executing"
          value={String(totals.executing)}
          caption={`${totals.dispatched} dispatched`}
          icon={<Activity className="size-4" />}
        />
        <StatCard
          label="Completed"
          value={String(totals.completed)}
          caption={`throughput ${totals.throughput}%`}
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatCard
          label="Failed / Rejected"
          value={`${totals.failed} / ${totals.rejected}`}
          caption={totals.readinessVsDispatched}
          icon={<XCircle className="size-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle>Executive Dispatch Monitor</CardTitle>
            <span className="text-xs text-fg-muted">
              Global internal command queue across active agents · readiness vs dispatched · deterministic, offline
            </span>
          </div>
          <Badge variant={totals.health === "healthy" ? "success" : totals.health === "degraded" ? "warning" : "neutral"}>
            dispatch {totals.health}
          </Badge>
        </CardHeader>
        <CardContent className="ui-table-wrap">
          {rows.length === 0 ? (
            <p className="text-sm text-fg-muted">No active agents to dispatch for.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Agent</th>
                  <th className="pb-3 pr-4 font-medium">Readiness</th>
                  <th className="pb-3 pr-4 font-medium">Queue</th>
                  <th className="pb-3 pr-4 font-medium">Executing</th>
                  <th className="pb-3 pr-4 font-medium">Completed</th>
                  <th className="pb-3 pr-4 font-medium">Failed</th>
                  <th className="pb-3 pr-4 font-medium">Rejected</th>
                  <th className="pb-3 pr-4 font-medium">Throughput</th>
                  <th className="pb-3 pr-4 font-medium">Health</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.agentId} className="border-t border-border/70 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-fg">{row.agentName}</p>
                      <p className="text-xs text-fg-muted">{row.agentId}</p>
                    </td>
                    <td className="py-3 pr-4 text-fg-secondary">{row.readinessStatus}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.queueDepth}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.executing}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.completed}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.failed}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.rejected}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">{row.throughput}%</td>
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
