"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ClipboardList } from "lucide-react";
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
import { getAgentExecutionBridge } from "@/features/execution-bridge";
import { getAgentExecutionSimulation, approvalStateBadge, simulationStateBadge } from "@/features/execution-engine";
import { getAgentHumanApproval, approvalRiskBadge, approvalStatusBadge } from "@/features/human-approval";
import { executionReadinessBadge, getAgentExecutionReadiness } from "@/features/execution-readiness";
import { getAgentPlan } from "@/features/task-planning";
import type {
  ApprovalGateType,
  PlanPriority,
  PlanReadiness,
  TaskCategory,
} from "@/features/task-planning";

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

const gateVariant: Record<ApprovalGateType, BadgeVariant> = {
  policy: "info",
  legal: "warning",
  finance: "warning",
  executive: "error",
  human: "info",
};

const categoryLabel: Record<TaskCategory, string> = {
  preparation: "Prep",
  information: "Info",
  core: "Core",
  validation: "Validate",
  handoff: "Handoff",
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

export function TaskPlanningPanel() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);
  const agents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.lifecycleStatus === "active"),
    [agents]
  );

  const [agentId, setAgentId] = useState("");
  const selectedId = agentId || activeAgents[0]?.id || "";

  const result = useMemo(() => {
    // `version` gates recomputation when any upstream store mutates.
    void version;
    return getAgentPlan(selectedId);
  }, [selectedId, version]);
  const bridge = useMemo(() => {
    void version;
    return getAgentExecutionBridge(selectedId);
  }, [selectedId, version]);
  const executionSimulation = useMemo(() => {
    void version;
    return getAgentExecutionSimulation(selectedId);
  }, [selectedId, version]);
  const humanApproval = useMemo(() => {
    void version;
    return getAgentHumanApproval(selectedId);
  }, [selectedId, version]);
  const executionReadiness = useMemo(() => {
    void version;
    return getAgentExecutionReadiness(selectedId);
  }, [selectedId, version]);

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-fg-muted">No active agent to plan for.</p>
        </CardContent>
      </Card>
    );
  }

  const { plan } = result;
  const { goal, tasks, dependencies, approvals, timeline, summary } = plan;
  const preview = bridge?.preview;
  const validation = preview?.validation;
  const simulation = executionSimulation?.simulation;
  const approvalResolution = humanApproval;
  const readiness = executionReadiness;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <ClipboardList className="size-4 text-primary" />
              Task Planning Panel
            </span>
          </CardTitle>
          <span className="text-xs text-fg-muted">
            Read-only Execution Plan · Decision → goal → tasks → dependencies → resources → approvals → timeline
          </span>
        </div>
        <Badge variant={readinessVariant[summary.readiness]}>{summary.readiness}</Badge>
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
          <Metric label="Tasks" value={summary.taskCount} />
          <Metric label="Approvals" value={summary.approvalCount} />
          <Metric label="Critical Path" value={dependencies.criticalPath.length} />
          <Metric label="Est. Completion" value={timeline.estimatedCompletion} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={priorityVariant[goal.priority]}>{goal.priority} priority</Badge>
          <Badge variant="neutral">{dependencies.parallelCount} parallel</Badge>
          <Badge variant="neutral">{dependencies.sequentialCount} sequential</Badge>
          <Badge variant="neutral">critical path {timeline.estimatedCompletion}</Badge>
        </div>

        {/* Goal */}
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">Goal</p>
          <p className="mt-1 font-medium text-fg">{goal.primaryGoal}</p>
          <p className="mt-1 text-xs text-fg-muted">
            Deliverables: {goal.deliverables.join(" · ")}
          </p>
        </div>

        {/* Tasks */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Planned Tasks ({tasks.length})
          </p>
          <div className="ui-table-wrap">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Task</th>
                  <th className="pb-2 pr-4 font-medium">Phase</th>
                  <th className="pb-2 pr-4 font-medium">Owner</th>
                  <th className="pb-2 pr-4 font-medium">Est.</th>
                  <th className="pb-2 pr-4 font-medium">Expected Output</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-t border-border/70 align-top">
                    <td className="py-2 pr-4">
                      <p className="font-medium text-fg">{task.title}</p>
                      <p className="text-xs text-fg-muted">{task.id}</p>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant="neutral">{categoryLabel[task.category]}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-fg-secondary">
                      {task.ownerType}: {task.ownerId}
                    </td>
                    <td className="py-2 pr-4 tabular-nums text-fg-secondary">
                      {task.estimatedDuration}m
                    </td>
                    <td className="py-2 pr-4 text-fg-secondary">{task.expectedOutput}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dependencies + Timeline */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Dependencies
            </p>
            <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
              <p>
                Critical path: {dependencies.criticalPath.length} task(s) ·{" "}
                {dependencies.criticalPathDuration}m
              </p>
              <p className="mt-1">
                Parallel groups: {dependencies.parallelGroups.length}
              </p>
              {dependencies.parallelGroups.map((group, i) => (
                <p key={i} className="mt-1">
                  Group {i + 1}: {group.length} tasks in parallel
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Timeline · {timeline.estimatedCompletion}
            </p>
            <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
              {timeline.stages.map((stage) => (
                <p key={stage.order} className="mt-1 first:mt-0">
                  {stage.order}. {stage.label} — {stage.taskIds.length} task(s) · {stage.estimatedDuration}m
                </p>
              ))}
              {timeline.milestones.length > 0 && (
                <p className="mt-2 text-fg-muted">
                  Milestones: {timeline.milestones.map((m) => m.label).join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Approval gates */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Approval Gates ({approvals.length})
          </p>
          {approvals.length === 0 ? (
            <p className="text-xs text-fg-muted">No approval gates required.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {approvals.map((gate) => (
                <div
                  key={gate.id}
                  className="flex items-start justify-between gap-3 rounded-md border bg-surface-sunken p-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-fg">{gate.label}</p>
                    <p className="text-fg-secondary">{gate.reason}</p>
                  </div>
                  <Badge variant={gateVariant[gate.type]}>{gate.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendation */}
        <div className="rounded-md border border-primary/40 bg-primary-subtle p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Planning Summary
          </p>
          <p className="mt-1 font-semibold text-fg">{summary.recommendedAction}</p>
          <p className="mt-1 text-xs text-fg-secondary">
            {summary.taskCount} tasks · {summary.approvalCount} approvals · est. {timeline.estimatedCompletion}
          </p>
        </div>

        {preview ? (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                Command Preview Panel
              </p>
              <p className="mt-1 text-xs text-fg-secondary">
                Execution Plan mapped into a read-only Command Plan. Nothing dispatches or executes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric label="Commands" value={preview.summary.totalCommands} />
              <Metric label="Approval Gates" value={preview.summary.totalApprovals} />
              <Metric label="Blocked" value={preview.summary.blockedCommands} />
              <Metric label="Est. Execute" value={preview.estimatedDuration} />
            </div>

            <div className="ui-table-wrap">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Command</th>
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 pr-4 font-medium">Owner</th>
                    <th className="pb-2 pr-4 font-medium">Dependencies</th>
                    <th className="pb-2 pr-4 font-medium">Approvals</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.commands.map((command) => (
                    <tr key={command.id} className="border-t border-border/70 align-top">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-fg">{command.commandLabel}</p>
                        <p className="text-xs text-fg-muted">{command.traceability.taskTitle}</p>
                      </td>
                      <td className="py-2 pr-4 text-fg-secondary">{command.commandType}</td>
                      <td className="py-2 pr-4 text-fg-secondary">
                        {command.owner.type}: {command.owner.id}
                      </td>
                      <td className="py-2 pr-4 text-fg-secondary">
                        {command.dependencies.length === 0 ? "None" : command.dependencies.length}
                      </td>
                      <td className="py-2 pr-4 text-fg-secondary">
                        {command.approvalGateIds.length === 0 ? "None" : command.approvalGateIds.length}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={command.status === "waiting-approval" ? "warning" : command.status === "blocked" ? "error" : "neutral"}>
                          {command.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
                <p className="font-medium text-fg">Execution Order</p>
                {preview.executionOrder.map((stage) => (
                  <p key={stage.order} className="mt-1">
                    {stage.order}. {stage.label} · {stage.commandIds.length} command(s) · {stage.estimatedDuration}m
                  </p>
                ))}
              </div>
              <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
                <p className="font-medium text-fg">Dependency Summary</p>
                <p className="mt-1">Critical path: {preview.criticalPath.length} command(s)</p>
                <p className="mt-1">Approval dependencies: {preview.dependencies.approvalDependencies.length}</p>
                <p className="mt-1">Parallel groups: {preview.dependencies.parallelGroups.length}</p>
              </div>
            </div>

            <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
              <p className="font-medium text-fg">Validation</p>
              {validation?.valid ? (
                <p className="mt-1">Command plan validation passed.</p>
              ) : (
                <>
                  <p className="mt-1">{validation?.issues.length ?? 0} issue(s) detected.</p>
                  {(validation?.issues ?? []).slice(0, 3).map((issue) => (
                    <p key={`${issue.code}-${issue.commandId ?? issue.message}`} className="mt-1">
                      {issue.code}: {issue.message}
                    </p>
                  ))}
                </>
              )}
            </div>
          </div>
        ) : null}

        {simulation ? (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                Execution Simulation Panel
              </p>
              <p className="mt-1 text-xs text-fg-secondary">
                Deterministic simulation from the Command Plan. No command dispatch, no execution, no mutation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric label="Queue" value={simulation.summary.totalCommands} />
              <Metric label="Completed" value={simulation.summary.completed} />
              <Metric label="Blocked" value={simulation.summary.blocked} />
              <Metric label="Progress" value={`${simulation.summary.completionPercent}%`} />
            </div>

            <div className="rounded-md border bg-surface-sunken p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={simulationStateBadge(simulation.state)}>{simulation.state}</Badge>
                <Badge variant="neutral">{simulation.summary.waiting} waiting</Badge>
                <Badge variant="neutral">{simulation.summary.failed} failed</Badge>
                <Badge variant="neutral">{simulation.summary.estimatedDurationLabel}</Badge>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-info transition-[width] duration-(--dur-slow)"
                  style={{ width: `${simulation.summary.completionPercent}%` }}
                />
              </div>
            </div>

            <div className="ui-table-wrap">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Execution Queue</th>
                    <th className="pb-2 pr-4 font-medium">State</th>
                    <th className="pb-2 pr-4 font-medium">Approval</th>
                    <th className="pb-2 pr-4 font-medium">Blocked</th>
                    <th className="pb-2 pr-4 font-medium">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.queue.items.map((item) => (
                    <tr key={item.id} className="border-t border-border/70 align-top">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-fg">{item.commandLabel}</p>
                        <p className="text-xs text-fg-muted">{item.commandType}</p>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={simulationStateBadge(item.state)}>{item.state}</Badge>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={approvalStateBadge(item.approvalState)}>{item.approvalState}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-fg-secondary">
                        {item.blockingReason ?? "No"}
                      </td>
                      <td className="py-2 pr-4 text-fg-secondary">
                        {item.stageOrder}. {item.stageLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
                <p className="font-medium text-fg">Approval Gates</p>
                {simulation.approvals.length === 0 ? (
                  <p className="mt-1">No approval gates required.</p>
                ) : (
                  simulation.approvals.map((approval) => (
                    <p key={approval.id} className="mt-1">
                      {approval.gate.label} · {approval.state}
                    </p>
                  ))
                )}
              </div>
              <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
                <p className="font-medium text-fg">Execution Timeline</p>
                {simulation.timeline.map((stage) => (
                  <p key={stage.order} className="mt-1">
                    {stage.order}. {stage.label} · {stage.completedCount}/{stage.commandIds.length} complete · {stage.progress}%
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Approval Resolution Panel
            </p>
            <p className="mt-1 text-xs text-fg-secondary">
              Deterministic human approval resolution between simulated execution and future live execution.
            </p>
          </div>

          {approvalResolution ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label="Pending" value={approvalResolution.summary.pending} />
                <Metric label="Approved" value={approvalResolution.summary.approved} />
                <Metric label="Rejected" value={approvalResolution.summary.rejected} />
                <Metric label="Changes" value={approvalResolution.summary.changesRequested} />
              </div>

              <div className="rounded-md border bg-surface-sunken p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={approvalStatusBadge(
                    approvalResolution.summary.rejected > 0
                      ? "rejected"
                      : approvalResolution.summary.pending > 0
                        ? "pending"
                        : approvalResolution.summary.changesRequested > 0
                          ? "changes-requested"
                          : "approved"
                  )}>
                    {approvalResolution.summary.readiness}
                  </Badge>
                  <Badge variant="neutral">{approvalResolution.summary.blockedCommands} blocked commands</Badge>
                  <Badge variant="neutral">{approvalResolution.summary.readyCommands} ready commands</Badge>
                </div>
                <p className="mt-2 text-xs text-fg-secondary">
                  {approvalResolution.report.readinessSummary}
                </p>
              </div>

              <div className="ui-table-wrap">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                    <tr>
                      <th className="pb-2 pr-4 font-medium">Approval</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 pr-4 font-medium">Risk</th>
                      <th className="pb-2 pr-4 font-medium">Blocked</th>
                      <th className="pb-2 pr-4 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalResolution.decisions.map((decision) => (
                      <tr key={decision.id} className="border-t border-border/70 align-top">
                        <td className="py-2 pr-4">
                          <p className="font-medium text-fg">{decision.commandLabel}</p>
                          <p className="text-xs text-fg-muted">{decision.commandType}</p>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={approvalStatusBadge(decision.status)}>{decision.status}</Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={approvalRiskBadge(decision.risk)}>{decision.risk}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-fg-secondary">
                          {decision.blockedCommands.length === 0 ? "No" : decision.blockedCommands.length}
                        </td>
                        <td className="py-2 pr-4 text-fg-secondary">{decision.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-muted">
              Approval resolution is not currently available for the selected agent.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Execution Readiness Panel
            </p>
            <p className="mt-1 text-xs text-fg-secondary">
              Final deterministic gate before future live dispatch. Read-only, synchronous, and offline.
            </p>
          </div>

          {readiness ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label="Score" value={`${readiness.summary.score}/100`} />
                <Metric label="Blockers" value={readiness.summary.blockers} />
                <Metric label="Warnings" value={readiness.summary.warnings} />
                <Metric label="Ready Cmds" value={`${readiness.summary.commandReadiness}%`} />
              </div>

              <div className="rounded-md border bg-surface-sunken p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={executionReadinessBadge(readiness.summary.status)}>
                    {readiness.summary.status}
                  </Badge>
                  <Badge variant="neutral">
                    approval {readiness.summary.approvalReadiness}%
                  </Badge>
                  <Badge variant="neutral">
                    dependency {readiness.summary.dependencyReadiness}%
                  </Badge>
                  <Badge variant="neutral">{readiness.report.estimatedDispatchReadiness}</Badge>
                </div>
              </div>

              <div className="ui-table-wrap">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-fg-secondary">
                    <tr>
                      <th className="pb-2 pr-4 font-medium">Check</th>
                      <th className="pb-2 pr-4 font-medium">Category</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 pr-4 font-medium">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readiness.checks.map((check) => (
                      <tr key={check.id} className="border-t border-border/70 align-top">
                        <td className="py-2 pr-4 font-medium text-fg">{check.label}</td>
                        <td className="py-2 pr-4 text-fg-secondary">{check.category}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={check.passed ? "success" : "warning"}>
                            {check.passed ? "passed" : "blocked"}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 text-fg-secondary">{check.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
                  <p className="font-medium text-fg">Blockers</p>
                  {readiness.report.blockingIssues.length === 0 ? (
                    <p className="mt-1">No blocking issues. Plan is ready for the future dispatch layer.</p>
                  ) : (
                    readiness.report.blockingIssues.map((item) => (
                      <p key={item} className="mt-1">
                        {item}
                      </p>
                    ))
                  )}
                </div>
                <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
                  <p className="font-medium text-fg">Warnings & Recommendations</p>
                  {(readiness.report.warnings.length === 0 &&
                    readiness.report.recommendations.length === 0) ? (
                    <p className="mt-1">No additional warnings.</p>
                  ) : (
                    <>
                      {readiness.report.warnings.map((item) => (
                        <p key={item} className="mt-1">
                          Warning: {item}
                        </p>
                      ))}
                      {readiness.report.recommendations.map((item) => (
                        <p key={item} className="mt-1">
                          Recommendation: {item}
                        </p>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-muted">
              Execution readiness is not currently available for the selected agent.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
