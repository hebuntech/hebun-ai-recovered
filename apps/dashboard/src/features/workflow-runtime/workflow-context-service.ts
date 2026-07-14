import type {
  KnowledgeProjectionSourceRecord,
  MemoryProjectionSourceRecord,
  WorkflowProjectionSourceRecord,
  WorkflowRuntimeWorkItem,
} from "./types";

function matchesWorkflow(
  nodeOrMemory: { ownerId: string; tags: string[] },
  workflow: WorkflowProjectionSourceRecord,
): boolean {
  return (
    nodeOrMemory.ownerId === workflow.id ||
    nodeOrMemory.ownerId === workflow.slug ||
    nodeOrMemory.tags.includes(workflow.slug) ||
    nodeOrMemory.tags.includes(workflow.department.toLowerCase()) ||
    nodeOrMemory.tags.includes(workflow.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
  );
}

function toKnowledgeItem(node: KnowledgeProjectionSourceRecord): WorkflowRuntimeWorkItem {
  return {
    type: node.nodeType === "Learning" ? "learning" : "knowledge",
    id: node.id,
    label: node.title,
    status: node.status,
    detail: node.description,
  };
}

function toMemoryItem(memory: MemoryProjectionSourceRecord): WorkflowRuntimeWorkItem {
  return {
    type: memory.memoryType === "Workflow" ? "memory" : "memory",
    id: memory.id,
    label: memory.title,
    status: memory.status,
    detail: memory.summary,
  };
}

export const WorkflowContextService = {
  buildKnowledgeReferences(
    workflow: WorkflowProjectionSourceRecord,
    nodes: KnowledgeProjectionSourceRecord[],
  ): WorkflowRuntimeWorkItem[] {
    return nodes
      .filter(
        (node) =>
          node.lifecycleStatus === "active" &&
          node.nodeType !== "Learning" &&
          matchesWorkflow(node, workflow),
      )
      .slice(0, 6)
      .map(toKnowledgeItem);
  },

  buildLearningReferences(
    workflow: WorkflowProjectionSourceRecord,
    nodes: KnowledgeProjectionSourceRecord[],
  ): WorkflowRuntimeWorkItem[] {
    return nodes
      .filter(
        (node) =>
          node.lifecycleStatus === "active" &&
          node.nodeType === "Learning" &&
          matchesWorkflow(node, workflow),
      )
      .slice(0, 4)
      .map(toKnowledgeItem);
  },

  buildMemoryReferences(
    workflow: WorkflowProjectionSourceRecord,
    memories: MemoryProjectionSourceRecord[],
  ): WorkflowRuntimeWorkItem[] {
    return memories
      .filter(
        (memory) =>
          memory.lifecycleStatus === "active" &&
          (memory.ownerType === "workflow" || memory.memoryType === "Workflow" || memory.memoryType === "Procedure" || memory.memoryType === "Decision") &&
          matchesWorkflow(memory, workflow),
      )
      .slice(0, 6)
      .map(toMemoryItem);
  },
};
