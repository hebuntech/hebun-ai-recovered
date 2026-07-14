import { getOrganizationRuntimeSnapshot } from "./foundation";
import type { AgentRuntimeModel } from "./types";

export const AgentRuntimeService = {
  listAgents(): AgentRuntimeModel[] {
    return getOrganizationRuntimeSnapshot().agents;
  },

  getAgent(id: string): AgentRuntimeModel | undefined {
    return getOrganizationRuntimeSnapshot().agents.find(
      (agent) => agent.identity.id === id,
    );
  },
};
