import type { OrchestrationBlueprint } from "@/features/orchestration";
import type { ExecutionReadiness } from "@/features/execution/types";

export function validateExecutionReadiness(
  blueprint: OrchestrationBlueprint
): ExecutionReadiness {
  const blockers = [
    ...blueprint.validationResult.issues,
    ...blueprint.approvalGates
      .filter((gate) => gate.status === "required")
      .map((gate) => `Approval required: ${gate.summary}`),
  ];
  const warnings = [
    ...blueprint.riskAssessment
      .filter((risk) => risk.level === "high" || risk.level === "critical")
      .map((risk) => risk.title),
    ...blueprint.fallbackStrategy
      .filter((fallback) => fallback.fallbackAgents.length === 0)
      .map((fallback) => `Fallback gap for ${fallback.taskId}`),
  ];
  const ready = blockers.length === 0;

  return {
    ready,
    blockers,
    warnings,
    summary: ready
      ? "The orchestration blueprint is execution-ready for a provider-independent runtime."
      : "The orchestration blueprint remains useful, but approvals or structural gaps still block safe execution startup.",
  };
}
