import type {
  WorkflowProjectionSourceRecord,
  WorkflowRuntimeModel,
  WorkflowRuntimeRef,
} from "./types";

function toWorkflowRef(workflow: WorkflowProjectionSourceRecord): WorkflowRuntimeRef {
  return {
    kind: "workflow",
    id: workflow.id,
    label: workflow.name,
  };
}

export const WorkflowHierarchyService = {
  buildParentWorkflow(
    workflow: WorkflowProjectionSourceRecord,
    workflows: WorkflowProjectionSourceRecord[],
    planId?: string,
  ): WorkflowRuntimeRef | undefined {
    const related = workflows.filter(
      (candidate) =>
        candidate.id !== workflow.id &&
        candidate.department === workflow.department &&
        (candidate.ownerAgent === workflow.ownerAgent || (!!planId && candidate.category === workflow.category)),
    );
    const parent = related.sort((a, b) => a.name.localeCompare(b.name))[0];
    return parent ? toWorkflowRef(parent) : undefined;
  },

  buildChildWorkflows(
    workflow: WorkflowProjectionSourceRecord,
    workflows: WorkflowProjectionSourceRecord[],
    planId?: string,
  ): WorkflowRuntimeRef[] {
    return workflows
      .filter(
        (candidate) =>
          candidate.id !== workflow.id &&
          candidate.department === workflow.department &&
          (candidate.ownerAgent === workflow.ownerAgent || (!!planId && candidate.category === workflow.category)),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 4)
      .map(toWorkflowRef);
  },

  sortForDashboard(workflows: WorkflowRuntimeModel[]): WorkflowRuntimeModel[] {
    const statusWeight = (value: string) =>
      value === "failed" ? 4 : value === "running" ? 3 : value === "scheduled" ? 2 : 1;
    return [...workflows].sort(
      (a, b) =>
        statusWeight(b.executionStatus) - statusWeight(a.executionStatus) ||
        b.risk.localeCompare(a.risk) ||
        a.identity.name.localeCompare(b.identity.name),
    );
  },
};
