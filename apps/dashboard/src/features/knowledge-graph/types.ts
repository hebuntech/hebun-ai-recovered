import type { BadgeVariant } from "@/components/ui/badge";
import type { RegistryKey, RegistryRecord, RegistryRecordStatus } from "@/features/registries/types";

export type KnowledgeGraphRegistryType = RegistryKey;

export type KnowledgeGraphRelationshipType =
  | "executes"
  | "fulfills"
  | "belongs_to"
  | "generated_from"
  | "improves"
  | "uses"
  | "runs"
  | "creates"
  | "affects"
  | "controls"
  | "depends_on"
  | "feeds";

export interface KnowledgeGraphNode {
  id: string;
  registryType: KnowledgeGraphRegistryType;
  title: string;
  description: string;
  status: RegistryRecordStatus;
  createdAt: string;
  updatedAt: string;
  metadata: {
    owner: string;
    dependency?: string;
    consumers: string[];
    health: number;
    change: string;
    sourceRecordId: string;
    updatedLabel: string;
  };
}

export interface KnowledgeGraphRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: KnowledgeGraphRelationshipType;
  strength: number;
  confidence: number;
  metadata: {
    sourceRegistry: KnowledgeGraphRegistryType;
    targetRegistry: KnowledgeGraphRegistryType;
    derivation: "blueprint" | "dependency";
    note: string;
  };
}

export interface CompanyKnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphRelationship[];
}

export interface KnowledgeGraphRegistryMetric {
  registryType: KnowledgeGraphRegistryType;
  nodeCount: number;
  relationshipCount: number;
  averageHealth: number;
}

export interface KnowledgeGraphRelationshipDistribution {
  relationshipType: KnowledgeGraphRelationshipType;
  count: number;
}

export interface KnowledgeGraphHealthSummary {
  score: number;
  status: "healthy" | "watch" | "critical";
  badge: BadgeVariant;
  summary: string;
  signals: string[];
}

export interface KnowledgeGraphMetrics {
  totalNodes: number;
  totalRelationships: number;
  connectedComponents: number;
  graphHealth: number;
  mostConnectedRegistries: KnowledgeGraphRegistryMetric[];
  relationshipDistribution: KnowledgeGraphRelationshipDistribution[];
  healthSummary: KnowledgeGraphHealthSummary;
}

export interface KnowledgeGraphQueryResult {
  registryType: KnowledgeGraphRegistryType;
  records: RegistryRecord[];
}
