import {
  buildMemoryRecord,
  deriveTimestamp,
  firstActiveRecord,
  importanceFromHealth,
  nodeForRecord,
  statusFromHealth,
} from "@/features/memory/memory-builder";
import type { MemoryRecord } from "@/features/memory/types";

const execution = firstActiveRecord("executions");
const event = firstActiveRecord("events");
const experience = firstActiveRecord("experience");

const executionNodeId = nodeForRecord("executions", execution.id)?.id ?? "";
const eventNodeId = nodeForRecord("events", event.id)?.id ?? "";
const experienceNodeId = nodeForRecord("experience", experience.id)?.id ?? "";

export const episodicMemories: MemoryRecord[] = [
  buildMemoryRecord({
    id: "mem-ep-1",
    category: "episodic",
    title: "Execution outcome preserved as an operating episode",
    summary:
      "A completed execution state is retained with its operational context for future review and planning.",
    whatHappened: `${execution.name} produced an execution outcome that affected downstream operating work.`,
    whyItHappened:
      "Execution history needs durable context so later reasoning can distinguish outcomes from plans.",
    whoWasInvolved: [execution.owner, "Execution Engine", "Director"],
    whatChanged: execution.change,
    reusableLater:
      "Reuse this episode when reviewing execution reliability and planning similar work.",
    owner: execution.owner,
    timestamp: deriveTimestamp(execution, "2026-06", 3),
    registryIds: ["executions", "plans", "workflows"],
    graphNodeIds: [executionNodeId].filter(Boolean),
    involvedEntities: ["Execution Engine"],
    status: statusFromHealth(execution.health),
    importance: importanceFromHealth(execution.health),
    tags: ["episode", "execution", "outcome"],
  }),
  buildMemoryRecord({
    id: "mem-ep-2",
    category: "episodic",
    title: "Operational event retained with company context",
    summary:
      "A significant company event is preserved as an episode linked to its source registry and consumers.",
    whatHappened: `${event.name} was observed and routed through the operating system.`,
    whyItHappened:
      "Important events need contextual history so future systems can explain what changed and when.",
    whoWasInvolved: [event.owner, "Event Bus", "Operations"],
    whatChanged: event.change,
    reusableLater:
      "Reuse this episode when correlating later events, executions, and organizational changes.",
    owner: event.owner,
    timestamp: deriveTimestamp(event, "2026-06", 11),
    registryIds: ["events", "executions", "governance"],
    graphNodeIds: [eventNodeId].filter(Boolean),
    involvedEntities: ["Operations"],
    status: statusFromHealth(event.health),
    importance: importanceFromHealth(event.health),
    tags: ["episode", "event", "operations"],
  }),
  buildMemoryRecord({
    id: "mem-ep-3",
    category: "episodic",
    title: "Enterprise experience captured as a historical episode",
    summary:
      "A company experience is retained before its lessons are promoted into reusable learning.",
    whatHappened: `${experience.name} created a company-level experience record.`,
    whyItHappened:
      "Learning systems need the original episode alongside any generalized lesson derived from it.",
    whoWasInvolved: [experience.owner, "Learning Engine", "Director"],
    whatChanged: experience.change,
    reusableLater:
      "Reuse this episode to validate future learning and recommendation claims against source experience.",
    owner: experience.owner,
    timestamp: deriveTimestamp(experience, "2026-06", 18),
    registryIds: ["experience", "learning", "goals"],
    graphNodeIds: [experienceNodeId].filter(Boolean),
    involvedEntities: ["Director"],
    status: statusFromHealth(experience.health),
    importance: importanceFromHealth(experience.health),
    tags: ["episode", "experience", "learning-source"],
  }),
];
