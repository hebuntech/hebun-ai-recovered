import { getAgentContext } from "@/features/agent-context";
import type { AgentContextReport } from "@/features/agent-context";
import type {
  AgentContextSummary,
  AgentProjectionSourceRecord,
  AgentSemanticContextPackage,
  AgentSemanticContextReport,
} from "./types";

function toSemanticReport(report: AgentContextReport): AgentSemanticContextReport {
  const { retrievalTimeMs, ...semanticReport } = report;
  void retrievalTimeMs;
  return semanticReport;
}

function toSemanticPackage(
  pkg: NonNullable<ReturnType<typeof getAgentContext>>,
): AgentSemanticContextPackage {
  const { generatedAt, ...summary } = pkg.context.summary;
  const { retrievalTimeMs, ...statistics } = pkg.context.statistics;
  void generatedAt;
  void retrievalTimeMs;

  const report = toSemanticReport(pkg.report);
  return {
    ...pkg,
    context: {
      ...pkg.context,
      summary,
      statistics,
    },
    report,
  };
}

export const AgentContextService = {
  getContextSummary(agent: AgentProjectionSourceRecord): AgentContextSummary {
    const pkg = getAgentContext(agent.id);
    if (!pkg) {
      return {
        package: null,
        report: null,
        summary: "No context package available for this agent yet.",
      };
    }

    const semanticPackage = toSemanticPackage(pkg);
    return {
      package: semanticPackage,
      report: semanticPackage.report,
      topMemoryTitle: pkg.context.summary.topMemoryTitle,
      summary: `${pkg.report.retrievedMemories} memories · ${pkg.report.knowledgeNodes} knowledge nodes · context health ${pkg.report.contextHealth}`,
    };
  },
};
