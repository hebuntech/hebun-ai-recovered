import {
  buildConversationMemory,
  deriveTimestamp,
  firstActiveRecord,
  importanceFromHealth,
  nodeForRecord,
  statusFromHealth,
} from "@/features/memory/memory-builder";
import type { ConversationMemoryRecord } from "@/features/memory/types";

const goal = firstActiveRecord("goals");
const governance = firstActiveRecord("governance");
const risk = firstActiveRecord("risk");

const goalNodeId = nodeForRecord("goals", goal.id)?.id ?? "";
const governanceNodeId = nodeForRecord("governance", governance.id)?.id ?? "";
const riskNodeId = nodeForRecord("risk", risk.id)?.id ?? "";

export const conversationMemories: ConversationMemoryRecord[] = [
  buildConversationMemory({
    id: "mem-co-1",
    category: "conversation",
    title: "Strategic goal review summarized for future context",
    summary:
      "Leadership reviewed the active strategic goal and preserved only the operational summary and outcome.",
    summaryOnly: `${goal.name} remains active and aligned with its current operating context.`,
    participants: [goal.owner, "Director", "Planning Engine"],
    outcome: "Continue the goal with its current ownership and updated planning context.",
    whatHappened: `Leadership reviewed ${goal.name} and confirmed the next operating posture.`,
    whyItHappened:
      "The organization needed shared strategic context without retaining raw conversation history.",
    whoWasInvolved: [goal.owner, "Director", "Planning Engine"],
    whatChanged: goal.change,
    reusableLater:
      "Reuse this summary when future plans or recommendations need the latest leadership context.",
    owner: goal.owner,
    timestamp: deriveTimestamp(goal, "2026-06", 6),
    registryIds: ["goals", "plans", "governance"],
    graphNodeIds: [goalNodeId].filter(Boolean),
    involvedEntities: ["Director"],
    status: statusFromHealth(goal.health),
    importance: importanceFromHealth(goal.health),
    tags: ["conversation", "strategy", "goal-review"],
  }),
  buildConversationMemory({
    id: "mem-co-2",
    category: "conversation",
    title: "Governance review preserved as a controlled summary",
    summary:
      "A governance discussion was reduced to its decision context, participants, and agreed control outcome.",
    summaryOnly: `${governance.name} remains the governing control reference for the reviewed workflow context.`,
    participants: [governance.owner, "Director", "Audit"],
    outcome: "Maintain the current governance control and evidence lineage.",
    whatHappened: `${governance.name} was reviewed for continued operational suitability.`,
    whyItHappened:
      "Governance context must remain explainable without storing raw executive conversation transcripts.",
    whoWasInvolved: [governance.owner, "Director", "Audit"],
    whatChanged: governance.change,
    reusableLater:
      "Reuse this summary when approvals or audit explanations need the latest governance context.",
    owner: governance.owner,
    timestamp: deriveTimestamp(governance, "2026-06", 13),
    registryIds: ["governance", "events", "workflows"],
    graphNodeIds: [governanceNodeId].filter(Boolean),
    involvedEntities: ["Audit"],
    status: statusFromHealth(governance.health),
    importance: importanceFromHealth(governance.health),
    tags: ["conversation", "governance", "audit"],
  }),
  buildConversationMemory({
    id: "mem-co-3",
    category: "conversation",
    title: "Operational risk discussion retained as executive context",
    summary:
      "A risk review was summarized into the concern, participants, and agreed monitoring response.",
    summaryOnly: `${risk.name} remains visible and requires the existing mitigation posture.`,
    participants: [risk.owner, "Director", "Risk Engine"],
    outcome: "Keep the risk active and preserve its mitigation requirements in downstream planning.",
    whatHappened: `${risk.name} was reviewed against current operational priorities.`,
    whyItHappened:
      "Future recommendations need concise executive risk context without generic chat memory.",
    whoWasInvolved: [risk.owner, "Director", "Risk Engine"],
    whatChanged: risk.change,
    reusableLater:
      "Reuse this summary when evaluating related plans, workflows, and approvals.",
    owner: risk.owner,
    timestamp: deriveTimestamp(risk, "2026-06", 20),
    registryIds: ["risk", "goals", "governance"],
    graphNodeIds: [riskNodeId].filter(Boolean),
    involvedEntities: ["Director"],
    status: statusFromHealth(risk.health),
    importance: importanceFromHealth(risk.health),
    tags: ["conversation", "risk", "executive-context"],
  }),
];
