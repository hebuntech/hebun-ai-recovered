import { createProjectionBuilder } from "../projection-builder";
import type { ExecutiveTimelineEventRuntimeModel } from "@/features/executive-runtime-support/types";
import type { KnowledgeRuntimeProjection } from "@/features/knowledge-runtime/types";
import type { MemoryRuntimeProjection } from "@/features/memory-runtime/types";

function buildExecutiveTimelineProjection(
  memory: MemoryRuntimeProjection,
  knowledge: KnowledgeRuntimeProjection,
): ExecutiveTimelineEventRuntimeModel[] {
  return [...memory.timeline, ...knowledge.timeline]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 10);
}

export const ExecutiveTimelineProjectionBuilder = createProjectionBuilder({
  collection: "executive-timeline-runtime",
  owner: "Executive Timeline Runtime",
  dependencies: ["memory-runtime", "knowledge-runtime"],
  build: (context) => {
    const memory = context.getSnapshot<MemoryRuntimeProjection>("memory-runtime");
    const knowledge = context.getSnapshot<KnowledgeRuntimeProjection>("knowledge-runtime");
    if (!memory || !knowledge) {
      throw new Error("Executive timeline projection requires memory and knowledge projections.");
    }
    return buildExecutiveTimelineProjection(memory.data, knowledge.data);
  },
  count: (snapshot) => snapshot.length,
});
