import { companyMemories } from "@/features/memory/memory";
import type {
  ConversationMemoryRecord,
  DecisionMemoryRecord,
  MemoryCategory,
  MemoryQueryResult,
  MemoryRecord,
} from "@/features/memory/types";

export function memoriesByCategory(category: MemoryCategory): MemoryRecord[] {
  return companyMemories.filter((memory) => memory.category === category);
}

export function recentDecisionMemories(limit = 3): DecisionMemoryRecord[] {
  return companyMemories
    .filter((memory): memory is DecisionMemoryRecord => memory.category === "decision")
    .slice(0, limit);
}

export function recentLearningMemories(limit = 3): MemoryRecord[] {
  return memoriesByCategory("learning").slice(0, limit);
}

export function recentProceduralMemories(limit = 3): MemoryRecord[] {
  return memoriesByCategory("procedural").slice(0, limit);
}

export function recentConversationMemories(
  limit = 3
): ConversationMemoryRecord[] {
  return companyMemories
    .filter(
      (memory): memory is ConversationMemoryRecord => memory.category === "conversation"
    )
    .slice(0, limit);
}

export function searchMemories(query: string): MemoryQueryResult {
  const normalized = query.trim().toLowerCase();
  const results = !normalized
    ? companyMemories.slice(0, 6)
    : companyMemories.filter((memory) =>
        [
          memory.title,
          memory.summary,
          memory.whatHappened,
          memory.whyItHappened,
          memory.whatChanged,
          memory.reusableLater,
          memory.tags.join(" "),
          memory.registryIds.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      );

  return { query, results: results.slice(0, 6) };
}
