/* Knowledge CRUD — service facade (nodes + relationships). */
export {
  createKnowledge,
  updateKnowledge,
  archiveKnowledge,
  restoreKnowledge,
  deleteKnowledge,
} from "./node-mutations";

export {
  createRelationship,
  updateRelationship,
  deleteRelationship,
} from "./relationship-mutations";

export { listNodes, listNodesByStatus, getNodeById, searchNodes } from "./node-queries";
export { listRelationships, getRelationshipById, relationshipsForNode } from "./relationship-queries";

export { buildReport } from "./report";
export type { KnowledgeReport } from "./report";

export { getAuditLog } from "./audit";
export { getHistory as getCrudHistory } from "./history";
export { getTelemetry } from "./telemetry";
export { RELATIONSHIP_TYPES } from "./relationship-validator";
