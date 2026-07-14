import { getSnapshot as getMemorySnapshot } from "@/features/memory-crud/memory-adapter";
import { createProjectionBuilder } from "../projection-builder";
import type { DecisionRuntimeProjection } from "@/features/decision-runtime/types";

function formatDecisionMeta(meta: string): string {
  return meta;
}

function buildDecisionProjection(): DecisionRuntimeProjection {
  const decisions = getMemorySnapshot()
    .filter(
      (memory) =>
        memory.lifecycleStatus === "active" && memory.memoryType === "Decision",
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((memory) => ({
      id: memory.id,
      title: memory.title,
      summary: memory.summary,
      ownerType: memory.ownerType,
      ownerId: memory.ownerId,
      status: memory.status,
      updatedAt: memory.updatedAt,
    }));

  return {
    decisions,
    dashboardItems: decisions.slice(0, 6).map((decision) => ({
      id: decision.id,
      title: decision.title,
      detail: decision.summary,
      meta: formatDecisionMeta(
        `${decision.ownerType} · ${decision.ownerId} · ${decision.updatedAt}`,
      ),
      status: decision.status,
      href: "/director/memory",
    })),
  };
}

export const DecisionProjectionBuilder = createProjectionBuilder({
  collection: "decision-runtime",
  owner: "Decision Runtime",
  dependencies: [],
  build: () => buildDecisionProjection(),
  count: (snapshot) => snapshot.decisions.length,
});
