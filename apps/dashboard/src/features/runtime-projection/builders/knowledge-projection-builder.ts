import { getNodeSnapshot } from "@/features/knowledge-crud/node-adapter";
import { createProjectionBuilder } from "../projection-builder";
import type { KnowledgeRuntimeProjection } from "@/features/knowledge-runtime/types";

function groupCount<T>(records: T[], key: (record: T) => string): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const record of records) {
    const id = key(record);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function listActiveKnowledgeNodes() {
  return getNodeSnapshot().filter((node) => node.lifecycleStatus === "active");
}

function buildKnowledgeProjection(): KnowledgeRuntimeProjection {
  const activeKnowledge = listActiveKnowledgeNodes();
  const reviewedCount = activeKnowledge.filter((node) => node.status === "verified").length;
  const reviewCount = activeKnowledge.filter((node) => node.status === "review").length;
  const typeCounts = groupCount(activeKnowledge, (node) => node.nodeType);

  return {
    overview: {
      metrics: [
        {
          label: "Knowledge Nodes",
          value: String(activeKnowledge.length),
          detail: "Memory-backed canonical knowledge registry",
        },
        {
          label: "Verified",
          value: String(reviewedCount),
          detail: "Ready for operational reuse",
        },
        {
          label: "In Review",
          value: String(reviewCount),
          detail: "Needs additional validation",
        },
      ],
      items: typeCounts.slice(0, 6).map(([type, count]) => ({
        id: type,
        title: type,
        detail: `${count} active ${type.toLowerCase()} records`,
        meta: "Knowledge registry",
        href: "/director/knowledge-graph",
      })),
    },
    timeline: listActiveKnowledgeNodes()
      .slice(0, 8)
      .map((node) => ({
        id: `knowledge-${node.id}`,
        title: node.title,
        detail: `${node.nodeType} knowledge · ${node.description}`,
        when: node.updatedAt,
        kind: "Knowledge",
      })),
  };
}

export const KnowledgeProjectionBuilder = createProjectionBuilder({
  collection: "knowledge-runtime",
  owner: "Knowledge Runtime",
  dependencies: [],
  build: () => buildKnowledgeProjection(),
  count: (snapshot) => snapshot.overview.items.length + snapshot.timeline.length,
});
