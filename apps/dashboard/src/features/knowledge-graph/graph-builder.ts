import { registryDefinitions } from "@/features/registries/definitions";
import { registryRecords } from "@/features/registries/records";
import { registryRelationships } from "@/features/registries/relationships";
import type { RegistryKey, RegistryRecord, RegistryRecordStatus } from "@/features/registries/types";
import type {
  KnowledgeGraphNode,
  KnowledgeGraphRelationship,
  KnowledgeGraphRelationshipType,
} from "@/features/knowledge-graph/types";

const registryAliasMap: Record<string, RegistryKey> = {
  agents: "agents",
  "agent registry": "agents",
  capabilities: "capabilities",
  "capability registry": "capabilities",
  entities: "entities",
  "entity registry": "entities",
  "business entity registry": "entities",
  events: "events",
  "event registry": "events",
  executions: "executions",
  execution: "executions",
  "execution registry": "executions",
  experience: "experience",
  "experience registry": "experience",
  goals: "goals",
  goal: "goals",
  "goal registry": "goals",
  governance: "governance",
  "governance registry": "governance",
  learning: "learning",
  "learning registry": "learning",
  models: "models",
  model: "models",
  "model registry": "models",
  plans: "plans",
  plan: "plans",
  "plan registry": "plans",
  policies: "policies",
  "policy registry": "policies",
  risks: "risk",
  risk: "risk",
  "risk registry": "risk",
  tools: "tools",
  tool: "tools",
  "tool registry": "tools",
  workflows: "workflows",
  workflow: "workflows",
  "workflow registry": "workflows",
};

const registryDescriptions = Object.fromEntries(
  registryDefinitions.map((registry) => [registry.id, registry.description])
) as Record<RegistryKey, string>;

const createdMonthByRegistry: Record<RegistryKey, string> = {
  agents: "2026-01",
  goals: "2026-01",
  plans: "2026-02",
  executions: "2026-03",
  experience: "2026-03",
  learning: "2026-04",
  tools: "2026-01",
  models: "2026-01",
  capabilities: "2026-02",
  events: "2026-03",
  workflows: "2026-02",
  entities: "2026-01",
  governance: "2026-04",
  risk: "2026-04",
  policies: "2026-04",
};

const relationshipBlueprints: Array<{
  source: RegistryKey;
  target: RegistryKey;
  relationshipType: KnowledgeGraphRelationshipType;
  strength: number;
  confidence: number;
  note: string;
}> = [
  {
    source: "agents",
    target: "workflows",
    relationshipType: "executes",
    strength: 89,
    confidence: 95,
    note: "Agents are assigned to orchestrated business workflows.",
  },
  {
    source: "workflows",
    target: "goals",
    relationshipType: "fulfills",
    strength: 88,
    confidence: 94,
    note: "Workflows exist to fulfill strategic goals.",
  },
  {
    source: "goals",
    target: "entities",
    relationshipType: "belongs_to",
    strength: 82,
    confidence: 92,
    note: "Goals are scoped to business entities and operating domains.",
  },
  {
    source: "executions",
    target: "plans",
    relationshipType: "generated_from",
    strength: 91,
    confidence: 96,
    note: "Execution runs are generated from planning artifacts.",
  },
  {
    source: "learning",
    target: "capabilities",
    relationshipType: "improves",
    strength: 84,
    confidence: 93,
    note: "Learning updates improve the capability surface.",
  },
  {
    source: "capabilities",
    target: "tools",
    relationshipType: "uses",
    strength: 80,
    confidence: 94,
    note: "Capabilities rely on approved tools to operate.",
  },
  {
    source: "tools",
    target: "models",
    relationshipType: "runs",
    strength: 85,
    confidence: 96,
    note: "Tools invoke models through the model routing layer.",
  },
  {
    source: "experience",
    target: "learning",
    relationshipType: "creates",
    strength: 86,
    confidence: 94,
    note: "Experience artifacts are converted into learning assets.",
  },
  {
    source: "risk",
    target: "goals",
    relationshipType: "affects",
    strength: 79,
    confidence: 91,
    note: "Risks directly affect goal execution and outcomes.",
  },
  {
    source: "governance",
    target: "workflows",
    relationshipType: "controls",
    strength: 87,
    confidence: 95,
    note: "Governance records control workflow behavior and approvals.",
  },
];

function normalizeRegistryLabel(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function resolveRegistryType(value?: string): RegistryKey | undefined {
  return registryAliasMap[normalizeRegistryLabel(value)];
}

function isoDate(month: string, day: number) {
  return `${month}-${String(day).padStart(2, "0")}T09:00:00.000Z`;
}

function updatedDateForStatus(
  createdAt: string,
  status: RegistryRecordStatus,
  index: number
) {
  const createdDay = Number(createdAt.slice(8, 10));
  const updatedDay =
    status === "active"
      ? Math.min(createdDay + 8 + index, 28)
      : status === "archived"
        ? Math.min(createdDay + 11 + index, 28)
        : Math.min(createdDay + 14 + index, 28);

  return `${createdAt.slice(0, 8)}${String(updatedDay).padStart(2, "0")}T16:00:00.000Z`;
}

function anchorNodeId(registryType: RegistryKey) {
  const activeRecord =
    registryRecords[registryType].find((record) => record.status === "active") ??
    registryRecords[registryType][0];

  return activeRecord ? `${registryType}:${activeRecord.id}` : undefined;
}

function nodeDescription(
  registryType: RegistryKey,
  record: RegistryRecord
) {
  return `${record.name}. ${registryDescriptions[registryType]}`;
}

export function buildKnowledgeGraphNodes(): KnowledgeGraphNode[] {
  return Object.entries(registryRecords).flatMap(([registryType, records]) =>
    records.map((record, index) => {
      const createdAt = isoDate(
        createdMonthByRegistry[registryType as RegistryKey],
        3 + index * 4
      );

      return {
        id: `${registryType}:${record.id}`,
        registryType: registryType as RegistryKey,
        title: record.name,
        description: nodeDescription(registryType as RegistryKey, record),
        status: record.status,
        createdAt,
        updatedAt: updatedDateForStatus(createdAt, record.status, index),
        metadata: {
          owner: record.owner,
          dependency: record.dependency,
          consumers: record.consumers,
          health: record.health,
          change: record.change,
          sourceRecordId: record.id,
          updatedLabel: record.updated,
        },
      };
    })
  );
}

function pushEdge(
  edges: KnowledgeGraphRelationship[],
  seen: Set<string>,
  edge: KnowledgeGraphRelationship
) {
  const key = `${edge.sourceId}:${edge.targetId}:${edge.relationshipType}`;
  if (seen.has(key)) return;
  seen.add(key);
  edges.push(edge);
}

export function buildKnowledgeGraphEdges(
  nodes: KnowledgeGraphNode[]
): KnowledgeGraphRelationship[] {
  const nodesByRegistry = nodes.reduce<Record<RegistryKey, KnowledgeGraphNode[]>>(
    (acc, node) => {
      acc[node.registryType] ??= [];
      acc[node.registryType].push(node);
      return acc;
    },
    {} as Record<RegistryKey, KnowledgeGraphNode[]>
  );

  const edges: KnowledgeGraphRelationship[] = [];
  const seen = new Set<string>();

  relationshipBlueprints.forEach((blueprint) => {
    const sourceNodes = nodesByRegistry[blueprint.source]?.filter(
      (node) => node.status === "active"
    );
    const targetNodes = nodesByRegistry[blueprint.target]?.filter(
      (node) => node.status === "active"
    );

    if (!sourceNodes?.length || !targetNodes?.length) return;

    sourceNodes.forEach((sourceNode, index) => {
      const targetNode = targetNodes[index % targetNodes.length];
      pushEdge(edges, seen, {
        id: `edge-${blueprint.relationshipType}-${sourceNode.id}-${targetNode.id}`,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        relationshipType: blueprint.relationshipType,
        strength: blueprint.strength,
        confidence: blueprint.confidence,
        metadata: {
          sourceRegistry: blueprint.source,
          targetRegistry: blueprint.target,
          derivation: "blueprint",
          note: blueprint.note,
        },
      });
    });
  });

  nodes.forEach((node, index) => {
    const dependencyRegistry = resolveRegistryType(node.metadata.dependency);
    const dependencyTargetId = dependencyRegistry
      ? anchorNodeId(dependencyRegistry)
      : undefined;

    if (dependencyRegistry && dependencyTargetId && dependencyTargetId !== node.id) {
      pushEdge(edges, seen, {
        id: `edge-dep-${node.id}-${dependencyTargetId}`,
        sourceId: node.id,
        targetId: dependencyTargetId,
        relationshipType: "depends_on",
        strength: Math.max(60, Math.min(95, node.metadata.health - 4)),
        confidence: Math.max(72, Math.min(98, node.metadata.health + 1)),
        metadata: {
          sourceRegistry: node.registryType,
          targetRegistry: dependencyRegistry,
          derivation: "dependency",
          note: `${node.title} depends on ${node.metadata.dependency}.`,
        },
      });
    }

    const registryLevelFeeds = registryRelationships.filter(
      (relationship) => relationship.from === node.registryType
    );

    registryLevelFeeds.forEach((relationship, relationshipIndex) => {
      const candidates = nodesByRegistry[relationship.to]?.filter(
        (candidate) => candidate.status === "active"
      );
      const targetNode = candidates?.[(index + relationshipIndex) % (candidates.length || 1)];
      if (!targetNode || targetNode.id === node.id) return;

      pushEdge(edges, seen, {
        id: `edge-feed-${node.id}-${targetNode.id}`,
        sourceId: node.id,
        targetId: targetNode.id,
        relationshipType: "feeds",
        strength: 74,
        confidence: 88,
        metadata: {
          sourceRegistry: relationship.from,
          targetRegistry: relationship.to,
          derivation: "dependency",
          note: `${node.registryType} records feed ${relationship.to} insights and workflows.`,
        },
      });
    });
  });

  return edges;
}
