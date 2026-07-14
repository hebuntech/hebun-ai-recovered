/*
 * Agent CRUD — persistence adapter binding.
 */

import { getAdapter } from "@/features/persistence";
import { providerById } from "@/features/provider-framework/provider-registry";
import { agents as seededAgents } from "@/features/agents/mock";
import type { AgentCrudRecord } from "./types";

const SEED_AT = "2026-01-01T00:00:00.000Z";
const DEFAULT_PROVIDER = providerById("reference-simulation-provider")?.metadata.id ?? "reference-simulation-provider";

const departmentTools: Record<string, string[]> = {
  Finance: ["ledger", "approvals", "reports"],
  HR: ["recruiting", "scheduling", "policies"],
  Legal: ["contracts", "governance", "policies"],
  Marketing: ["search", "content", "analytics"],
  Operations: ["tickets", "routing", "knowledge"],
  Research: ["analysis", "search", "summaries"],
  Sales: ["crm", "playbooks", "renewals"],
};

const departmentModels: Record<string, string> = {
  Finance: "gpt-5.4-mini",
  HR: "gpt-5.4",
  Legal: "gpt-5.5",
  Marketing: "gpt-5.4-mini",
  Operations: "gpt-5.4",
  Research: "gpt-5.5",
  Sales: "gpt-5.4",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function seed(): AgentCrudRecord[] {
  return seededAgents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    slug: slugify(agent.name),
    description: `${agent.role} agent for ${agent.department}.`,
    department: agent.department,
    category: agent.role,
    owner: agent.department,
    status: agent.status,
    version: agent.version,
    capabilities: [agent.role, `${agent.department} execution`],
    provider: DEFAULT_PROVIDER,
    model: departmentModels[agent.department] ?? "gpt-5.4",
    tools: departmentTools[agent.department] ?? ["terminal", "search"],
    permissions: ["agent.read", "workflow.execute", "registry.read"],
    runtime: "simulation",
    memory: `${agent.department} working memory`,
    knowledge: `${agent.department} playbooks and procedures`,
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
    createdBy: "Seed",
    updatedBy: "Seed",
    lifecycleStatus: "active",
    role: agent.role,
    tasksToday: agent.tasksToday,
    costToday: agent.costToday,
    lastActive: agent.lastActive,
  }));
}

export const agentAdapter = getAdapter<AgentCrudRecord>("agents", seed);

export const subscribe = agentAdapter.subscribe;
export const getSnapshot = agentAdapter.getSnapshot;

export async function resetStore(): Promise<void> {
  await agentAdapter.save(seed());
}
