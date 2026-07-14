/*
 * Registry CRUD — service façade.
 *
 * The single public entry point for the CRUD layer. UI talks to the service; the
 * service delegates to mutations (write, via Command Bus) and queries (read).
 */

export {
  createRegistry,
  updateRegistry,
  archiveRegistry,
  restoreRegistry,
  deleteRegistry,
} from "./registry-mutations";

export { listAll, listByStatus, getById, search } from "./registry-queries";

export { buildReport } from "./registry-report";
export type { RegistryReport } from "./registry-report";

export { getAuditLog } from "./registry-audit";
export { getHistory as getCrudHistory } from "./registry-history";
export { getTelemetry } from "./registry-telemetry";
