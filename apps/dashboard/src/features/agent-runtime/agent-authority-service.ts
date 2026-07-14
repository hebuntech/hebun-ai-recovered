import type { RoleRuntimeModel } from "@/features/organization-runtime/types";
import type { AgentAuthorityProfile, AgentProjectionSourceRecord } from "./types";

function approvalMode(agent: AgentProjectionSourceRecord, rank: number): AgentAuthorityProfile["approvalMode"] {
  if (rank >= 85) return "manager";
  if (agent.permissions.includes("workflow.execute")) return "human-review";
  if (rank >= 100) return "director";
  return "none";
}

export const AgentAuthorityService = {
  buildAuthorityProfile(
    agent: AgentProjectionSourceRecord,
    role: RoleRuntimeModel | undefined,
  ): AgentAuthorityProfile {
    const rank = role?.authorityRank ?? 50;
    const mode = approvalMode(agent, rank);

    return {
      roleLabel: agent.role,
      authorityRank: rank,
      permissions: [...agent.permissions],
      approvalMode: mode,
      summary: `${agent.role} · authority rank ${rank} · ${agent.permissions.length} permissions`,
    };
  },
};
