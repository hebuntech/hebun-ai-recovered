/*
 * Memory CRUD — mutations.
 */

import { dispatchCommand } from "@/features/commands/dispatcher";
import type { CommandType } from "@/features/commands/pipeline";
import type { LifecycleStatus } from "@/features/persistence";
import { recordAudit } from "./memory-audit";
import { recordHistory } from "./memory-history";
import { findById, insert, setStatus, update } from "./memory-repository";
import { trackMutation, trackValidationFailure } from "./memory-telemetry";
import { slugify, validateCreate, validateTransition, validateUpdate } from "./memory-validator";
import type {
  CreateMemoryInput,
  MemoryAction,
  MemoryCrudRecord,
  MemoryCrudResult,
  UpdateMemoryInput,
} from "./types";

const DEFAULT_ACTOR = "Director";

function reject(errors: string[]): MemoryCrudResult {
  trackValidationFailure();
  return { ok: false, errors };
}

function cloneRecord(record: MemoryCrudRecord | undefined): MemoryCrudRecord | undefined {
  return record ? { ...record, tags: [...record.tags] } : undefined;
}

async function commit(params: {
  commandType: CommandType;
  action: MemoryAction;
  memoryId: string;
  actor: string;
  previousState: MemoryCrudRecord | null;
  payload: Record<string, unknown>;
  mutate: () => Promise<MemoryCrudRecord | undefined>;
}): Promise<MemoryCrudResult> {
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
    return {
      ok: false,
      errors: [`Memory "${params.memoryId}" could not be mutated.`],
      command,
    };
  }

  recordAudit({
    commandId: command.id,
    memoryId: record.id,
    timestamp: command.timestamp,
    actor: params.actor,
    action: params.action,
    previousState: params.previousState,
    newState: cloneRecord(record)!,
    simulation: true,
  });
  trackMutation(params.action, command.telemetry.durationMs);
  recordHistory({
    commandId: command.id,
    memoryId: record.id,
    action: params.action,
    timestamp: command.timestamp,
    actor: params.actor,
    ok: true,
  });

  return { ok: true, errors: [], record, command };
}

export async function createMemory(
  input: CreateMemoryInput,
  actor = DEFAULT_ACTOR
): Promise<MemoryCrudResult> {
  const id = input.slug?.trim() || slugify(input.title ?? "");
  const validation = await validateCreate(input, id);
  if (!validation.ok) return reject(validation.errors);

  const now = new Date().toISOString();
  const record: MemoryCrudRecord = {
    id,
    title: input.title.trim(),
    slug: input.slug.trim(),
    description: input.description.trim(),
    memoryType: input.memoryType,
    ownerType: input.ownerType,
    ownerId: input.ownerId.trim().toLowerCase(),
    importance: input.importance,
    confidence: input.confidence,
    source: input.source.trim(),
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    summary: input.summary.trim(),
    status: input.status,
    version: input.version.trim(),
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
    updatedBy: actor,
    lifecycleStatus: "active",
  };

  return commit({
    commandType: "memory.create",
    action: "create",
    memoryId: id,
    actor,
    previousState: null,
    payload: { id, title: record.title, slug: record.slug, memoryType: record.memoryType },
    mutate: async () => {
      await insert(record);
      return record;
    },
  });
}

export async function updateMemory(
  id: string,
  input: UpdateMemoryInput,
  actor = DEFAULT_ACTOR
): Promise<MemoryCrudResult> {
  const validation = await validateUpdate(id, input);
  if (!validation.ok) return reject(validation.errors);
  const transition = await validateTransition(id, "update");
  if (!transition.ok) return reject(transition.errors);

  const current = (await findById(id))!;
  const previousState = cloneRecord(current)!;
  return commit({
    commandType: "memory.update",
    action: "update",
    memoryId: id,
    actor,
    previousState,
    payload: { id, ...input },
    mutate: () =>
      update(id, {
        title: input.title?.trim() ?? current.title,
        slug: input.slug?.trim() ?? current.slug,
        description: input.description?.trim() ?? current.description,
        memoryType: input.memoryType ?? current.memoryType,
        ownerType: input.ownerType ?? current.ownerType,
        ownerId: input.ownerId?.trim().toLowerCase() ?? current.ownerId,
        importance: input.importance ?? current.importance,
        confidence: input.confidence ?? current.confidence,
        source: input.source?.trim() ?? current.source,
        tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? current.tags,
        summary: input.summary?.trim() ?? current.summary,
        status: input.status ?? current.status,
        version: input.version?.trim() ?? current.version,
        updatedBy: actor,
      }),
  });
}

async function transition(
  id: string,
  action: Extract<MemoryAction, "archive" | "restore" | "delete">,
  target: LifecycleStatus,
  commandType: CommandType,
  actor = DEFAULT_ACTOR
): Promise<MemoryCrudResult> {
  const check = await validateTransition(id, action);
  if (!check.ok) return reject(check.errors);
  const current = (await findById(id))!;
  const previousState = cloneRecord(current)!;

  return commit({
    commandType,
    action,
    memoryId: id,
    actor,
    previousState,
    payload: { id },
    mutate: () => setStatus(id, target),
  });
}

export function archiveMemory(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<MemoryCrudResult> {
  return transition(id, "archive", "archived", "memory.archive", actor);
}

export function restoreMemory(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<MemoryCrudResult> {
  return transition(id, "restore", "active", "memory.restore", actor);
}

export function deleteMemory(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<MemoryCrudResult> {
  return transition(id, "delete", "deleted", "memory.delete", actor);
}
