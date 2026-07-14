import { WorkflowHierarchyService } from "./workflow-hierarchy-service";
import { WorkflowRuntimeEngine } from "./workflow-runtime-engine";
import type { WorkflowRuntimeModel } from "./types";

export const WorkflowRegistry = {
  listWorkflows(): WorkflowRuntimeModel[] {
    return WorkflowHierarchyService.sortForDashboard(WorkflowRuntimeEngine.listWorkflows());
  },

  getWorkflow(id: string): WorkflowRuntimeModel | undefined {
    return WorkflowRuntimeEngine.getWorkflow(id);
  },
};
