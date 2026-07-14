/*
 * Agent CRUD — validator.
 */

import { providerById } from "@/features/provider-framework/provider-registry";
import { findAll, findById } from "./agent-repository";
import type {
  AgentAction,
  CreateAgentInput,
  UpdateAgentInput,
  ValidationResult,
} from "./types";
import type { LifecycleStatus } from "@/features/persistence";

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

function validateProvider(provider: string | undefined, errors: string[]): void {
  if (!provider || !providerById(provider)) {
    errors.push(`Provider "${provider ?? "unknown"}" is not registered.`);
  }
}

export async function validateCreate(
  input: CreateAgentInput,
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
  requiredString(input.model, "Model", errors);
  requiredString(input.runtime, "Runtime", errors);
  requiredString(input.memory, "Memory", errors);
  requiredString(input.knowledge, "Knowledge", errors);
  requiredList(input.capabilities, "Capabilities", errors);
  validateProvider(input.provider, errors);

  if (!id) errors.push("Agent id is required.");
  if (input.slug && slugify(input.slug) !== input.slug.trim()) {
    errors.push("Slug must be lowercase kebab-case.");
  }
  if (id && (await findById(id))) errors.push(`An agent with id "${id}" already exists.`);

  const normalizedName = input.name.trim().toLowerCase();
  const normalizedSlug = input.slug.trim().toLowerCase();
  const records = await findAll();
  if (records.some((record) => record.name.toLowerCase() === normalizedName)) {
    errors.push(`An agent named "${input.name.trim()}" already exists.`);
  }
  if (records.some((record) => record.slug.toLowerCase() === normalizedSlug)) {
    errors.push(`An agent with slug "${input.slug.trim()}" already exists.`);
  }

  return errors.length ? { ok: false, errors } : ok();
}

export async function validateUpdate(
  id: string,
  input: UpdateAgentInput
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Agent "${id}" not found.`);

  const errors: string[] = [];
  if (input.name !== undefined && input.name.trim().length === 0) errors.push("Name cannot be empty.");
  if (input.slug !== undefined && input.slug.trim().length === 0) errors.push("Slug cannot be empty.");
  if (input.description !== undefined && input.description.trim().length === 0) {
    errors.push("Description cannot be empty.");
  }
  if (input.slug && slugify(input.slug) !== input.slug.trim()) {
    errors.push("Slug must be lowercase kebab-case.");
  }
  const records = await findAll();
  if (
    input.name &&
    records.some(
      (record) =>
        record.id !== id && record.name.toLowerCase() === input.name!.trim().toLowerCase()
    )
  ) {
    errors.push(`An agent named "${input.name.trim()}" already exists.`);
  }
  if (
    input.slug &&
    records.some(
      (record) =>
        record.id !== id && record.slug.toLowerCase() === input.slug!.trim().toLowerCase()
    )
  ) {
    errors.push(`An agent with slug "${input.slug.trim()}" already exists.`);
  }
  if (input.provider !== undefined) validateProvider(input.provider, errors);
  if (input.capabilities !== undefined && input.capabilities.length === 0) {
    errors.push("Capabilities are required.");
  }

  return errors.length ? { ok: false, errors } : ok();
}

const allowed: Record<AgentAction, LifecycleStatus[]> = {
  create: [],
  update: ["active", "archived"],
  archive: ["active"],
  restore: ["archived", "deleted"],
  delete: ["active", "archived"],
};

export async function validateTransition(
  id: string,
  action: AgentAction
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Agent "${id}" not found.`);
  const from = current.lifecycleStatus;
  if (!allowed[action].includes(from)) {
    return fail(`Cannot ${action} an agent that is currently "${from}".`);
  }
  return ok();
}
