import type { ExecutionPlan } from "@/features/task-planning";
import { mapExecutionPlanToCommands } from "./command-mapper";
import { buildCommandPlan } from "./command-plan";
import { validateCommandPlan } from "./command-validator";
import { resolveCommandDependencies } from "./dependency-resolver";
import { buildExecutionPreview } from "./execution-preview";
import { buildExecutionBridgeReport } from "./execution-report";
import type { CommandPlan, ExecutionBridgeReport, ExecutionPreview } from "./types";

export interface ExecutionBridgeResult {
  commandPlan: CommandPlan;
  preview: ExecutionPreview;
  report: ExecutionBridgeReport;
}

export function buildCommandPlanFromExecutionPlan(plan: ExecutionPlan): CommandPlan {
  const commandCandidates = mapExecutionPlanToCommands(plan);
  const resolved = resolveCommandDependencies(plan, commandCandidates);
  const validation = validateCommandPlan(
    resolved.candidates,
    resolved.dependencyGraph,
    plan.approvals
  );

  return buildCommandPlan({
    plan,
    commandCandidates: resolved.candidates,
    dependencyGraph: resolved.dependencyGraph,
    executionOrder: resolved.executionOrder,
    estimatedDuration: resolved.estimatedDuration,
    estimatedDurationLabel: resolved.estimatedDurationLabel,
    validation,
  });
}

export function buildExecutionBridge(plan: ExecutionPlan): ExecutionBridgeResult {
  const startedAt = Date.now();
  const commandPlan = buildCommandPlanFromExecutionPlan(plan);
  const preview = buildExecutionPreview(commandPlan);
  const report = buildExecutionBridgeReport(commandPlan, Date.now() - startedAt);

  return { commandPlan, preview, report };
}

