import type { RegistryCrudRecord } from "@/features/registry-crud/types";
import { postgresPersistenceError } from "./postgres-errors";
import type { LifecycleStatus, PersistenceOperation } from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LIFECYCLE_STATUSES = new Set<LifecycleStatus>([
  "active",
  "archived",
  "deleted",
]);

export interface RegistryPostgresRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string | null;
  readonly owner: string | null;
  readonly health: number;
  readonly total_records: number;
  readonly lifecycle_status: string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
}

export interface RegistryPostgresWriteRow {
  readonly tenantId: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly owner: string;
  readonly health: number;
  readonly totalRecords: number;
  readonly lifecycleStatus: LifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function invalidMapping(detail: string, operation?: PersistenceOperation): never {
  throw postgresPersistenceError({
    code: "PERSISTENCE_INVALID_RECORD_MAPPING",
    collection: "registries",
    operation,
    detail,
  });
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return invalidMapping(`Registry ${field} must be a non-empty string.`);
  }
  return value;
}

function integer(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return invalidMapping(`Registry ${field} must be an integer.`);
  }
  return value;
}

function isoTimestamp(value: unknown, field: string): string {
  if (!(typeof value === "string" || value instanceof Date)) {
    return invalidMapping(`Registry ${field} must be a timestamp.`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return invalidMapping(`Registry ${field} must be a valid timestamp.`);
  }
  return parsed.toISOString();
}

export function requireRegistryTenantId(
  tenantId: string | undefined,
  operation: PersistenceOperation,
): string {
  if (!tenantId) {
    throw postgresPersistenceError({
      code: "PERSISTENCE_TENANT_REQUIRED",
      collection: "registries",
      operation,
      detail: "PostgreSQL registry operations require PersistenceContext.tenantId.",
    });
  }
  if (!UUID_PATTERN.test(tenantId)) {
    return invalidMapping("Registry tenantId must be a UUID.", operation);
  }
  return tenantId;
}

export function encodeRegistryRecord(
  record: RegistryCrudRecord,
  tenantId: string,
): RegistryPostgresWriteRow {
  const lifecycleStatus = requiredString(
    record.lifecycleStatus,
    "lifecycleStatus",
  ) as LifecycleStatus;
  if (!LIFECYCLE_STATUSES.has(lifecycleStatus)) {
    return invalidMapping("Registry lifecycleStatus is unsupported.");
  }

  return {
    tenantId: requireRegistryTenantId(tenantId, "save"),
    slug: requiredString(record.id, "id"),
    title: requiredString(record.title, "title"),
    description: requiredString(record.description, "description"),
    owner: requiredString(record.owner, "owner"),
    health: integer(record.health, "health"),
    totalRecords: integer(record.totalRecords, "totalRecords"),
    lifecycleStatus,
    createdAt: isoTimestamp(record.createdAt, "createdAt"),
    updatedAt: isoTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function decodeRegistryRow(
  row: RegistryPostgresRow,
  expectedTenantId: string,
): RegistryCrudRecord {
  if (row.tenant_id !== expectedTenantId) {
    throw postgresPersistenceError({
      code: "PERSISTENCE_TENANT_MISMATCH",
      collection: "registries",
      detail: "Registry row tenant does not match the requested tenant context.",
    });
  }
  if (!UUID_PATTERN.test(row.id)) {
    return invalidMapping("Registry physical id must be a UUID.");
  }
  if (row.description === null || row.owner === null) {
    return invalidMapping(
      "Registry rows with null description or owner are outside the supported row invariant.",
    );
  }

  const lifecycleStatus = requiredString(
    row.lifecycle_status,
    "lifecycleStatus",
  ) as LifecycleStatus;
  if (!LIFECYCLE_STATUSES.has(lifecycleStatus)) {
    return invalidMapping("Registry lifecycleStatus is unsupported.");
  }

  return {
    id: requiredString(row.slug, "slug"),
    title: requiredString(row.title, "title"),
    description: requiredString(row.description, "description"),
    owner: requiredString(row.owner, "owner"),
    health: integer(row.health, "health"),
    totalRecords: integer(row.total_records, "totalRecords"),
    lifecycleStatus,
    createdAt: isoTimestamp(row.created_at, "createdAt"),
    updatedAt: isoTimestamp(row.updated_at, "updatedAt"),
  };
}
