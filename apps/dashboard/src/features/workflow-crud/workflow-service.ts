/*
 * Workflow CRUD — service facade.
 */

export {
  createWorkflow,
  updateWorkflow,
  archiveWorkflow,
  restoreWorkflow,
  deleteWorkflow,
} from "./workflow-mutations";

export { listAll, listByStatus, getById, search } from "./workflow-queries";

export { buildReport } from "./workflow-report";
export type { WorkflowReport } from "./workflow-report";

export { getAuditLog } from "./workflow-audit";
export { getHistory as getCrudHistory } from "./workflow-history";
export { getTelemetry } from "./workflow-telemetry";
