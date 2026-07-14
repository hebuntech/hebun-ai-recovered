/*
 * Memory CRUD — validator.
 */

import { listAll as listAgents } from "@/features/agent-crud";
import { listAll as listWorkflows } from "@/features/workflow-crud";
import type { LifecycleStatus } from "@/features/persistence";
import { findAll, findById } from "./memory-repository";
import type {
  CreateMemoryInput,
  MemoryAction,
  MemoryOwnerType,
  UpdateMemoryInput,
  ValidationResult,
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

async function validOwners(ownerType: MemoryOwnerType): Promise<Set<string>> {
  if (ownerType === "agent") {
    return new Set((await listAgents()).map((agent) => agent.id));
  }

  if (ownerType === "workflow") {
    return new Set((await listWorkflows()).map((workflow) => workflow.id));
  }

  if (ownerType === "department") {
    return new Set(
      (await listAgents()).map((agent) => agent.department.toLowerCase())
    );
  }

  return new Set([
    "director",
    "governance-core",
    "audit",
    "planning-engine",
    "risk-engine",
    "executive-approvals",
    "legal",
    "sales",
  ]);
}

async function validateOwner(
  ownerType: MemoryOwnerType | undefined,
  ownerId: string | undefined,
  errors: string[]
): Promise<void> {
  if (!ownerType) {
    errors.push("Owner type is required.");
    return;
  }

  if (!ownerId || ownerId.trim().length === 0) {
    errors.push("Owner id is required.");
    return;
  }

  const normalizedOwnerId = ownerId.trim().toLowerCase();
  if (!(await validOwners(ownerType)).has(normalizedOwnerId)) {
    errors.push(`Owner "${ownerId}" is invalid for owner type "${ownerType}".`);
  }
}

export async function validateCreate(
  input: CreateMemoryInput,
  id: string
): Promise<ValidationResult> {
  const errors: string[] = [];

  requiredString(input.title, "Title", errors);
  requiredString(input.slug, "Slug", errors);
  requiredString(input.description, "Description", errors);
  requiredString(input.ownerId, "Owner id", errors);
  requiredString(input.source, "Source", errors);
  requiredString(input.summary, "Summary", errors);
  requiredString(input.version, "Version", errors);

  await validateOwner(input.ownerType, input.ownerId, errors);

  if (!id) errors.push("Memory id is required.");
  if (input.slug && slugify(input.slug) !== input.slug.trim()) {
    errors.push("Slug must be lowercase kebab-case.");
  }
  if (input.tags.length === 0) errors.push("Tags are required.");
  if (input.confidence < 0 || input.confidence > 100) {
    errors.push("Confidence must be between 0 and 100.");
  }
  if (id && (await findById(id))) errors.push(`A memory with id "${id}" already exists.`);

  const normalizedTitle = input.title.trim().toLowerCase();
  const normalizedSlug = input.slug.trim().toLowerCase();
  const records = await findAll();
  if (records.some((record) => record.title.toLowerCase() === normalizedTitle)) {
    errors.push(`A memory titled "${input.title.trim()}" already exists.`);
  }
  if (records.some((record) => record.slug.toLowerCase() === normalizedSlug)) {
    errors.push(`A memory with slug "${input.slug.trim()}" already exists.`);
  }

  return errors.length ? { ok: false, errors } : ok();
}

export async function validateUpdate(
  id: string,
  input: UpdateMemoryInput
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Memory "${id}" not found.`);

  const errors: string[] = [];
  if (input.title !== undefined && input.title.trim().length === 0) errors.push("Title cannot be empty.");
  if (input.slug !== undefined && input.slug.trim().length === 0) errors.push("Slug cannot be empty.");
  if (input.description !== undefined && input.description.trim().length === 0) {
    errors.push("Description cannot be empty.");
  }
  if (input.summary !== undefined && input.summary.trim().length === 0) {
    errors.push("Summary cannot be empty.");
  }
  if (input.slug && slugify(input.slug) !== input.slug.trim()) {
    errors.push("Slug must be lowercase kebab-case.");
  }
  if (input.tags !== undefined && input.tags.length === 0) {
    errors.push("Tags are required.");
  }
  if (
    input.confidence !== undefined &&
    (input.confidence < 0 || input.confidence > 100)
  ) {
    errors.push("Confidence must be between 0 and 100.");
  }
  const records = await findAll();
  if (
    input.title &&
    records.some(
      (record) => record.id !== id && record.title.toLowerCase() === input.title!.trim().toLowerCase()
    )
  ) {
    errors.push(`A memory titled "${input.title.trim()}" already exists.`);
  }
  if (
    input.slug &&
    records.some(
      (record) => record.id !== id && record.slug.toLowerCase() === input.slug!.trim().toLowerCase()
    )
  ) {
    errors.push(`A memory with slug "${input.slug.trim()}" already exists.`);
  }

  if (input.ownerType !== undefined || input.ownerId !== undefined) {
    await validateOwner(
      input.ownerType ?? current.ownerType,
      input.ownerId ?? current.ownerId,
      errors
    );
  }

  return errors.length ? { ok: false, errors } : ok();
}

const allowed: Record<MemoryAction, LifecycleStatus[]> = {
  create: [],
  update: ["active", "archived"],
  archive: ["active"],
  restore: ["archived", "deleted"],
  delete: ["active", "archived"],
};

export async function validateTransition(
  id: string,
  action: MemoryAction
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Memory "${id}" not found.`);
  const from = current.lifecycleStatus;
  if (!allowed[action].includes(from)) {
    return fail(`Cannot ${action} a memory that is currently "${from}".`);
  }
  return ok();
}
