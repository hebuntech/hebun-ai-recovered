/*
 * Registry CRUD — validator.
 *
 * Deterministic precondition checks: duplicate ids, duplicate names, required
 * fields, and valid lifecycle transitions.
 */

import { findAll, findById } from "./registry-repository";
import type {
  CreateRegistryInput,
  LifecycleStatus,
  RegistryAction,
  UpdateRegistryInput,
  ValidationResult,
} from "./types";

function ok(): ValidationResult {
  return { ok: true, errors: [] };
}

function fail(...errors: string[]): ValidationResult {
  return { ok: false, errors };
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function validateCreate(
  input: CreateRegistryInput,
  id: string
): Promise<ValidationResult> {
  const errors: string[] = [];
  if (!input.title || input.title.trim().length === 0) errors.push("Title is required.");
  if (!id) errors.push("A valid id could not be derived from the title.");
  if (id && (await findById(id))) errors.push(`A registry with id "${id}" already exists.`);
  const records = await findAll();
  if (
    input.title &&
    records.some((r) => r.title.toLowerCase() === input.title.trim().toLowerCase())
  ) {
    errors.push(`A registry named "${input.title.trim()}" already exists.`);
  }
  return errors.length ? { ok: false, errors } : ok();
}

export async function validateUpdate(
  id: string,
  input: UpdateRegistryInput
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Registry "${id}" not found.`);
  if (input.title !== undefined && input.title.trim().length === 0) {
    return fail("Title cannot be empty.");
  }
  const records = await findAll();
  if (
    input.title &&
    records.some(
      (r) => r.id !== id && r.title.toLowerCase() === input.title!.trim().toLowerCase()
    )
  ) {
    return fail(`A registry named "${input.title.trim()}" already exists.`);
  }
  return ok();
}

const allowed: Record<RegistryAction, LifecycleStatus[]> = {
  create: [],
  update: ["active", "archived"],
  archive: ["active"],
  restore: ["archived", "deleted"],
  delete: ["active", "archived"],
};

export async function validateTransition(
  id: string,
  action: RegistryAction
): Promise<ValidationResult> {
  const current = await findById(id);
  if (!current) return fail(`Registry "${id}" not found.`);
  const from = current.lifecycleStatus;
  if (!allowed[action].includes(from)) {
    return fail(`Cannot ${action} a registry that is currently "${from}".`);
  }
  return ok();
}
