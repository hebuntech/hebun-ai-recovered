import { getAgentContext } from "@/features/agent-context";
import type { AgentContextSummary, AgentProjectionSourceRecord } from "./types";

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

    return {
      package: pkg,
      report: pkg.report,
      topMemoryTitle: pkg.context.summary.topMemoryTitle,
      summary: `${pkg.report.retrievedMemories} memories · ${pkg.report.knowledgeNodes} knowledge nodes · context health ${pkg.report.contextHealth}`,
    };
  },
};
