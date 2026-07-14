import type { AgentEmployeeRuntimeModel } from "./types";
import { AgentRuntimeEngine } from "./agent-runtime-engine";

export const AgentRegistry = {
  listAgents(): AgentEmployeeRuntimeModel[] {
    return AgentRuntimeEngine.listAgents();
  },

  getAgent(id: string): AgentEmployeeRuntimeModel | undefined {
    return AgentRuntimeEngine.getAgent(id);
  },
};
