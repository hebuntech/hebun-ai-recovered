import type { TaskPlanningResult } from "@/features/task-planning";
import type { ExecutionEngineResult } from "@/features/execution-engine";
import { resolveApprovalDecisions } from "./approval-resolver";
import { buildApprovalSummary, buildApprovalReport } from "./approval-report";
import { validateHumanApproval } from "./approval-validator";
import { buildApprovalHistory } from "./approval-history";
import { buildApprovalTelemetry } from "./approval-telemetry";
import type { HumanApprovalResult } from "./types";

export function buildHumanApprovalResolution(
  execution: ExecutionEngineResult,
  planning: TaskPlanningResult
): HumanApprovalResult {
  const decisions = resolveApprovalDecisions(execution.simulation, planning.decision);
  const blockedCommands = execution.simulation.queue.items.filter((item) =>
    ["blocked", "failed", "waiting-dependencies"].includes(item.state)
  ).length;
  const readyCommands =
    execution.simulation.queue.items.filter((item) => item.state === "completed").length +
    decisions.filter((item) => item.readyForExecution).length;

  const summary = buildApprovalSummary({
    decisions,
    blockedCommands,
    readyCommands,
  });

  const validation = validateHumanApproval({ decisions, summary });
  const history = buildApprovalHistory({
    inspected: decisions.length,
    pending: summary.pending,
    approved: summary.approved,
    rejected: summary.rejected,
    changesRequested: summary.changesRequested,
    blockedCommands: summary.blockedCommands,
    readyCommands: summary.readyCommands,
    valid: validation.valid,
  });
  const telemetry = buildApprovalTelemetry({
    decisions,
    blockedCommands,
    readyCommands,
    historyCount: history.length,
  });
  const report = buildApprovalReport({ decisions, summary });

  return {
    simulation: execution.simulation,
    commandPlan: execution.simulation.commandPlan,
    planning,
    decisions,
    summary,
    validation,
    history,
    telemetry,
    report,
  };
}

