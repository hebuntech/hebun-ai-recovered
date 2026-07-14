/*
 * Registry CRUD — mutations (write side).
 *
 * Every mutation goes through the Command Bus. The bus runs validation, policy,
 * authorization, simulation, audit, telemetry and history for the command; this
 * layer adds the deterministic in-memory registry mutation plus a registry-domain
 * audit / telemetry / history record. Nothing is persisted beyond the session.
 */

import { dispatchCommand } from "@/features/commands/dispatcher";
import type { CommandType } from "@/features/commands/pipeline";
import { findById, insert, setStatus, update } from "./registry-repository";
import { recordAudit } from "./registry-audit";
import { trackMutation, trackValidationFailure } from "./registry-telemetry";
import { recordHistory } from "./registry-history";
import {
  slugify,
  validateCreate,
  validateTransition,
  validateUpdate,
} from "./registry-validator";
import type {
  CreateRegistryInput,
  CrudResult,
  LifecycleStatus,
  RegistryAction,
  RegistryCrudRecord,
  UpdateRegistryInput,
} from "./types";

const DEFAULT_ACTOR = "Director";

function reject(errors: string[]): CrudResult {
  trackValidationFailure();
  return { ok: false, errors };
}

/* Dispatch the command, apply the mutation, and record audit/telemetry/history. */
async function commit(params: {
  commandType: CommandType;
  action: RegistryAction;
  registryId: string;
  actor: string;
  previousState: LifecycleStatus | null;
  payload: Record<string, unknown>;
  mutate: () => Promise<RegistryCrudRecord | undefined>;
}): Promise<CrudResult> {
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
    return { ok: false, errors: [`Registry "${params.registryId}" could not be mutated.`], command };
  }

  recordAudit({
    commandId: command.id,
    registryId: record.id,
    timestamp: command.timestamp,
    actor: params.actor,
    action: params.action,
    previousState: params.previousState,
    newState: record.lifecycleStatus,
    simulation: true,
  });
  trackMutation(params.action, command.telemetry.durationMs);
  recordHistory({
    commandId: command.id,
    registryId: record.id,
    action: params.action,
    timestamp: command.timestamp,
    actor: params.actor,
    ok: true,
  });

  return { ok: true, errors: [], record, command };
}

export async function createRegistry(
  input: CreateRegistryInput,
  actor = DEFAULT_ACTOR
): Promise<CrudResult> {
  const id = slugify(input.title ?? "");
  const validation = await validateCreate(input, id);
  if (!validation.ok) return reject(validation.errors);

  const now = new Date().toISOString();
  const record: RegistryCrudRecord = {
    id,
    title: input.title.trim(),
    description: input.description?.trim() || "New registry created via the Command Bus.",
    owner: input.owner?.trim() || actor,
    health: 100,
    totalRecords: 0,
    lifecycleStatus: "active",
    createdAt: now,
    updatedAt: now,
  };

  return commit({
    commandType: "registry.create",
    action: "create",
    registryId: id,
    actor,
    previousState: null,
    payload: { id, title: record.title },
    mutate: async () => {
      await insert(record);
      return record;
    },
  });
}

export async function updateRegistry(
  id: string,
  input: UpdateRegistryInput,
  actor = DEFAULT_ACTOR
): Promise<CrudResult> {
  const validation = await validateUpdate(id, input);
  if (!validation.ok) return reject(validation.errors);
  const transition = await validateTransition(id, "update");
  if (!transition.ok) return reject(transition.errors);

  const current = (await findById(id))!;
  return commit({
    commandType: "registry.update",
    action: "update",
    registryId: id,
    actor,
    previousState: current.lifecycleStatus,
    payload: { id, ...input },
    mutate: () =>
      update(id, {
        title: input.title?.trim() ?? current.title,
        description: input.description?.trim() ?? current.description,
        owner: input.owner?.trim() ?? current.owner,
      }),
  });
}

async function transition(
  id: string,
  action: Extract<RegistryAction, "archive" | "restore" | "delete">,
  target: LifecycleStatus,
  commandType: CommandType,
  actor = DEFAULT_ACTOR
): Promise<CrudResult> {
  const check = await validateTransition(id, action);
  if (!check.ok) return reject(check.errors);
  const current = (await findById(id))!;
  return commit({
    commandType,
    action,
    registryId: id,
    actor,
    previousState: current.lifecycleStatus,
    payload: { id },
    mutate: () => setStatus(id, target),
  });
}

export function archiveRegistry(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<CrudResult> {
  return transition(id, "archive", "archived", "registry.archive", actor);
}

export function restoreRegistry(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<CrudResult> {
  return transition(id, "restore", "active", "registry.restore", actor);
}

export function deleteRegistry(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<CrudResult> {
  return transition(id, "delete", "deleted", "registry.delete", actor);
}
