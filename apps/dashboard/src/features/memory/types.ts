import type { BadgeVariant } from "@/components/ui/badge";
import type { RegistryKey } from "@/features/registries/types";

export type MemoryCategory =
  | "episodic"
  | "semantic"
  | "procedural"
  | "decision"
  | "learning"
  | "conversation";

export type MemoryImportance = "critical" | "high" | "medium" | "low";
export type MemoryStatus = "fresh" | "stable" | "review";

export interface MemoryRecord {
  id: string;
  category: MemoryCategory;
  title: string;
  summary: string;
  whatHappened: string;
  whyItHappened: string;
  whoWasInvolved: string[];
  whatChanged: string;
  reusableLater: string;
  owner: string;
  timestamp: string;
  registryIds: RegistryKey[];
  graphNodeIds: string[];
  graphRelationshipIds: string[];
  involvedEntities: string[];
  status: MemoryStatus;
  importance: MemoryImportance;
  tags: string[];
}

export interface DecisionMemoryRecord extends MemoryRecord {
  decision: string;
  context: string;
  alternativesConsidered: string[];
  selectedOption: string;
  reasoning: string;
  affectedEntities: string[];
}

export interface ConversationMemoryRecord extends MemoryRecord {
  summaryOnly: string;
  participants: string[];
  outcome: string;
}

export interface MemoryHealthSummary {
  score: number;
  badge: BadgeVariant;
  status: "healthy" | "watch" | "critical";
  summary: string;
  signals: string[];
}

export interface MemoryCategoryMetric {
  category: MemoryCategory;
  count: number;
  label: string;
}

export interface MemoryMetrics {
  totalMemories: number;
  decisionMemories: number;
  learningMemories: number;
  procedures: number;
  healthScore: number;
  timelineItems: number;
  categoryDistribution: MemoryCategoryMetric[];
  recentDecisions: DecisionMemoryRecord[];
  recentLearnings: MemoryRecord[];
  proceduralAssets: MemoryRecord[];
  conversationSummaries: ConversationMemoryRecord[];
  health: MemoryHealthSummary;
}

export interface MemoryQueryResult {
  query: string;
  results: MemoryRecord[];
}

export interface MemoryTypeDefinition {
  id: MemoryCategory;
  label: string;
  description: string;
}
