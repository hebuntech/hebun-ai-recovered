import type { WorkflowProjectionSourceRecord, WorkflowRuntimeWorkItem } from "./types";

export const WorkflowDependencyService = {
  buildDependencies(workflow: WorkflowProjectionSourceRecord): WorkflowRuntimeWorkItem[] {
    return workflow.dependencies.map((dependency, index) => ({
      type: "workflow",
      id: `${workflow.id}-dependency-${index + 1}`,
      label: dependency,
      detail: "Workflow dependency",
    }));
  },
};
