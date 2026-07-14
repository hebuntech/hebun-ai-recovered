/*
 * Knowledge CRUD — node persistence adapter binding.
 *
 * Seeds the knowledge-nodes collection from the existing derived knowledge graph
 * (no duplicate model). Reactivity + storage come straight from the adapter.
 */

import { getAdapter } from "@/features/persistence";
import { knowledgeGraphNodes } from "@/features/knowledge-graph/nodes";
import type { RegistryKey, RegistryRecordStatus } from "@/features/registries/types";
import type {
  KnowledgeImportance,
  KnowledgeNodeRecord,
  KnowledgeNodeStatus,
  KnowledgeNodeType,
} from "./types";

const SEED_AT = "2026-01-01T00:00:00.000Z";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const nodeTypeByRegistry: Record<RegistryKey, KnowledgeNodeType> = {
  agents: "Agent",
  goals: "Goal",
  plans: "Plan",
  executions: "Execution",
  experience: "Experience",
  learning: "Learning",
  tools: "Tool",
  models: "Model",
  capabilities: "Capability",
  events: "Event",
  workflows: "Workflow",
  entities: "Entity",
  governance: "Governance",
  risk: "Risk",
  policies: "Policy",
};

function toStatus(status: RegistryRecordStatus): KnowledgeNodeStatus {
  if (status === "active") return "verified";
  if (status === "archived") return "review";
  return "provisional";
}

function toImportance(health: number): KnowledgeImportance {
  if (health >= 95) return "critical";
  if (health >= 85) return "high";
  if (health >= 70) return "medium";
  return "low";
}

function seed(): KnowledgeNodeRecord[] {
  return knowledgeGraphNodes.map((node) => ({
    id: node.id,
    title: node.title,
    slug: slugify(node.title),
    description: node.description,
    nodeType: nodeTypeByRegistry[node.registryType],
    ownerType: "organization",
    ownerId: slugify(node.metadata.owner) || "director",
    confidence: node.metadata.health,
    importance: toImportance(node.metadata.health),
    status: toStatus(node.status),
    version: "v1.0.0",
    source: `${node.registryType} registry`,
    tags: [node.registryType, ...node.metadata.consumers.slice(0, 2)],
    createdAt: node.createdAt || SEED_AT,
    updatedAt: node.updatedAt || SEED_AT,
    createdBy: "Seed",
    updatedBy: "Seed",
    lifecycleStatus: "active",
  }));
}

export const knowledgeNodeAdapter = getAdapter<KnowledgeNodeRecord>("knowledge-nodes", seed);

export const subscribeNodes = knowledgeNodeAdapter.subscribe;
export const getNodeSnapshot = knowledgeNodeAdapter.getSnapshot;

export function resetNodeStore(): void {
  knowledgeNodeAdapter.save(seed());
}
