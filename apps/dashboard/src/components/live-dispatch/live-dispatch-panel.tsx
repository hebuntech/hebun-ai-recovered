"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Rocket } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getAgentLiveDispatch, dispatchHealthBadge } from "@/features/live-dispatch";
import type { DispatchRejectReason, QueueState } from "@/features/live-dispatch";
import type { PlanPriority } from "@/features/task-planning";

const stateVariant: Record<QueueState, BadgeVariant> = {
  queued: "neutral",
  preparing: "info",
  dispatched: "info",
  executing: "info",
  completed: "success",
  failed: "error",
  cancelled: "warning",
};

const priorityVariant: Record<PlanPriority, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const reasonVariant: Record<DispatchRejectReason, BadgeVariant> = {
  "validation-failed": "error",
  "approval-rejected": "error",
  blocked: "error",
  "dependencies-incomplete": "warning",
  "approval-pending": "warning",
  "not-ready": "neutral",
};

const selectClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong";

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

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-surface-sunken p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function LiveDispatchPanel() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);
  const agents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.lifecycleStatus === "active"),
    [agents]
  );

  const [agentId, setAgentId] = useState("");
  const selectedId = agentId || activeAgents[0]?.id || "";

  const dispatch = useMemo(() => {
    void version;
    return getAgentLiveDispatch(selectedId);
  }, [selectedId, version]);

  if (!dispatch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Dispatch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-fg-muted">No active agent to dispatch for.</p>
        </CardContent>
      </Card>
    );
  }

  const { queue, rejected, progress, telemetry, report } = dispatch;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Rocket className="size-4 text-primary" />
              Live Dispatch Panel
            </span>
          </CardTitle>
          <span className="text-xs text-fg-muted">
            Real internal Command Bus dispatch · READY commands only · fully offline, deterministic
          </span>
        </div>
        <Badge variant={dispatchHealthBadge(report.health)}>{report.health}</Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5 sm:max-w-sm">
          <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Agent
          </label>
          <select className={selectClass} value={selectedId} onChange={(e) => setAgentId(e.target.value)}>
            {activeAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.department}
              </option>
            ))}
          </select>
        </div>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Queue Depth" value={queue.length} />
          <Metric label="Completed" value={progress.completed} />
          <Metric label="Rejected" value={rejected.length} />
          <Metric label="Throughput" value={`${telemetry.throughput}%`} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={report.admitted ? "success" : "neutral"}>
            {report.admitted ? "admitted" : "held"}
          </Badge>
          <Badge variant="neutral">readiness: {report.readinessStatus}</Badge>
          <Badge variant="neutral">{progress.completionPercent}% complete</Badge>
          <Badge variant="neutral">{telemetry.candidates} candidates</Badge>
        </div>

        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">Admission</p>
          <p className="mt-1 text-sm text-fg">{report.admissionReason}</p>
        </div>

        {/* Queue progress bar */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Queue Progress
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress.completionPercent}%` }}
            />
          </div>
          <p className="text-xs text-fg-muted">
            {progress.completed} completed · {progress.failed} failed · {progress.cancelled} cancelled ·{" "}
            {telemetry.ticksConsumed} deterministic ticks
          </p>
        </div>

        {/* Live queue */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Dispatch Queue ({queue.length})
          </p>
          {queue.length === 0 ? (
            <p className="text-xs text-fg-muted">No commands admitted to the live queue.</p>
          ) : (
            <div className="ui-table-wrap">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">#</th>
                    <th className="pb-2 pr-4 font-medium">Command</th>
                    <th className="pb-2 pr-4 font-medium">Dispatch ID</th>
                    <th className="pb-2 pr-4 font-medium">Priority</th>
                    <th className="pb-2 pr-4 font-medium">State</th>
                    <th className="pb-2 pr-4 font-medium">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => (
                    <tr key={item.dispatchId} className="border-t border-border/70 align-top">
                      <td className="py-2 pr-4 tabular-nums text-fg-secondary">{item.queuePosition}</td>
                      <td className="py-2 pr-4">
                        <p className="font-medium text-fg">{item.commandLabel}</p>
                        <p className="text-xs text-fg-muted">{item.title}</p>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-fg-secondary">{item.dispatchId}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={priorityVariant[item.priority]}>{item.priority}</Badge>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={stateVariant[item.state]}>{item.state}</Badge>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-fg-secondary">
                        {item.queuedAt} → {item.settledAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rejected / blocked */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Rejected & Blocked ({rejected.length})
          </p>
          {rejected.length === 0 ? (
            <p className="text-xs text-fg-muted">No rejected commands.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {rejected.map((item) => (
                <div
                  key={item.commandId}
                  className="flex items-start justify-between gap-3 rounded-md border bg-surface-sunken p-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-fg">{item.commandLabel}</p>
                    <p className="text-fg-secondary">{item.detail}</p>
                  </div>
                  <Badge variant={reasonVariant[item.reason]}>{item.reason}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry */}
        <div className="rounded-md border border-primary/40 bg-primary-subtle p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Dispatch Telemetry
          </p>
          <p className="mt-1 text-sm text-fg">{report.dispatchSummary}</p>
          <p className="mt-1 text-xs text-fg-secondary">
            {telemetry.accepted} accepted · {telemetry.completed} completed · {telemetry.failed} failed ·{" "}
            {telemetry.rejected} rejected · throughput {telemetry.throughput}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
