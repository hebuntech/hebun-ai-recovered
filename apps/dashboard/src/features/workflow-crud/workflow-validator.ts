/*
 * Workflow CRUD — validator.
 */

import { listAll as listAgents } from "@/features/agent-crud";
import type { LifecycleStatus } from "@/features/persistence";
import { findAll, findById } from "./workflow-repository";
import type {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  ValidationResult,
  WorkflowAction,
} from "./types";

function ok(): ValidationResult {
  return { ok: true, errors: [] };
}

function fail(...errors: string[]): ValidationResult {
  return { ok: false, errors };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requiredString(value: string | undefined, label: string, errors: string[]): void {
  if (!value || value.trim().length === 0) errors.push(`${label} is required.`);
}

function requiredList(value: string[] | undefined, label: string, errors: string[]): void {
  if (!value || value.length === 0) errors.push(`${label} is required.`);
}

async function validAgentIds(): Promise<Set<string>> {
  return new Set((await listAgents()).map((agent) => agent.id));
}

async function validateAssignedAgents(
  assignedAgents: string[] | undefined,
  errors: string[],
  currentWorkflowId?: string
): Promise<void> {
  if (!assignedAgents) return;
  const validAgents = await validAgentIds();
  const invalid = assignedAgents.filter((id) => !validAgents.has(id));
  if (invalid.length) {
    errors.push(`Assigned agents not found: ${invalid.join(", ")}.`);
  }
  if (currentWorkflowId && assignedAgents.includes(currentWorkflowId)) {
    errors.push("A workflow cannot assign itself as an agent.");
  }
}

async function validateDependencies(
  dependencies: string[] | undefined,
  errors: string[],
  currentWorkflowId?: string
): Promise<void> {
  if (!dependencies) return;
  const existingIds = new Set((await findAll()).map((record) => record.id));
  const invalid = dependencies.filter((id) => !existingIds.has(id));
  if (invalid.length) {
    errors.push(`Workflow dependencies not found: ${invalid.join(", ")}.`);
  }
  if (currentWorkflowId && dependencies.includes(currentWorkflowId)) {
    errors.push("A workflow cannot depend on itself.");
  }
}

export async function validateCreate(
  input: CreateWorkflowInput,
  id: string
): Promise<ValidationResult> {
  const errors: string[] = [];

  requiredString(input.name, "Name", errors);
  requiredString(input.slug, "Slug", errors);
  requiredString(input.description, "Description", errors);
  requiredString(input.department, "Department", errors);
  requiredString(input.category, "Category", errors);
  requiredString(input.owner, "Owner", errors);
  requiredString(input.version, "Version", errors);
  requiredString(input.trigger, "Trigger", errors);
  requiredString(input.approvalPolicy, "Approval policy", errors);
  requiredString(input.executionMode, "Execution mode", errors);
  requiredString(input.retryPolicy, "Retry policy", errors);
  requiredString(input.runtime, "Runtime", errors);
  requiredList(input.steps, "Steps", errors);
  requiredList(input.assignedAgents, "Assigned agents", errors);

  if (!id) errors.push("Workflow id is required.");
  if (input.slug && slugify(input.slug) !== input.slug.trim()) {
    errors.push("Slug must be lowercase kebab-case.");
  }
  if (input.timeout <= 0) errors.push("Timeout must be greater than 0.");
  if (id && (await findById(id))) errors.push(`A workflow with id "${id}" already exists.`);

  const normalizedName = input.name.trim().toLowerCase();
  const normalizedSlug = input.slug.trim().toLowerCase();
  const records = await findAll();
  if (records.some((record) => record.name.toLowerCase() === normalizedName)) {
    errors.push(`A workflow named "${input.name.trim()}" already exists.`);
  }
  if (records.some((record) => record.slug.toLowerCase() === normalizedSlug)) {
    errors.push(`A workflow with slug "${input.slug.trim()}" already exists.`);
  }

  await validateAssignedAgents(input.assignedAgents, errors);
  await validateDependencies(input.dependencies, errors, id);

  return errors.length ? { ok: false, errors } : ok();
}

export async function validateUpdate(
  id: string,
  input: UpdateWorkflowInput
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Workflow "${id}" not found.`);

  const errors: string[] = [];
  if (input.name !== undefined && input.name.trim().length === 0) errors.push("Name cannot be empty.");
  if (input.slug !== undefined && input.slug.trim().length === 0) errors.push("Slug cannot be empty.");
  if (input.description !== undefined && input.description.trim().length === 0) {
    errors.push("Description cannot be empty.");
  }
  if (input.slug && slugify(input.slug) !== input.slug.trim()) {
    errors.push("Slug must be lowercase kebab-case.");
  }
  if (input.timeout !== undefined && input.timeout <= 0) {
    errors.push("Timeout must be greater than 0.");
  }
  const records = await findAll();
  if (
    input.name &&
    records.some(
      (record) => record.id !== id && record.name.toLowerCase() === input.name!.trim().toLowerCase()
    )
  ) {
    errors.push(`A workflow named "${input.name.trim()}" already exists.`);
  }
  if (
    input.slug &&
    records.some(
      (record) => record.id !== id && record.slug.toLowerCase() === input.slug!.trim().toLowerCase()
    )
  ) {
    errors.push(`A workflow with slug "${input.slug.trim()}" already exists.`);
  }

  await validateAssignedAgents(input.assignedAgents, errors, id);
  await validateDependencies(input.dependencies, errors, id);

  return errors.length ? { ok: false, errors } : ok();
}

const allowed: Record<WorkflowAction, LifecycleStatus[]> = {
  create: [],
  update: ["active", "archived"],
  archive: ["active"],
  restore: ["archived", "deleted"],
  delete: ["active", "archived"],
};

export async function validateTransition(
  id: string,
  action: WorkflowAction
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Workflow "${id}" not found.`);
  const from = current.lifecycleStatus;
  if (!allowed[action].includes(from)) {
    return fail(`Cannot ${action} a workflow that is currently "${from}".`);
  }
  return ok();
}
