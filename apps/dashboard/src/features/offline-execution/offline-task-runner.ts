/*
 * offline-task-runner.ts — runs ONE plan task through the full offline chain:
 * execution request → routing → invocation → runtime boundary → simulated
 * result. The runner never executes real code, calls a provider or API, mutates
 * a file, or runs a shell command. It only composes the existing deterministic
 * engines and preserves traceability plan → task → provider → invocation →
 * runtime → result.
 */

import { route } from "@/features/provider-routing";
import type { RoutingExecutionRequest, RoutingStrategy } from "@/features/provider-routing";
import { buildInvocation } from "@/features/provider-invocation";
import { evaluate } from "@/features/runtime-boundary";
import type { PlanTask } from "@/features/planning";
import { capabilityForTask } from "@/features/offline-execution/offline-execution-context";
import { simulateResult } from "@/features/offline-execution/offline-provider-result";
import type { OfflineTaskRun, TaskTelemetry } from "@/features/offline-execution/types";

function strategyForTask(task: PlanTask): RoutingStrategy {
  if (task.type === "governance") return "Approval First";
  if (task.type === "validation") return "Best Capability";
  if (task.type === "design") return "Best Capability";
  return "Highest Confidence";
}

export function runTask(task: PlanTask): OfflineTaskRun {
  const capability = capabilityForTask(task);
  const requiresApproval = task.type === "governance";

  const request: RoutingExecutionRequest = {
    id: task.id,
    requestId: `oreq-${task.id}`,
    description: task.title,
    requiredCapabilities: [capability],
    executionMode: "Simulation",
    constraints: ["offline-only", "no-network"],
    policyTags: [task.priority],
    requiresApproval,
    strategy: strategyForTask(task),
  };

  const routing = route(request);
  const invocation = buildInvocation(routing);
  const runtime = evaluate(invocation);

  // Simulation is always enforced: nothing crosses into live runtime.
  const simulationEnforced = !runtime.allowed || runtime.runtimeMode !== "Future Live";

  const telemetry: TaskTelemetry = {
    routed: Boolean(routing.primaryProvider) || routing.candidateProviders.length > 0,
    invoked: invocation.status === "Ready",
    runtimeEvaluated: true,
    simulationEnforced,
    gatesPassed: runtime.telemetry.gatesPassed,
    gatesEvaluated: runtime.telemetry.gatesEvaluated,
  };

  const result = simulateResult(task, invocation, runtime, telemetry);

  // Traceability: every hop shares the task id lineage.
  const traceable =
    routing.requestId === request.requestId &&
    invocation.requestId === request.requestId &&
    runtime.requestId === request.requestId &&
    result.taskId === task.id;

  return {
    taskId: task.id,
    taskTitle: task.title,
    taskType: task.type,
    capability,
    request,
    routing,
    invocation,
    runtime,
    result,
    traceable,
    simulationEnforced,
    runtimeMode: runtime.runtimeMode,
    confidence: runtime.confidence,
  };
}
