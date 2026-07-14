/*
 * Memory CRUD — service facade.
 */

export {
  createMemory,
  updateMemory,
  archiveMemory,
  restoreMemory,
  deleteMemory,
} from "./memory-mutations";

export { listAll, listByStatus, getById, search } from "./memory-queries";

export { buildReport } from "./memory-report";
export type { MemoryReport } from "./memory-report";

export { getAuditLog } from "./memory-audit";
export { getHistory as getCrudHistory } from "./memory-history";
export { getTelemetry } from "./memory-telemetry";
