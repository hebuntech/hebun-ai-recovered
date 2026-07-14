import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import type { AgentEmployeeRuntimeModel } from "./types";

export const AgentRuntimeEngine = {
  listAgents(): AgentEmployeeRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<AgentEmployeeRuntimeModel[]>(
      "agent-runtime",
    ).data;
  },

  getAgent(id: string): AgentEmployeeRuntimeModel | undefined {
    return AgentRuntimeEngine.listAgents().find((candidate) => candidate.identity.id === id);
  },
};
