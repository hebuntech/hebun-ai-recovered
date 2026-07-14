import { conversationMemories } from "@/features/memory/conversation";
import { decisionMemories } from "@/features/memory/decision";
import { episodicMemories } from "@/features/memory/episodic";
import { learningMemories } from "@/features/memory/learning";
import { proceduralMemories } from "@/features/memory/procedural";
import { semanticMemories } from "@/features/memory/semantic";
import type { MemoryRecord, MemoryTypeDefinition } from "@/features/memory/types";

export const memoryTypeDefinitions: MemoryTypeDefinition[] = [
  {
    id: "episodic",
    label: "Episodic Memory",
    description: "Important business events and what happened in context.",
  },
  {
    id: "semantic",
    label: "Semantic Memory",
    description: "Long-term organizational knowledge, rules, and terminology.",
  },
  {
    id: "procedural",
    label: "Procedural Memory",
    description: "Reusable playbooks, SOPs, and operating patterns.",
  },
  {
    id: "decision",
    label: "Decision Memory",
    description: "Why important decisions were made and what alternatives were rejected.",
  },
  {
    id: "learning",
    label: "Learning Memory",
    description: "Lessons, improvements, and recurring patterns worth reusing.",
  },
  {
    id: "conversation",
    label: "Conversation Memory",
    description: "Summarized strategic and operational conversations, without raw chat history.",
  },
];

export const companyMemories: MemoryRecord[] = [
  ...episodicMemories,
  ...semanticMemories,
  ...proceduralMemories,
  ...decisionMemories,
  ...learningMemories,
  ...conversationMemories,
].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
