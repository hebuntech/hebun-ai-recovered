/*
 * Agent CRUD — mutations.
 */

import { dispatchCommand } from "@/features/commands/dispatcher";
import type { CommandType } from "@/features/commands/pipeline";
import type { LifecycleStatus } from "@/features/persistence";
import { findById, insert, setStatus, update } from "./agent-repository";
import { recordAudit } from "./agent-audit";
import { recordHistory } from "./agent-history";
import { trackMutation, trackValidationFailure } from "./agent-telemetry";
import { slugify, validateCreate, validateTransition, validateUpdate } from "./agent-validator";
import type {
  AgentAction,
  AgentCrudRecord,
  AgentCrudResult,
  CreateAgentInput,
  UpdateAgentInput,
} from "./types";

const DEFAULT_ACTOR = "Director";

function reject(errors: string[]): AgentCrudResult {
  trackValidationFailure();
  return { ok: false, errors };
}

function cloneRecord(record: AgentCrudRecord | undefined): AgentCrudRecord | undefined {
  return record ? { ...record, capabilities: [...record.capabilities], tools: [...record.tools], permissions: [...record.permissions] } : undefined;
}

async function commit(params: {
  commandType: CommandType;
  action: AgentAction;
  agentId: string;
  actor: string;
  previousState: AgentCrudRecord | null;
  payload: Record<string, unknown>;
  mutate: () => Promise<AgentCrudRecord | undefined>;
}): Promise<AgentCrudResult> {
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
    return { ok: false, errors: [`Agent "${params.agentId}" could not be mutated.`], command };
  }

  recordAudit({
    commandId: command.id,
    agentId: record.id,
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
    agentId: record.id,
    action: params.action,
    timestamp: command.timestamp,
    actor: params.actor,
    ok: true,
  });

  return { ok: true, errors: [], record, command };
}

export async function createAgent(
  input: CreateAgentInput,
  actor = DEFAULT_ACTOR
): Promise<AgentCrudResult> {
  const id = input.slug?.trim() || slugify(input.name ?? "");
  const validation = await validateCreate(input, id);
  if (!validation.ok) return reject(validation.errors);

  const now = new Date().toISOString();
  const record: AgentCrudRecord = {
    id,
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description.trim(),
    department: input.department.trim(),
    category: input.category.trim(),
    owner: input.owner.trim(),
    status: input.status,
    version: input.version.trim(),
    capabilities: input.capabilities.map((item) => item.trim()).filter(Boolean),
    provider: input.provider.trim(),
    model: input.model.trim(),
    tools: input.tools.map((item) => item.trim()).filter(Boolean),
    permissions: input.permissions.map((item) => item.trim()).filter(Boolean),
    runtime: input.runtime.trim(),
    memory: input.memory.trim(),
    knowledge: input.knowledge.trim(),
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
    updatedBy: actor,
    lifecycleStatus: "active",
    role: input.role?.trim() || input.category.trim(),
    tasksToday: input.tasksToday ?? 0,
    costToday: input.costToday ?? 0,
    lastActive: input.lastActive?.trim() || "just now",
  };

  return commit({
    commandType: "agent.create",
    action: "create",
    agentId: id,
    actor,
    previousState: null,
    payload: { id, name: record.name, slug: record.slug, provider: record.provider },
    mutate: async () => {
      await insert(record);
      return record;
    },
  });
}

export async function updateAgent(
  id: string,
  input: UpdateAgentInput,
  actor = DEFAULT_ACTOR
): Promise<AgentCrudResult> {
  const validation = await validateUpdate(id, input);
  if (!validation.ok) return reject(validation.errors);
  const transition = await validateTransition(id, "update");
  if (!transition.ok) return reject(transition.errors);

  const current = (await findById(id))!;
  const previousState = cloneRecord(current)!;
  return commit({
    commandType: "agent.update",
    action: "update",
    agentId: id,
    actor,
    previousState,
    payload: { id, ...input },
    mutate: () =>
      update(id, {
        name: input.name?.trim() ?? current.name,
        slug: input.slug?.trim() ?? current.slug,
        description: input.description?.trim() ?? current.description,
        department: input.department?.trim() ?? current.department,
        category: input.category?.trim() ?? current.category,
        owner: input.owner?.trim() ?? current.owner,
        status: input.status ?? current.status,
        version: input.version?.trim() ?? current.version,
        capabilities: input.capabilities?.map((item) => item.trim()).filter(Boolean) ?? current.capabilities,
        provider: input.provider?.trim() ?? current.provider,
        model: input.model?.trim() ?? current.model,
        tools: input.tools?.map((item) => item.trim()).filter(Boolean) ?? current.tools,
        permissions: input.permissions?.map((item) => item.trim()).filter(Boolean) ?? current.permissions,
        runtime: input.runtime?.trim() ?? current.runtime,
        memory: input.memory?.trim() ?? current.memory,
        knowledge: input.knowledge?.trim() ?? current.knowledge,
        updatedBy: actor,
        role: input.role?.trim() ?? current.role,
        tasksToday: input.tasksToday ?? current.tasksToday,
        costToday: input.costToday ?? current.costToday,
        lastActive: input.lastActive?.trim() ?? current.lastActive,
      }),
  });
}

async function transition(
  id: string,
  action: Extract<AgentAction, "archive" | "restore" | "delete">,
  target: LifecycleStatus,
  commandType: CommandType,
  actor = DEFAULT_ACTOR
): Promise<AgentCrudResult> {
  const check = await validateTransition(id, action);
  if (!check.ok) return reject(check.errors);
  const current = (await findById(id))!;
  const previousState = cloneRecord(current)!;

  return commit({
    commandType,
    action,
    agentId: id,
    actor,
    previousState,
    payload: { id },
    mutate: () => setStatus(id, target),
  });
}

export function archiveAgent(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<AgentCrudResult> {
  return transition(id, "archive", "archived", "agent.archive", actor);
}

export function restoreAgent(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<AgentCrudResult> {
  return transition(id, "restore", "active", "agent.restore", actor);
}

export function deleteAgent(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<AgentCrudResult> {
  return transition(id, "delete", "deleted", "agent.delete", actor);
}
