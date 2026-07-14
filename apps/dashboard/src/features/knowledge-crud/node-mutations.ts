/*
 * Knowledge CRUD — node mutations.
 *
 * Every mutation flows through the Command Bus, then applies the deterministic
 * in-memory mutation and records domain audit / telemetry / history.
 */

import { dispatchCommand } from "@/features/commands/dispatcher";
import type { CommandType } from "@/features/commands/pipeline";
import type { LifecycleStatus } from "@/features/persistence";
import { recordAudit } from "./audit";
import { recordHistory } from "./history";
import { findById, insert, setStatus, update } from "./node-repository";
import { trackMutation, trackValidationFailure } from "./telemetry";
import { slugify, validateCreate, validateTransition, validateUpdate } from "./node-validator";
import type {
  CreateKnowledgeInput,
  KnowledgeAction,
  KnowledgeCrudResult,
  KnowledgeNodeRecord,
  UpdateKnowledgeInput,
} from "./types";

const DEFAULT_ACTOR = "Director";

function reject(errors: string[]): KnowledgeCrudResult {
  trackValidationFailure();
  return { ok: false, errors };
}

function cloneNode(record: KnowledgeNodeRecord | undefined): KnowledgeNodeRecord | undefined {
  return record ? { ...record, tags: [...record.tags] } : undefined;
}

async function commit(params: {
  commandType: CommandType;
  action: KnowledgeAction;
  knowledgeId: string;
  actor: string;
  previousState: KnowledgeNodeRecord | null;
  payload: Record<string, unknown>;
  mutate: () => Promise<KnowledgeNodeRecord | undefined>;
}): Promise<KnowledgeCrudResult> {
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
    return { ok: false, errors: [`Knowledge node "${params.knowledgeId}" could not be mutated.`], command };
  }

  recordAudit({
    commandId: command.id,
    entityKind: "node",
    knowledgeId: record.id,
    timestamp: command.timestamp,
    actor: params.actor,
    action: params.action,
    previousState: params.previousState,
    newState: cloneNode(record)!,
    simulation: true,
  });
  trackMutation(params.action, command.telemetry.durationMs);
  recordHistory({
    commandId: command.id,
    entityKind: "node",
    entityId: record.id,
    action: params.action,
    timestamp: command.timestamp,
    actor: params.actor,
    ok: true,
  });

  return { ok: true, errors: [], record, command };
}

export async function createKnowledge(
  input: CreateKnowledgeInput,
  actor = DEFAULT_ACTOR
): Promise<KnowledgeCrudResult> {
  const id = input.slug?.trim() || slugify(input.title ?? "");
  const validation = await validateCreate(input, id);
  if (!validation.ok) return reject(validation.errors);

  const now = new Date().toISOString();
  const record: KnowledgeNodeRecord = {
    id,
    title: input.title.trim(),
    slug: input.slug.trim(),
    description: input.description.trim(),
    nodeType: input.nodeType,
    ownerType: input.ownerType,
    ownerId: input.ownerId.trim().toLowerCase(),
    confidence: input.confidence,
    importance: input.importance,
    status: input.status,
    version: input.version.trim(),
    source: input.source.trim(),
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
    updatedBy: actor,
    lifecycleStatus: "active",
  };

  return commit({
    commandType: "knowledge.create",
    action: "create",
    knowledgeId: id,
    actor,
    previousState: null,
    payload: { id, title: record.title, slug: record.slug, nodeType: record.nodeType },
    mutate: async () => {
      await insert(record);
      return record;
    },
  });
}

export async function updateKnowledge(
  id: string,
  input: UpdateKnowledgeInput,
  actor = DEFAULT_ACTOR
): Promise<KnowledgeCrudResult> {
  const validation = await validateUpdate(id, input);
  if (!validation.ok) return reject(validation.errors);
  const transition = await validateTransition(id, "update");
  if (!transition.ok) return reject(transition.errors);

  const current = (await findById(id))!;
  const previousState = cloneNode(current)!;
  return commit({
    commandType: "knowledge.update",
    action: "update",
    knowledgeId: id,
    actor,
    previousState,
    payload: { id, ...input },
    mutate: () =>
      update(id, {
        title: input.title?.trim() ?? current.title,
        slug: input.slug?.trim() ?? current.slug,
        description: input.description?.trim() ?? current.description,
        nodeType: input.nodeType ?? current.nodeType,
        ownerType: input.ownerType ?? current.ownerType,
        ownerId: input.ownerId?.trim().toLowerCase() ?? current.ownerId,
        confidence: input.confidence ?? current.confidence,
        importance: input.importance ?? current.importance,
        status: input.status ?? current.status,
        version: input.version?.trim() ?? current.version,
        source: input.source?.trim() ?? current.source,
        tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? current.tags,
        updatedBy: actor,
      }),
  });
}

async function transition(
  id: string,
  action: Extract<KnowledgeAction, "archive" | "restore" | "delete">,
  target: LifecycleStatus,
  commandType: CommandType,
  actor = DEFAULT_ACTOR
): Promise<KnowledgeCrudResult> {
  const check = await validateTransition(id, action);
  if (!check.ok) return reject(check.errors);
  const current = (await findById(id))!;
  const previousState = cloneNode(current)!;
  return commit({
    commandType,
    action,
    knowledgeId: id,
    actor,
    previousState,
    payload: { id },
    mutate: () => setStatus(id, target),
  });
}

export function archiveKnowledge(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<KnowledgeCrudResult> {
  return transition(id, "archive", "archived", "knowledge.archive", actor);
}
export function restoreKnowledge(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<KnowledgeCrudResult> {
  return transition(id, "restore", "active", "knowledge.restore", actor);
}
export function deleteKnowledge(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<KnowledgeCrudResult> {
  return transition(id, "delete", "deleted", "knowledge.delete", actor);
}
