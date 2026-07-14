/*
 * Workflow CRUD — mutations.
 */

import { dispatchCommand } from "@/features/commands/dispatcher";
import type { CommandType } from "@/features/commands/pipeline";
import type { LifecycleStatus } from "@/features/persistence";
import { recordAudit } from "./workflow-audit";
import { recordHistory } from "./workflow-history";
import { findById, insert, setStatus, update } from "./workflow-repository";
import { trackMutation, trackValidationFailure } from "./workflow-telemetry";
import { slugify, validateCreate, validateTransition, validateUpdate } from "./workflow-validator";
import type {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowAction,
  WorkflowCrudRecord,
  WorkflowCrudResult,
} from "./types";

const DEFAULT_ACTOR = "Director";

function reject(errors: string[]): WorkflowCrudResult {
  trackValidationFailure();
  return { ok: false, errors };
}

function cloneRecord(record: WorkflowCrudRecord | undefined): WorkflowCrudRecord | undefined {
  return record
    ? {
        ...record,
        steps: [...record.steps],
        assignedAgents: [...record.assignedAgents],
        dependencies: [...record.dependencies],
      }
    : undefined;
}

async function commit(params: {
  commandType: CommandType;
  action: WorkflowAction;
  workflowId: string;
  actor: string;
  previousState: WorkflowCrudRecord | null;
  payload: Record<string, unknown>;
  mutate: () => Promise<WorkflowCrudRecord | undefined>;
}): Promise<WorkflowCrudResult> {
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
      errors: [`Workflow "${params.workflowId}" could not be mutated.`],
      command,
    };
  }

  recordAudit({
    commandId: command.id,
    workflowId: record.id,
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
    workflowId: record.id,
    action: params.action,
    timestamp: command.timestamp,
    actor: params.actor,
    ok: true,
  });

  return { ok: true, errors: [], record, command };
}

export async function createWorkflow(
  input: CreateWorkflowInput,
  actor = DEFAULT_ACTOR
): Promise<WorkflowCrudResult> {
  const id = input.slug?.trim() || slugify(input.name ?? "");
  const validation = await validateCreate(input, id);
  if (!validation.ok) return reject(validation.errors);

  const now = new Date().toISOString();
  const record: WorkflowCrudRecord = {
    id,
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description.trim(),
    department: input.department.trim(),
    category: input.category.trim(),
    owner: input.owner.trim(),
    status: input.status,
    version: input.version.trim(),
    trigger: input.trigger.trim(),
    steps: input.steps.map((item) => item.trim()).filter(Boolean),
    assignedAgents: input.assignedAgents.map((item) => item.trim()).filter(Boolean),
    dependencies: input.dependencies.map((item) => item.trim()).filter(Boolean),
    approvalPolicy: input.approvalPolicy.trim(),
    executionMode: input.executionMode.trim(),
    retryPolicy: input.retryPolicy.trim(),
    timeout: input.timeout,
    runtime: input.runtime.trim(),
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
    updatedBy: actor,
    lifecycleStatus: "active",
    ownerAgent: input.ownerAgent?.trim() || input.assignedAgents[0],
    successRate: input.successRate ?? 100,
    runsToday: input.runsToday ?? 0,
    lastRun: input.lastRun?.trim() || "just now",
  };

  return commit({
    commandType: "workflow.create",
    action: "create",
    workflowId: id,
    actor,
    previousState: null,
    payload: { id, name: record.name, slug: record.slug, trigger: record.trigger },
    mutate: async () => {
      await insert(record);
      return record;
    },
  });
}

export async function updateWorkflow(
  id: string,
  input: UpdateWorkflowInput,
  actor = DEFAULT_ACTOR
): Promise<WorkflowCrudResult> {
  const validation = await validateUpdate(id, input);
  if (!validation.ok) return reject(validation.errors);
  const transition = await validateTransition(id, "update");
  if (!transition.ok) return reject(transition.errors);

  const current = (await findById(id))!;
  const previousState = cloneRecord(current)!;
  return commit({
    commandType: "workflow.update",
    action: "update",
    workflowId: id,
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
        trigger: input.trigger?.trim() ?? current.trigger,
        steps: input.steps?.map((item) => item.trim()).filter(Boolean) ?? current.steps,
        assignedAgents:
          input.assignedAgents?.map((item) => item.trim()).filter(Boolean) ?? current.assignedAgents,
        dependencies:
          input.dependencies?.map((item) => item.trim()).filter(Boolean) ?? current.dependencies,
        approvalPolicy: input.approvalPolicy?.trim() ?? current.approvalPolicy,
        executionMode: input.executionMode?.trim() ?? current.executionMode,
        retryPolicy: input.retryPolicy?.trim() ?? current.retryPolicy,
        timeout: input.timeout ?? current.timeout,
        runtime: input.runtime?.trim() ?? current.runtime,
        updatedBy: actor,
        ownerAgent: input.ownerAgent?.trim() ?? current.ownerAgent,
        successRate: input.successRate ?? current.successRate,
        runsToday: input.runsToday ?? current.runsToday,
        lastRun: input.lastRun?.trim() ?? current.lastRun,
      }),
  });
}

async function transition(
  id: string,
  action: Extract<WorkflowAction, "archive" | "restore" | "delete">,
  target: LifecycleStatus,
  commandType: CommandType,
  actor = DEFAULT_ACTOR
): Promise<WorkflowCrudResult> {
  const check = await validateTransition(id, action);
  if (!check.ok) return reject(check.errors);
  const current = (await findById(id))!;
  const previousState = cloneRecord(current)!;

  return commit({
    commandType,
    action,
    workflowId: id,
    actor,
    previousState,
    payload: { id },
    mutate: () => setStatus(id, target),
  });
}

export function archiveWorkflow(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<WorkflowCrudResult> {
  return transition(id, "archive", "archived", "workflow.archive", actor);
}

export function restoreWorkflow(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<WorkflowCrudResult> {
  return transition(id, "restore", "active", "workflow.restore", actor);
}

export function deleteWorkflow(
  id: string,
  actor = DEFAULT_ACTOR
): Promise<WorkflowCrudResult> {
  return transition(id, "delete", "deleted", "workflow.delete", actor);
}
