import type { RuntimeHealth } from "@/features/organization-runtime/types";
import type { AgentEmployeeRuntimeModel } from "@/features/agent-runtime/types";
import type {
  WorkflowProjectionSourceRecord,
  WorkflowReadinessProfile,
  WorkflowRiskLevel,
} from "./types";

function deriveRisk(workflow: WorkflowProjectionSourceRecord, readiness: WorkflowReadinessProfile, assignedAgents: AgentEmployeeRuntimeModel[]): WorkflowRiskLevel {
  if (workflow.status === "failed") return "critical";
  if (readiness.status === "blocked") return "high";
  if (assignedAgents.some((agent) => agent.riskLevel === "critical" || agent.status === "error")) return "high";
  if (workflow.status === "scheduled" || readiness.status === "watch") return "medium";
  return "low";
}

export const WorkflowHealthService = {
  buildHealth(
    workflow: WorkflowProjectionSourceRecord,
    readiness: WorkflowReadinessProfile,
    assignedAgents: AgentEmployeeRuntimeModel[],
    blockingIssues: string[],
  ): { health: RuntimeHealth; risk: WorkflowRiskLevel } {
    const statusPenalty = workflow.status === "failed" ? 30 : workflow.status === "idle" ? 8 : 0;
    const blockerPenalty = Math.min(24, blockingIssues.length * 10);
    const readinessPenalty = Math.max(0, 100 - readiness.score) * 0.35;
    const agentPenalty = assignedAgents.some((agent) => agent.status === "error")
      ? 18
      : assignedAgents.some((agent) => agent.riskLevel === "high" || agent.riskLevel === "critical")
        ? 10
        : 0;
    const score = Math.max(
      25,
      Math.min(100, Math.round(workflow.successRate * 0.45 + 42 - statusPenalty - blockerPenalty - readinessPenalty - agentPenalty)),
    );
    const risk = deriveRisk(workflow, readiness, assignedAgents);

    return {
      health: {
        score,
        status: score >= 90 ? "healthy" : score >= 72 ? "watch" : "critical",
        summary: `${workflow.status} · readiness ${readiness.score}% · success ${workflow.successRate}%`,
      },
      risk,
    };
  },
};
