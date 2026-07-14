import {
  buildMemoryRecord,
  deriveTimestamp,
  firstActiveRecord,
  importanceFromHealth,
  nodeForRecord,
  statusFromHealth,
} from "@/features/memory/memory-builder";
import type { MemoryRecord } from "@/features/memory/types";

const learning = firstActiveRecord("learning");
const experience = firstActiveRecord("experience");
const capability = firstActiveRecord("capabilities");

const learningNodeId = nodeForRecord("learning", learning.id)?.id ?? "";
const experienceNodeId = nodeForRecord("experience", experience.id)?.id ?? "";
const capabilityNodeId = nodeForRecord("capabilities", capability.id)?.id ?? "";

export const learningMemories: MemoryRecord[] = [
  buildMemoryRecord({
    id: "mem-le-1",
    category: "learning",
    title: "Retention playbook v2 preserved as adopted learning",
    summary:
      "A validated retention lesson is stored as organizational learning for later reuse and optimization.",
    whatHappened: `${learning.name} was marked adopted and linked to downstream capability improvement.`,
    whyItHappened:
      "The organization observed repeatable improvement patterns worth preserving beyond a single execution cycle.",
    whoWasInvolved: [learning.owner, "Director", "Capability Planner"],
    whatChanged: learning.change,
    reusableLater:
      "Reuse this learning memory for future retention planning and recommendation systems.",
    owner: learning.owner,
    timestamp: deriveTimestamp(learning, "2026-06", 7),
    registryIds: ["learning", "experience", "capabilities"],
    graphNodeIds: [learningNodeId].filter(Boolean),
    involvedEntities: ["Director"],
    status: statusFromHealth(learning.health),
    importance: importanceFromHealth(learning.health),
    tags: ["learning", "retention", "playbook"],
  }),
  buildMemoryRecord({
    id: "mem-le-2",
    category: "learning",
    title: "Enterprise segment conversion lesson entered reusable memory",
    summary:
      "A high-performing conversion pattern was captured as reusable organizational learning.",
    whatHappened: `${experience.name} was promoted from raw experience into repeatable learning value.`,
    whyItHappened:
      "The organization wants to preserve successful operating patterns while they are still fresh.",
    whoWasInvolved: [experience.owner, "Learning Engine", "Recommendations"],
    whatChanged: experience.change,
    reusableLater:
      "Reuse this learning memory in future revenue and recommendation programs.",
    owner: experience.owner,
    timestamp: deriveTimestamp(experience, "2026-06", 12),
    registryIds: ["experience", "learning"],
    graphNodeIds: [experienceNodeId].filter(Boolean),
    involvedEntities: ["Sales"],
    status: statusFromHealth(experience.health),
    importance: importanceFromHealth(experience.health),
    tags: ["learning", "experience", "conversion"],
  }),
  buildMemoryRecord({
    id: "mem-le-3",
    category: "learning",
    title: "Budget approval forecasting keeps an optimization memory trail",
    summary:
      "Capability tuning was preserved so future finance automation can reuse what improved prediction quality.",
    whatHappened: `${capability.name} stayed active with an expanded consumer footprint.`,
    whyItHappened:
      "The capability was learning-positive and worth preserving as an optimization pattern.",
    whoWasInvolved: [capability.owner, "Finance", "Director"],
    whatChanged: capability.change,
    reusableLater:
      "Reuse this memory when extending forecasting or approval optimization paths.",
    owner: capability.owner,
    timestamp: deriveTimestamp(capability, "2026-06", 17),
    registryIds: ["capabilities", "learning", "governance"],
    graphNodeIds: [capabilityNodeId].filter(Boolean),
    involvedEntities: ["Finance"],
    status: statusFromHealth(capability.health),
    importance: importanceFromHealth(capability.health),
    tags: ["learning", "optimization", "forecasting"],
  }),
];
