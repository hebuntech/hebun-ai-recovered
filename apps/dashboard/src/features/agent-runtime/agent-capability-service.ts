import type {
  AgentCapabilityProfile,
  AgentProjectionSourceRecord,
  WorkflowProjectionSourceRecord,
} from "./types";

export const AgentCapabilityService = {
  buildCapabilityProfile(
    agent: AgentProjectionSourceRecord,
    workflows: WorkflowProjectionSourceRecord[],
  ): AgentCapabilityProfile {
    const domains = [...new Set([agent.department, ...workflows.map((workflow) => workflow.category)])];

    return {
      capabilities: [...agent.capabilities],
      tools: [...agent.tools],
      permissions: [...agent.permissions],
      domains,
      summary: `${agent.capabilities.length} capabilities · ${agent.tools.length} tools · ${workflows.length} related workflows`,
    };
  },
};
