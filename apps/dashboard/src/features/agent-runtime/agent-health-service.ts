import type { RuntimeHealth } from "@/features/organization-runtime/types";
import type {
  AgentContextSummary,
  AgentExecutionReadinessProfile,
  AgentProjectionSourceRecord,
  AgentRiskLevel,
  AgentWorkloadProfile,
} from "./types";

function riskFromAgent(
  agent: AgentProjectionSourceRecord,
  readiness: AgentExecutionReadinessProfile,
  workload: AgentWorkloadProfile,
): AgentRiskLevel {
  if (agent.status === "error") return "critical";
  if (readiness.status === "not-ready" && readiness.blockers >= 3) return "high";
  if (workload.state === "overloaded") return "high";
  if (agent.status === "paused" || readiness.status === "unavailable") return "medium";
  return "low";
}

export const AgentHealthService = {
  buildHealth(
    agent: AgentProjectionSourceRecord,
    context: AgentContextSummary,
    workload: AgentWorkloadProfile,
    readiness: AgentExecutionReadinessProfile,
  ): { health: RuntimeHealth; riskLevel: AgentRiskLevel } {
    const contextScore = context.report?.contextHealth ?? 55;
    const readinessScore = readiness.score;
    const workloadPenalty =
      workload.state === "overloaded"
        ? 18
        : workload.state === "loaded"
          ? 8
          : 0;
    const statusPenalty =
      agent.status === "error" ? 28 : agent.status === "paused" ? 14 : agent.status === "idle" ? 6 : 0;
    const score = Math.max(
      25,
      Math.min(100, Math.round(contextScore * 0.25 + readinessScore * 0.35 + 42 - workloadPenalty - statusPenalty)),
    );
    const riskLevel = riskFromAgent(agent, readiness, workload);

    return {
      health: {
        score,
        status: score >= 90 ? "healthy" : score >= 75 ? "watch" : "critical",
        summary: `${agent.status} · context ${Math.round(contextScore)} · readiness ${Math.round(readinessScore)}`,
      },
      riskLevel,
    };
  },
};
