/*
 * Knowledge CRUD — relationship validator.
 *
 * Deterministic checks: valid relationship type, missing/unknown source node,
 * missing/unknown target node, self-links, duplicate edges, weight bounds, and
 * lifecycle transitions.
 */

import type { LifecycleStatus } from "@/features/persistence";
import { findById as findNode } from "./node-repository";
import { findAll, findById } from "./relationship-repository";
import type {
  CreateRelationshipInput,
  KnowledgeGraphRelationshipType,
  RelationshipAction,
  UpdateRelationshipInput,
  ValidationResult,
} from "./types";

function ok(): ValidationResult {
  return { ok: true, errors: [] };
}
function fail(...errors: string[]): ValidationResult {
  return { ok: false, errors };
}

export const RELATIONSHIP_TYPES: KnowledgeGraphRelationshipType[] = [
  "executes",
  "fulfills",
  "belongs_to",
  "generated_from",
  "improves",
  "uses",
  "runs",
  "creates",
  "affects",
  "controls",
  "depends_on",
  "feeds",
];

function validType(type: string): type is KnowledgeGraphRelationshipType {
  return (RELATIONSHIP_TYPES as string[]).includes(type);
}

export async function validateCreateRelationship(
  input: CreateRelationshipInput
): Promise<ValidationResult> {
  const errors: string[] = [];

  if (!input.sourceNode || input.sourceNode.trim().length === 0) errors.push("Source node is required.");
  else if (!(await findNode(input.sourceNode.trim()))) errors.push(`Source node "${input.sourceNode}" does not exist.`);

  if (!input.targetNode || input.targetNode.trim().length === 0) errors.push("Target node is required.");
  else if (!(await findNode(input.targetNode.trim()))) errors.push(`Target node "${input.targetNode}" does not exist.`);

  if (input.sourceNode && input.targetNode && input.sourceNode.trim() === input.targetNode.trim()) {
    errors.push("A relationship cannot link a node to itself.");
  }

  if (!validType(input.relationshipType)) {
    errors.push(`Invalid relationship type "${input.relationshipType}".`);
  }

  if (typeof input.weight !== "number" || Number.isNaN(input.weight) || input.weight < 0) {
    errors.push("Weight must be a number >= 0.");
  }

  if (
    input.sourceNode &&
    input.targetNode &&
    (await findAll()).some(
      (edge) =>
        edge.lifecycleStatus !== "deleted" &&
        edge.sourceNode === input.sourceNode.trim() &&
        edge.targetNode === input.targetNode.trim() &&
        edge.relationshipType === input.relationshipType
    )
  ) {
    errors.push("An identical relationship already exists.");
  }

  return errors.length ? { ok: false, errors } : ok();
}

export async function validateUpdateRelationship(
  id: string,
  input: UpdateRelationshipInput
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Relationship "${id}" not found.`);

  const errors: string[] = [];
  if (input.relationshipType !== undefined && !validType(input.relationshipType)) {
    errors.push(`Invalid relationship type "${input.relationshipType}".`);
  }
  if (input.weight !== undefined && (typeof input.weight !== "number" || Number.isNaN(input.weight) || input.weight < 0)) {
    errors.push("Weight must be a number >= 0.");
  }
  return errors.length ? { ok: false, errors } : ok();
}

const allowed: Record<RelationshipAction, LifecycleStatus[]> = {
  create: [],
  update: ["active"],
  delete: ["active"],
};

export async function validateRelationshipTransition(
  id: string,
  action: RelationshipAction
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Relationship "${id}" not found.`);
  const from = current.lifecycleStatus;
  if (!allowed[action].includes(from)) {
    return fail(`Cannot ${action} a relationship that is currently "${from}".`);
  }
  return ok();
}
