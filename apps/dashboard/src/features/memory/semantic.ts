import {
  buildMemoryRecord,
  deriveTimestamp,
  firstActiveRecord,
  importanceFromHealth,
  nodeForRecord,
  statusFromHealth,
} from "@/features/memory/memory-builder";
import type { MemoryRecord } from "@/features/memory/types";

const policy = firstActiveRecord("policies");
const governance = firstActiveRecord("governance");
const entity = firstActiveRecord("entities");

const policyNodeId = nodeForRecord("policies", policy.id)?.id ?? "";
const governanceNodeId = nodeForRecord("governance", governance.id)?.id ?? "";
const entityNodeId = nodeForRecord("entities", entity.id)?.id ?? "";

export const semanticMemories: MemoryRecord[] = [
  buildMemoryRecord({
    id: "mem-se-1",
    category: "semantic",
    title: "Executive approval thresholds remain a long-lived control rule",
    summary:
      "The organization preserves approval threshold knowledge as reusable semantic memory for future controls.",
    whatHappened:
      `${policy.name} was retained as a stable organizational rule rather than a transient event.`,
    whyItHappened:
      "Approval policies are long-lived knowledge assets that should outlast any single workflow run.",
    whoWasInvolved: [policy.owner, "Governance Core", "Director"],
    whatChanged: policy.change,
    reusableLater:
      "Reuse this memory whenever new workflows need executive approval boundaries.",
    owner: policy.owner,
    timestamp: deriveTimestamp(policy, "2026-05", 8),
    registryIds: ["policies", "governance"],
    graphNodeIds: [policyNodeId].filter(Boolean),
    involvedEntities: ["Sales", "Director"],
    status: statusFromHealth(policy.health),
    importance: importanceFromHealth(policy.health),
    tags: ["policy", "definition", "business-rule"],
  }),
  buildMemoryRecord({
    id: "mem-se-2",
    category: "semantic",
    title: "Approval lineage is now part of company terminology",
    summary:
      "Governance lineage terminology is preserved as semantic memory so future systems understand control provenance consistently.",
    whatHappened: `${governance.name} established a durable control concept across the company model.`,
    whyItHappened:
      "The organization needs a consistent term for how approvals, evidence, and control history connect.",
    whoWasInvolved: [governance.owner, "Audit", "Director"],
    whatChanged: governance.change,
    reusableLater:
      "Reuse this memory when designing future audit, approval, and reasoning vocabulary.",
    owner: governance.owner,
    timestamp: deriveTimestamp(governance, "2026-05", 12),
    registryIds: ["governance", "events", "executions"],
    graphNodeIds: [governanceNodeId].filter(Boolean),
    involvedEntities: ["Audit"],
    status: statusFromHealth(governance.health),
    importance: importanceFromHealth(governance.health),
    tags: ["terminology", "governance", "lineage"],
  }),
  buildMemoryRecord({
    id: "mem-se-3",
    category: "semantic",
    title: "Entity context remains a durable business reference",
    summary:
      "Business entity knowledge is preserved as semantic memory to anchor downstream goals, risk, and finance interpretations.",
    whatHappened: `${entity.name} retained cross-functional business context for multiple operating teams.`,
    whyItHappened:
      "Shared entity definitions reduce ambiguity across sales, finance, legal, and governance views.",
    whoWasInvolved: [entity.owner, "Finance", "Legal", "Sales"],
    whatChanged: entity.change,
    reusableLater:
      "Reuse this memory as a long-term reference whenever workflows or decisions need business object grounding.",
    owner: entity.owner,
    timestamp: deriveTimestamp(entity, "2026-05", 19),
    registryIds: ["entities", "goals", "risk"],
    graphNodeIds: [entityNodeId].filter(Boolean),
    involvedEntities: ["Globex"],
    status: statusFromHealth(entity.health),
    importance: importanceFromHealth(entity.health),
    tags: ["entity", "definition", "shared-knowledge"],
  }),
];
