/*
 * Live Dispatch — the engine.
 *
 * Pure, deterministic transform of one Execution Readiness result into an
 * Agent Dispatch result. It:
 *
 *   - accepts only READY commands
 *   - rejects blocked commands
 *   - rejects failed validation
 *   - rejects rejected approvals
 *   - rejects incomplete dependencies
 *
 * Accepted commands become real internally-queued commands and advance through
 * the deterministic queue lifecycle (queued → preparing → dispatched →
 * executing → completed | failed | cancelled). Nothing leaves the app; there is
 * no wall clock, no randomness, no async. Same readiness → same result.
 */

import type { ExecutionReadinessResult } from "@/features/execution-readiness";
import type { SimulatedExecutionCommand } from "@/features/execution-engine";
import { buildDispatchQueue } from "./dispatch-queue";
import { runDispatch } from "./dispatch-runner";
import { buildDispatchHistory } from "./dispatch-history";
import { buildDispatchEvents } from "./dispatch-events";
import { buildDispatchTelemetry } from "./dispatch-telemetry";
import { buildDispatchReport } from "./dispatch-report";
import type {
  AgentDispatchResult,
  DispatchDecision,
  DispatchRejectReason,
  DispatchTraceability,
  RejectedDispatch,
} from "./types";

interface Classification {
  decision: DispatchDecision;
  reason?: DispatchRejectReason;
  detail: string;
}

/**
 * Classify a single simulated command. Checks run most-severe first so a
 * command with several problems reports the dominant one, deterministically.
 */
export function classifyCommand(
  item: SimulatedExecutionCommand,
  validationFailedIds: Set<string>,
  rejectedApprovalIds: Set<string>
): Classification {
  if (validationFailedIds.has(item.commandId)) {
    return {
      decision: "rejected",
      reason: "validation-failed",
      detail: "Command validation failed in the execution bridge.",
    };
  }
  if (rejectedApprovalIds.has(item.commandId) || item.approvalState === "rejected") {
    return {
      decision: "rejected",
      reason: "approval-rejected",
      detail: "A required approval was rejected.",
    };
  }
  if (item.state === "failed") {
    return {
      decision: "rejected",
      reason: "validation-failed",
      detail: item.failureReasons[0] ?? "Command failed pre-dispatch checks.",
    };
  }
  if (item.state === "blocked") {
    return {
      decision: "rejected",
      reason: "blocked",
      detail: item.blockingReason ?? "Command is blocked.",
    };
  }
  if (item.state === "waiting-dependencies") {
    return {
      decision: "rejected",
      reason: "dependencies-incomplete",
      detail: "Upstream dependencies are not complete.",
    };
  }
  if (item.state === "waiting-approval" || item.approvalState === "waiting-approval" || item.approvalState === "pending") {
    return {
      decision: "rejected",
      reason: "approval-pending",
      detail: "Command is still waiting on an approval gate.",
    };
  }
  if (item.state === "ready" || item.state === "running" || item.state === "completed") {
    return { decision: "accepted", detail: "Command is ready for live dispatch." };
  }
  return {
    decision: "rejected",
    reason: "not-ready",
    detail: `Command is not ready (state: ${item.state}).`,
  };
}

function traceOf(item: SimulatedExecutionCommand, agentId: string): DispatchTraceability {
  const t = item.traceability;
  return {
    agentId,
    commandId: item.commandId,
    commandType: item.commandType,
    taskId: t.taskId,
    taskTitle: t.taskTitle,
    decision: t.decision,
    reasoning: t.reasoning,
    context: t.context,
    memory: t.memory,
    knowledge: t.knowledge,
  };
}

/** Transform one readiness result into a deterministic dispatch result. */
export function buildAgentDispatch(
  readiness: ExecutionReadinessResult
): AgentDispatchResult {
  const { approval, summary } = readiness;
  const agent = approval.planning.agent;
  const agentId = agent.id;
  const agentName = agent.name;

  // Queue items are already in deterministic execution order (stage order).
  const items = approval.simulation.queue.items;

  const validationFailedIds = new Set(
    approval.commandPlan.validation.issues
      .map((issue) => issue.commandId)
      .filter((id): id is string => Boolean(id))
  );
  const rejectedApprovalIds = new Set(
    approval.decisions.filter((d) => d.status === "rejected").map((d) => d.commandId)
  );

  const acceptedItems: SimulatedExecutionCommand[] = [];
  const rejected: RejectedDispatch[] = [];

  for (const item of items) {
    const verdict = classifyCommand(item, validationFailedIds, rejectedApprovalIds);
    if (verdict.decision === "accepted") {
      acceptedItems.push(item);
    } else {
      rejected.push({
        commandId: item.commandId,
        commandType: item.commandType,
        commandLabel: item.commandLabel,
        title: item.title,
        agentId,
        agentName,
        priority: item.priority,
        reason: verdict.reason ?? "not-ready",
        detail: verdict.detail,
        traceability: traceOf(item, agentId),
      });
    }
  }

  const readinessStatus = summary.status;
  const admitted = acceptedItems.length > 0;
  const admissionReason = admitted
    ? `${acceptedItems.length} ready command(s) admitted to the live queue`
    : readinessStatus === "ready"
      ? "No individually ready commands to dispatch"
      : "Plan is not execution-ready; no commands admitted";

  // Build the ordered queue and advance it through the deterministic lifecycle.
  const { queue, events, endTick } = runDispatch(
    buildDispatchQueue(acceptedItems, agentId, agentName, traceOf)
  );

  const rejectedEvents = buildDispatchEvents(rejected, endTick);
  const allEvents = [...events, ...rejectedEvents];
  const telemetry = buildDispatchTelemetry(queue, rejected, endTick);
  const history = buildDispatchHistory(queue, admitted, admissionReason);
  const report = buildDispatchReport({
    agentId,
    agentName,
    readinessStatus,
    admitted,
    admissionReason,
    queue,
    rejected,
    telemetry,
  });

  return {
    agentId,
    agentName,
    readinessStatus,
    admitted,
    admissionReason,
    queue,
    rejected,
    progress: report.progress,
    telemetry,
    history,
    events: allEvents,
    report: report.report,
  };
}
