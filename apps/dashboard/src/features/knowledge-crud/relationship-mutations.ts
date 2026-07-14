/*
 * Knowledge CRUD — relationship mutations.
 *
 * create / update / delete (soft) for typed edges, each through the Command Bus.
 */

import { dispatchCommand } from "@/features/commands/dispatcher";
import type { CommandType } from "@/features/commands/pipeline";
import { recordAudit } from "./audit";
import { recordHistory } from "./history";
import { findById, insert, softDelete, update } from "./relationship-repository";
import { trackRelationship, trackValidationFailure } from "./telemetry";
import {
  validateCreateRelationship,
  validateRelationshipTransition,
  validateUpdateRelationship,
} from "./relationship-validator";
import type {
  CreateRelationshipInput,
  RelationshipAction,
  RelationshipCrudResult,
  RelationshipRecord,
  UpdateRelationshipInput,
} from "./types";

const DEFAULT_ACTOR = "Director";

function reject(errors: string[]): RelationshipCrudResult {
  trackValidationFailure();
  return { ok: false, errors };
}

function clone(record: RelationshipRecord | undefined): RelationshipRecord | undefined {
  return record ? { ...record } : undefined;
}

async function commit(params: {
  commandType: CommandType;
  action: RelationshipAction;
  relationshipId: string;
  actor: string;
  previousState: RelationshipRecord | null;
  payload: Record<string, unknown>;
  mutate: () => Promise<RelationshipRecord | undefined>;
}): Promise<RelationshipCrudResult> {
  const command = dispatchCommand({
    commandType: params.commandType,
    payload: params.payload,
    actor: params.actor,
    source: "ui",
  });

  if (command.status === "failed") {
    return { ok: false, errors: [command.validationResult.detail], command };
  }

  const record = await params.mutate();
  if (!record) {
    return { ok: false, errors: [`Relationship "${params.relationshipId}" could not be mutated.`], command };
  }

  recordAudit({
    commandId: command.id,
    entityKind: "relationship",
    relationshipId: record.id,
    timestamp: command.timestamp,
    actor: params.actor,
    action: params.action,
    previousState: params.previousState,
    newState: clone(record)!,
    simulation: true,
  });
  trackRelationship(params.action, command.telemetry.durationMs);
  recordHistory({
    commandId: command.id,
    entityKind: "relationship",
    entityId: record.id,
    action: params.action,
    timestamp: command.timestamp,
    actor: params.actor,
    ok: true,
  });

  return { ok: true, errors: [], record, command };
}

export async function createRelationship(
  input: CreateRelationshipInput,
  actor = DEFAULT_ACTOR
): Promise<RelationshipCrudResult> {
  const validation = await validateCreateRelationship(input);
  if (!validation.ok) return reject(validation.errors);

  const now = new Date().toISOString();
  const id = `rel_${input.sourceNode.trim()}__${input.relationshipType}__${input.targetNode.trim()}`;
  const record: RelationshipRecord = {
    id,
    sourceNode: input.sourceNode.trim(),
    targetNode: input.targetNode.trim(),
    relationshipType: input.relationshipType,
    weight: input.weight,
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
    updatedBy: actor,
    lifecycleStatus: "active",
  };

  return commit({
    commandType: "relationship.create",
    action: "create",
    relationshipId: id,
    actor,
    previousState: null,
    payload: { id, sourceNode: record.sourceNode, targetNode: record.targetNode, relationshipType: record.relationshipType },
    mutate: async () => {
      await insert(record);
      return record;
    },
  });
}

export async function updateRelationship(
  id: string,
  input: UpdateRelationshipInput,
  actor = DEFAULT_ACTOR
): Promise<RelationshipCrudResult> {
  const validation = await validateUpdateRelationship(id, input);
  if (!validation.ok) return reject(validation.errors);
  const transition = await validateRelationshipTransition(id, "update");
  if (!transition.ok) return reject(transition.errors);

  const current = (await findById(id))!;
  const previousState = clone(current)!;
  return commit({
    commandType: "relationship.update",
    action: "update",
    relationshipId: id,
    actor,
    previousState,
    payload: { id, ...input },
    mutate: () =>
      update(id, {
        relationshipType: input.relationshipType ?? current.relationshipType,
        weight: input.weight ?? current.weight,
        updatedBy: actor,
      }),
  });
}

export async function deleteRelationship(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<RelationshipCrudResult> {
  const transition = await validateRelationshipTransition(id, "delete");
  if (!transition.ok) return reject(transition.errors);
  const current = (await findById(id))!;
  const previousState = clone(current)!;
  return commit({
    commandType: "relationship.delete",
    action: "delete",
    relationshipId: id,
    actor,
    previousState,
    payload: { id },
    mutate: () => softDelete(id),
  });
}
