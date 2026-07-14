"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ListVideo } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSnapshot, subscribe } from "@/features/agent-crud";
import {
  getAgentQueue,
  subscribe as subscribeQueue,
  getSnapshot as getQueueSnapshot,
  executionHealthBadge,
} from "@/features/execution-queue";
import type { ExecutionState } from "@/features/execution-queue";
import type { PlanPriority } from "@/features/task-planning";

const stateVariant: Record<ExecutionState, BadgeVariant> = {
  queued: "neutral",
  preparing: "info",
  executing: "info",
  paused: "warning",
  "waiting-approval": "warning",
  "waiting-dependencies": "warning",
  retrying: "warning",
  completed: "success",
  failed: "error",
  cancelled: "error",
};

const priorityVariant: Record<PlanPriority, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const selectClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong";

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-surface-sunken p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function ExecutionQueuePanel() {
  // Two stores: the agent registry (for the selector) and the stateful queue
  // store (its snapshot ref changes on every committed transition).
  const queueSnap = useSyncExternalStore(subscribeQueue, getQueueSnapshot, getQueueSnapshot);
  const agents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.lifecycleStatus === "active"),
    [agents]
  );

  const [agentId, setAgentId] = useState("");
  const selectedId = agentId || activeAgents[0]?.id || "";

  const view = useMemo(() => {
    // `queueSnap` gates recomputation on any committed queue transition.
    void queueSnap;
    return selectedId ? getAgentQueue(selectedId) : null;
  }, [selectedId, queueSnap]);

  if (!view) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Execution Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-fg-muted">No active agent to queue for.</p>
        </CardContent>
      </Card>
    );
  }

  const { entries, history, progress, telemetry, report } = view;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <ListVideo className="size-4 text-primary" />
              Execution Queue Panel
            </span>
          </CardTitle>
          <span className="text-xs text-fg-muted">
            Stateful in-memory queue · survives re-renders · deterministic validated transitions
          </span>
        </div>
        <Badge variant={executionHealthBadge(report.health)}>{report.health}</Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5 sm:max-w-sm">
          <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">Agent</label>
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
          <Metric label="Queue Depth" value={progress.depth} />
          <Metric label="Completed" value={progress.completed} />
          <Metric label="Failed" value={progress.failed} />
          <Metric label="Throughput" value={`${telemetry.throughput}%`} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{progress.completionPercent}% complete</Badge>
          <Badge variant="neutral">{telemetry.paused} paused</Badge>
          <Badge variant="neutral">{telemetry.retrying} retrying</Badge>
          <Badge variant="neutral">{telemetry.transitionCount} transitions</Badge>
        </div>

        {/* Queue progress bar */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">Queue Progress</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress.completionPercent}%` }} />
          </div>
          <p className="text-xs text-fg-muted">
            {progress.completed} completed · {progress.failed} failed · {progress.paused} paused ·{" "}
            {progress.waitingApproval + progress.waitingDependencies} waiting
          </p>
        </div>

        {/* Queue table */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Queue ({entries.length})
          </p>
          {entries.length === 0 ? (
            <p className="text-xs text-fg-muted">Queue is empty.</p>
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
                    <th className="pb-2 pr-4 font-medium">Retries</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-border/70 align-top">
                      <td className="py-2 pr-4 tabular-nums text-fg-secondary">{entry.queuePosition}</td>
                      <td className="py-2 pr-4">
                        <p className="font-medium text-fg">{entry.commandLabel}</p>
                        <p className="text-xs text-fg-muted">{entry.title}</p>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-fg-secondary">{entry.dispatchId}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={priorityVariant[entry.priority]}>{entry.priority}</Badge>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={stateVariant[entry.state]}>{entry.state}</Badge>
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-fg-secondary">{entry.retryCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transition history */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Transition History ({history.length})
          </p>
          {history.length === 0 ? (
            <p className="text-xs text-fg-muted">No transitions yet.</p>
          ) : (
            <div className="ui-table-wrap">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Seq</th>
                    <th className="pb-2 pr-4 font-medium">Dispatch</th>
                    <th className="pb-2 pr-4 font-medium">Op</th>
                    <th className="pb-2 pr-4 font-medium">From → To</th>
                    <th className="pb-2 pr-4 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={`${record.dispatchId}-${record.seq}`} className="border-t border-border/70">
                      <td className="py-2 pr-4 tabular-nums text-fg-secondary">{record.seq}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-fg-secondary">{record.dispatchId}</td>
                      <td className="py-2 pr-4 text-fg-secondary">{record.operation}</td>
                      <td className="py-2 pr-4 text-fg">
                        {record.from ?? "∅"} → {record.to}
                      </td>
                      <td className="py-2 pr-4 text-fg-muted">{record.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-md border border-primary/40 bg-primary-subtle p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">Queue Summary</p>
          <p className="mt-1 text-sm text-fg">{report.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
