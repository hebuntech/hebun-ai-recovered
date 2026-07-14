import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import type { WorkflowRuntimeModel } from "./types";

export const WorkflowRuntimeEngine = {
  listWorkflows(): WorkflowRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<WorkflowRuntimeModel[]>(
      "workflow-runtime",
    ).data;
  },

  getWorkflow(id: string): WorkflowRuntimeModel | undefined {
    return WorkflowRuntimeEngine.listWorkflows().find(
      (candidate) => candidate.identity.id === id,
    );
  },
};
