/*
 * Agent CRUD — service facade.
 */

export {
  createAgent,
  updateAgent,
  archiveAgent,
  restoreAgent,
  deleteAgent,
} from "./agent-mutations";

export { listAll, listByStatus, getById, search } from "./agent-queries";

export { buildReport } from "./agent-report";
export type { AgentReport } from "./agent-report";

export { getAuditLog } from "./agent-audit";
export { getHistory as getCrudHistory } from "./agent-history";
export { getTelemetry } from "./agent-telemetry";
