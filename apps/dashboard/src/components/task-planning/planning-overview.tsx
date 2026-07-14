"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
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
import { getExecutiveExecutionBridges } from "@/features/execution-bridge";
import { getExecutiveExecutionMonitor, approvalStateBadge, simulationStateBadge } from "@/features/execution-engine";
import { getExecutiveApprovalMonitor, approvalStatusBadge } from "@/features/human-approval";
import { executionReadinessBadge, getExecutiveReadinessDashboard } from "@/features/execution-readiness";
import { getActivePlans } from "@/features/task-planning";
import type { PlanPriority, PlanReadiness } from "@/features/task-planning";
import { ClipboardList, GitBranch, ShieldCheck, Timer } from "lucide-react";
import { ProgressBar } from "@/components/director/progress-bar";

const readinessVariant: Record<PlanReadiness, BadgeVariant> = {
  ready: "success",
  "needs-approval": "info",
  blocked: "warning",
};

const priorityVariant: Record<PlanPriority, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

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

export function PlanningOverview() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);

  const plans = useMemo(() => {
    void version;
    return getActivePlans();
  }, [version]);
  const executionBridges = useMemo(() => {
    void version;
    return getExecutiveExecutionBridges();
  }, [version]);
  const executionMonitor = useMemo(() => {
    void version;
    return getExecutiveExecutionMonitor();
  }, [version]);
  const approvalMonitor = useMemo(() => {
    void version;
    return getExecutiveApprovalMonitor();
  }, [version]);
  const readinessDashboard = useMemo(() => {
    void version;
    return getExecutiveReadinessDashboard();
  }, [version]);

  const totals = useMemo(() => {
    const taskCount = plans.reduce((sum, p) => sum + p.report.taskCount, 0);
    const approvalCount = plans.reduce((sum, p) => sum + p.report.approvalCount, 0);
    const longestPath = plans.reduce(
      (max, p) => Math.max(max, p.report.criticalPathDuration),
      0
    );
    return { taskCount, approvalCount, longestPath, agentCount: plans.length };
  }, [plans]);
  const executionTotals = useMemo(() => {
    const commandCount = executionBridges.reduce(
      (sum, bridge) => sum + bridge.preview.summary.totalCommands,
      0
    );
    const approvalCount = executionBridges.reduce(
      (sum, bridge) => sum + bridge.preview.summary.totalApprovals,
      0
    );
    const longestPath = executionBridges.reduce(
      (max, bridge) => Math.max(max, bridge.preview.summary.criticalPathLength),
      0
    );
    return { commandCount, approvalCount, longestPath };
  }, [executionBridges]);
  const monitorTotals = useMemo(() => {
    const blocked = executionMonitor.reduce((sum, item) => sum + item.blockedCommands, 0);
    const avgProgress =
      executionMonitor.length === 0
        ? 0
        : Math.round(
            executionMonitor.reduce((sum, item) => sum + item.completionPercent, 0) /
              executionMonitor.length
          );
    return { blocked, avgProgress };
  }, [executionMonitor]);
  const approvalTotals = useMemo(() => {
    return {
      approvals: approvalMonitor.reduce((sum, item) => sum + item.approvals, 0),
      rejected: approvalMonitor.reduce((sum, item) => sum + item.rejected, 0),
      ready: approvalMonitor.reduce((sum, item) => sum + item.readyCommands, 0),
    };
  }, [approvalMonitor]);
  const readinessTotals = useMemo(() => {
    const readyAgents = readinessDashboard.filter((row) => row.status === "ready").length;
    const blockedAgents = readinessDashboard.length - readyAgents;
    const averageReadiness =
      readinessDashboard.length === 0
        ? 0
        : Math.round(
            readinessDashboard.reduce((sum, row) => sum + row.score, 0) /
              readinessDashboard.length
          );
    const blockingCategories = readinessDashboard.reduce<Record<string, number>>((acc, row) => {
      acc[row.blockingCategory] = (acc[row.blockingCategory] ?? 0) + 1;
      return acc;
    }, {});
    const dominantBlockingCategory =
      Object.entries(blockingCategories).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";
    const readinessTrend =
      averageReadiness >= 85 ? "stable-ready" : averageReadiness >= 70 ? "improving" : "constrained";

    return {
      readyAgents,
      blockedAgents,
      averageReadiness,
      dominantBlockingCategory,
      readinessTrend,
    };
  }, [readinessDashboard]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Agents Planned"
          value={String(totals.agentCount)}
          icon={<ClipboardList className="size-4" />}
        />
        <StatCard
          label="Planned Tasks"
          value={String(totals.taskCount)}
          icon={<GitBranch className="size-4" />}
        />
        <StatCard
          label="Approval Gates"
          value={String(totals.approvalCount)}
          icon={<ShieldCheck className="size-4" />}
        />
        <StatCard
          label="Longest Critical Path"
          value={`${totals.longestPath}m`}
          icon={<Timer className="size-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executive Planning Overview</CardTitle>
          <span className="text-xs text-fg-muted">
            Deterministic Execution Plans across active agents · read-only
          </span>
        </CardHeader>
        <CardContent className="ui-table-wrap">
          {plans.length === 0 ? (
            <p className="text-sm text-fg-muted">No active agents to plan for.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Agent</th>
                  <th className="pb-3 pr-4 font-medium">Primary Goal</th>
                  <th className="pb-3 pr-4 font-medium">Planned Tasks</th>
                  <th className="pb-3 pr-4 font-medium">Approvals</th>
                  <th className="pb-3 pr-4 font-medium">Critical Path</th>
                  <th className="pb-3 pr-4 font-medium">Est. Completion</th>
                  <th className="pb-3 pr-4 font-medium">Priority</th>
                  <th className="pb-3 pr-4 font-medium">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(({ report }) => (
                  <tr key={report.agentId} className="border-t border-border/70 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-fg">{report.agentName}</p>
                      <p className="text-xs text-fg-muted">{report.agentId}</p>
                    </td>
                    <td className="py-3 pr-4 text-fg-secondary">{report.primaryGoal}</td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                      {report.taskCount}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                      {report.approvalCount}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                      {report.criticalPathLength} · {report.criticalPathDuration}m
                    </td>
                    <td className="py-3 pr-4 text-fg-secondary">
                      {report.estimatedCompletion}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={priorityVariant[report.priority]}>
                        {report.priority}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={readinessVariant[report.readiness]}>
                        {report.readiness}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Executive Execution Preview</CardTitle>
          <span className="text-xs text-fg-muted">
            Deterministic Command Plans derived from the current Execution Plans
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Planned Commands"
              value={String(executionTotals.commandCount)}
              icon={<ClipboardList className="size-4" />}
            />
            <StatCard
              label="Approval Count"
              value={String(executionTotals.approvalCount)}
              icon={<ShieldCheck className="size-4" />}
            />
            <StatCard
              label="Critical Path"
              value={String(executionTotals.longestPath)}
              icon={<GitBranch className="size-4" />}
            />
            <StatCard
              label="Execution Preview"
              value={String(executionBridges.length)}
              icon={<Timer className="size-4" />}
            />
          </div>

          {executionBridges.length === 0 ? (
            <p className="text-sm text-fg-muted">No active execution previews available.</p>
          ) : (
            <div className="ui-table-wrap">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Agent</th>
                    <th className="pb-3 pr-4 font-medium">Planned Commands</th>
                    <th className="pb-3 pr-4 font-medium">Approval Count</th>
                    <th className="pb-3 pr-4 font-medium">Critical Path</th>
                    <th className="pb-3 pr-4 font-medium">Estimated Execution Time</th>
                    <th className="pb-3 pr-4 font-medium">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {executionBridges.map(({ preview, report }) => (
                    <tr key={preview.agentId} className="border-t border-border/70 align-top">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-fg">{preview.agentName}</p>
                        <p className="text-xs text-fg-muted">{preview.agentId}</p>
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                        {preview.summary.totalCommands}
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                        {preview.summary.totalApprovals}
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                        {preview.summary.criticalPathLength}
                      </td>
                      <td className="py-3 pr-4 text-fg-secondary">{preview.estimatedDuration}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={preview.validation.valid ? "success" : "warning"}>
                          {preview.validation.valid
                            ? "valid"
                            : `${report.telemetry.validationFailures} issue(s)`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Executive Execution Monitor</CardTitle>
          <span className="text-xs text-fg-muted">
            Simulated execution state across active agents · deterministic and read-only
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Agents Simulated"
              value={String(executionMonitor.length)}
              icon={<ClipboardList className="size-4" />}
            />
            <StatCard
              label="Average Progress"
              value={`${monitorTotals.avgProgress}%`}
              icon={<Timer className="size-4" />}
            />
            <StatCard
              label="Blocked Commands"
              value={String(monitorTotals.blocked)}
              icon={<ShieldCheck className="size-4" />}
            />
            <StatCard
              label="Critical Paths"
              value={String(executionTotals.longestPath)}
              icon={<GitBranch className="size-4" />}
            />
          </div>

          {executionMonitor.length === 0 ? (
            <p className="text-sm text-fg-muted">No execution simulations available.</p>
          ) : (
            <div className="ui-table-wrap">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Agent</th>
                    <th className="pb-3 pr-4 font-medium">Execution Progress</th>
                    <th className="pb-3 pr-4 font-medium">Blocked Commands</th>
                    <th className="pb-3 pr-4 font-medium">Approval Status</th>
                    <th className="pb-3 pr-4 font-medium">Critical Path</th>
                    <th className="pb-3 pr-4 font-medium">Completion %</th>
                    <th className="pb-3 pr-4 font-medium">State</th>
                  </tr>
                </thead>
                <tbody>
                  {executionMonitor.map((row) => (
                    <tr key={row.agentId} className="border-t border-border/70 align-top">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-fg">{row.agentName}</p>
                        <p className="text-xs text-fg-muted">{row.agentId}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex min-w-40 flex-col gap-2">
                          <span className="text-xs text-fg-secondary">{row.progress}%</span>
                          <ProgressBar value={row.progress} />
                        </div>
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                        {row.blockedCommands}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={approvalStateBadge(row.approvalStatus)}>
                          {row.approvalStatus}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                        {row.criticalPath}
                      </td>
                      <td className="py-3 pr-4 text-fg-secondary">
                        {row.completionPercent}%
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={simulationStateBadge(row.state)}>{row.state}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Executive Approval Monitor</CardTitle>
          <span className="text-xs text-fg-muted">
            Human approval resolution across simulated execution plans
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Approval Pipeline"
              value={String(approvalTotals.approvals)}
              icon={<ShieldCheck className="size-4" />}
            />
            <StatCard
              label="Ready Commands"
              value={String(approvalTotals.ready)}
              icon={<ClipboardList className="size-4" />}
            />
            <StatCard
              label="Rejected Commands"
              value={String(approvalTotals.rejected)}
              icon={<GitBranch className="size-4" />}
            />
            <StatCard
              label="Blocked Execution"
              value={String(monitorTotals.blocked)}
              icon={<Timer className="size-4" />}
            />
          </div>

          {approvalMonitor.length === 0 ? (
            <p className="text-sm text-fg-muted">No approval resolutions available.</p>
          ) : (
            <div className="ui-table-wrap">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Agent</th>
                    <th className="pb-3 pr-4 font-medium">Approvals</th>
                    <th className="pb-3 pr-4 font-medium">Approval Pipeline</th>
                    <th className="pb-3 pr-4 font-medium">Approval Bottlenecks</th>
                    <th className="pb-3 pr-4 font-medium">Blocked Execution</th>
                    <th className="pb-3 pr-4 font-medium">Ready Commands</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalMonitor.map((row) => (
                    <tr key={row.agentId} className="border-t border-border/70 align-top">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-fg">{row.agentName}</p>
                        <p className="text-xs text-fg-muted">{row.agentId}</p>
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                        {row.approvals}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="warning">{row.pending} pending</Badge>
                          <Badge variant="success">{row.approved} approved</Badge>
                          <Badge variant="error">{row.rejected} rejected</Badge>
                          <Badge variant="info">{row.changesRequested} changes</Badge>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-fg-secondary">{row.bottleneck}</td>
                      <td className="py-3 pr-4 tabular-nums text-fg-secondary">
                        {row.blockedExecution}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex min-w-40 flex-col gap-2">
                          <Badge variant={row.readyCommands > 0 ? approvalStatusBadge("approved") : approvalStatusBadge("pending")}>
                            {row.readyCommands} ready
                          </Badge>
                          <ProgressBar value={row.approvals === 0 ? 0 : Math.round((row.readyCommands / row.approvals) * 100)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Executive Readiness Dashboard</CardTitle>
          <span className="text-xs text-fg-muted">
            Final readiness gate between human approval and future live dispatch
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Ready Agents"
              value={String(readinessTotals.readyAgents)}
              icon={<ShieldCheck className="size-4" />}
            />
            <StatCard
              label="Blocked Agents"
              value={String(readinessTotals.blockedAgents)}
              icon={<GitBranch className="size-4" />}
            />
            <StatCard
              label="Average Readiness"
              value={`${readinessTotals.averageReadiness}%`}
              icon={<Timer className="size-4" />}
            />
            <StatCard
              label="Readiness Trend"
              value={readinessTotals.readinessTrend}
              icon={<ClipboardList className="size-4" />}
            />
          </div>

          <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
            Dispatch readiness summary: {readinessTotals.readyAgents} ready agent(s) ·{" "}
            {readinessTotals.blockedAgents} blocked agent(s) · dominant blocker{" "}
            {readinessTotals.dominantBlockingCategory}
          </div>

          {readinessDashboard.length === 0 ? (
            <p className="text-sm text-fg-muted">No execution readiness reports available.</p>
          ) : (
            <div className="ui-table-wrap">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Agent</th>
                    <th className="pb-3 pr-4 font-medium">Readiness</th>
                    <th className="pb-3 pr-4 font-medium">Approval Readiness</th>
                    <th className="pb-3 pr-4 font-medium">Dependency Readiness</th>
                    <th className="pb-3 pr-4 font-medium">Ready Commands</th>
                    <th className="pb-3 pr-4 font-medium">Blocked Commands</th>
                    <th className="pb-3 pr-4 font-medium">Blocking Category</th>
                    <th className="pb-3 pr-4 font-medium">Dispatch Readiness</th>
                  </tr>
                </thead>
                <tbody>
                  {readinessDashboard.map((row) => (
                    <tr key={row.agentId} className="border-t border-border/70 align-top">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-fg">{row.agentName}</p>
                        <p className="text-xs text-fg-muted">{row.agentId}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex min-w-40 flex-col gap-2">
                          <Badge variant={executionReadinessBadge(row.status)}>
                            {row.score}% · {row.status}
                          </Badge>
                          <ProgressBar value={row.score} />
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-fg-secondary">
                        {row.approvalReadiness}%
                      </td>
                      <td className="py-3 pr-4 text-fg-secondary">
                        {row.dependencyReadiness}%
                      </td>
                      <td className="py-3 pr-4 text-fg-secondary">
                        {row.readyCommands}
                      </td>
                      <td className="py-3 pr-4 text-fg-secondary">
                        {row.blockedCommands}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={row.blockingCategory === "none" ? "success" : "warning"}>
                            {row.blockingCategory}
                          </Badge>
                          <Badge variant="neutral">{row.trend}</Badge>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-fg-secondary">{row.dispatchSummary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
