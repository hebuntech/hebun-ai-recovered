import { getSnapshot as getMemorySnapshot } from "@/features/memory-crud/memory-adapter";
import { createProjectionBuilder } from "../projection-builder";
import type { MemoryRuntimeProjection } from "@/features/memory-runtime/types";

function groupCount<T>(records: T[], key: (record: T) => string): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const record of records) {
    const id = key(record);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function listActiveMemories() {
  return getMemorySnapshot().filter((memory) => memory.lifecycleStatus === "active");
}

function buildMemoryProjection(): MemoryRuntimeProjection {
  const activeMemories = listActiveMemories();
  const byType = groupCount(activeMemories, (memory) => memory.memoryType);
  const criticalCount = activeMemories.filter((memory) => memory.importance === "critical").length;
  const reviewCount = activeMemories.filter((memory) => memory.status === "review").length;

  return {
    overview: {
      metrics: [
        {
          label: "Memories",
          value: String(activeMemories.length),
          detail: "Authoritative runtime memory records",
        },
        {
          label: "Critical",
          value: String(criticalCount),
          detail: "High-value operating context",
        },
        {
          label: "Review Queue",
          value: String(reviewCount),
          detail: "Records awaiting promotion or refresh",
        },
      ],
      items: byType.slice(0, 6).map(([type, count]) => ({
        id: type,
        title: type,
        detail: `${count} ${type.toLowerCase()} memory records`,
        meta: "Memory provider",
        href: "/director/memory",
      })),
    },
    timeline: listActiveMemories()
      .slice(0, 8)
      .map((memory) => ({
        id: `memory-${memory.id}`,
        title: memory.title,
        detail: `${memory.memoryType} memory · ${memory.summary}`,
        when: memory.updatedAt,
        kind: "Memory",
      })),
  };
}

export const MemoryProjectionBuilder = createProjectionBuilder({
  collection: "memory-runtime",
  owner: "Memory Runtime",
  dependencies: [],
  build: () => buildMemoryProjection(),
  count: (snapshot) => snapshot.overview.items.length + snapshot.timeline.length,
});
