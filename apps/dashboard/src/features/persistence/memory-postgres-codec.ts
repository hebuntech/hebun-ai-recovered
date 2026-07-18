import type {
  MemoryCrudRecord,
  MemoryImportance,
  MemoryOwnerType,
  MemoryStatus,
  MemoryType,
} from "@/features/memory-crud/types";
import { postgresPersistenceError } from "./postgres-errors";
import type { LifecycleStatus, PersistenceOperation } from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const MEMORY_ENVELOPE_KEY = "hebunMemoryCrudV1";
const ENVELOPE_FIELDS = new Set([
  "schemaVersion",
  "logicalId",
  "title",
  "slug",
  "memoryType",
  "ownerType",
  "ownerId",
  "importance",
  "confidence",
  "source",
  "tags",
  "summary",
  "status",
  "version",
  "createdBy",
  "updatedBy",
]);
const MEMORY_TYPES = new Set<MemoryType>([
  "Conversation",
  "Decision",
  "Fact",
  "Procedure",
  "Policy",
  "Customer",
  "Project",
  "Organization",
  "Agent",
  "Workflow",
]);
const OWNER_TYPES = new Set<MemoryOwnerType>([
  "agent",
  "workflow",
  "department",
  "organization",
]);
const IMPORTANCE_VALUES = new Set<MemoryImportance>([
  "critical",
  "high",
  "medium",
  "low",
]);
const MEMORY_STATUSES = new Set<MemoryStatus>(["fresh", "stable", "review"]);
const LIFECYCLE_STATUSES = new Set<LifecycleStatus>([
  "active",
  "archived",
  "deleted",
]);

interface MemoryCodecEnvelope {
  readonly schemaVersion: 1;
  readonly logicalId: string;
  readonly title: string;
  readonly slug: string;
  readonly memoryType: MemoryType;
  readonly ownerType: MemoryOwnerType;
  readonly ownerId: string;
  readonly importance: MemoryImportance;
  readonly confidence: number;
  readonly source: string;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly status: MemoryStatus;
  readonly version: string;
  readonly createdBy: string;
  readonly updatedBy: string;
}

export interface MemoryPostgresRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly content: string;
  readonly storage_metadata: unknown;
  readonly lifecycle_status: string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
}

export interface MemoryPostgresWriteRow {
  readonly tenantId: string;
  readonly logicalId: string;
  readonly content: string;
  readonly storageMetadataPatch: Record<
    typeof MEMORY_ENVELOPE_KEY,
    MemoryCodecEnvelope
  >;
  readonly lifecycleStatus: LifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function invalidMapping(detail: string, operation?: PersistenceOperation): never {
  throw postgresPersistenceError({
    code: "PERSISTENCE_INVALID_RECORD_MAPPING",
    collection: "memories",
    operation,
    detail,
  });
}

function plainObject(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return invalidMapping(`Memory ${field} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return invalidMapping(`Memory ${field} must be a non-empty string.`);
  }
  return value;
}

function enumValue<T extends string>(
  value: unknown,
  field: string,
  allowed: ReadonlySet<T>,
): T {
  const candidate = requiredString(value, field) as T;
  if (!allowed.has(candidate)) {
    return invalidMapping(`Memory ${field} is unsupported.`);
  }
  return candidate;
}

function confidence(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    return invalidMapping("Memory confidence must be a finite number from 0 to 100.");
  }
  return value;
}

function tags(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((entry) => typeof entry !== "string" || entry.length === 0)
  ) {
    return invalidMapping("Memory tags must be a non-empty string array.");
  }
  return [...value];
}

function isoTimestamp(value: unknown, field: string): string {
  if (!(typeof value === "string" || value instanceof Date)) {
    return invalidMapping(`Memory ${field} must be a timestamp.`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return invalidMapping(`Memory ${field} must be a valid timestamp.`);
  }
  return parsed.toISOString();
}

function decodeEnvelope(metadata: unknown): MemoryCodecEnvelope {
  const root = plainObject(metadata, "storage_metadata");
  const envelope = plainObject(
    root[MEMORY_ENVELOPE_KEY],
    `${MEMORY_ENVELOPE_KEY} envelope`,
  );
  const unknownFields = Object.keys(envelope).filter(
    (field) => !ENVELOPE_FIELDS.has(field),
  );
  if (unknownFields.length > 0) {
    return invalidMapping(
      `Memory codec envelope contains unsupported fields: ${unknownFields.join(", ")}.`,
    );
  }
  if (envelope.schemaVersion !== 1) {
    return invalidMapping("Memory codec envelope schemaVersion must be 1.");
  }

  return {
    schemaVersion: 1,
    logicalId: requiredString(envelope.logicalId, "logicalId"),
    title: requiredString(envelope.title, "title"),
    slug: requiredString(envelope.slug, "slug"),
    memoryType: enumValue(envelope.memoryType, "memoryType", MEMORY_TYPES),
    ownerType: enumValue(envelope.ownerType, "ownerType", OWNER_TYPES),
    ownerId: requiredString(envelope.ownerId, "ownerId"),
    importance: enumValue(
      envelope.importance,
      "importance",
      IMPORTANCE_VALUES,
    ),
    confidence: confidence(envelope.confidence),
    source: requiredString(envelope.source, "source"),
    tags: tags(envelope.tags),
    summary: requiredString(envelope.summary, "summary"),
    status: enumValue(envelope.status, "status", MEMORY_STATUSES),
    version: requiredString(envelope.version, "version"),
    createdBy: requiredString(envelope.createdBy, "createdBy"),
    updatedBy: requiredString(envelope.updatedBy, "updatedBy"),
  };
}

export function encodeMemoryRecord(
  record: MemoryCrudRecord,
  tenantId: string,
): MemoryPostgresWriteRow {
  if (!UUID_PATTERN.test(tenantId)) {
    return invalidMapping("Memory tenantId must be a UUID.", "save");
  }
  const envelope: MemoryCodecEnvelope = {
    schemaVersion: 1,
    logicalId: requiredString(record.id, "id"),
    title: requiredString(record.title, "title"),
    slug: requiredString(record.slug, "slug"),
    memoryType: enumValue(record.memoryType, "memoryType", MEMORY_TYPES),
    ownerType: enumValue(record.ownerType, "ownerType", OWNER_TYPES),
    ownerId: requiredString(record.ownerId, "ownerId"),
    importance: enumValue(record.importance, "importance", IMPORTANCE_VALUES),
    confidence: confidence(record.confidence),
    source: requiredString(record.source, "source"),
    tags: tags(record.tags),
    summary: requiredString(record.summary, "summary"),
    status: enumValue(record.status, "status", MEMORY_STATUSES),
    version: requiredString(record.version, "version"),
    createdBy: requiredString(record.createdBy, "createdBy"),
    updatedBy: requiredString(record.updatedBy, "updatedBy"),
  };

  return {
    tenantId,
    logicalId: envelope.logicalId,
    content: requiredString(record.description, "description"),
    storageMetadataPatch: { [MEMORY_ENVELOPE_KEY]: envelope },
    lifecycleStatus: enumValue(
      record.lifecycleStatus,
      "lifecycleStatus",
      LIFECYCLE_STATUSES,
    ),
    createdAt: isoTimestamp(record.createdAt, "createdAt"),
    updatedAt: isoTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function decodeMemoryRow(
  row: MemoryPostgresRow,
  expectedTenantId: string,
): MemoryCrudRecord {
  if (row.tenant_id !== expectedTenantId) {
    throw postgresPersistenceError({
      code: "PERSISTENCE_TENANT_MISMATCH",
      collection: "memories",
      detail: "Memory row tenant does not match the requested tenant context.",
    });
  }
  if (!UUID_PATTERN.test(row.id) || !UUID_PATTERN.test(row.tenant_id)) {
    return invalidMapping("Memory physical id and tenant id must be UUIDs.");
  }
  const envelope = decodeEnvelope(row.storage_metadata);

  return {
    id: envelope.logicalId,
    title: envelope.title,
    slug: envelope.slug,
    description: requiredString(row.content, "content"),
    memoryType: envelope.memoryType,
    ownerType: envelope.ownerType,
    ownerId: envelope.ownerId,
    importance: envelope.importance,
    confidence: envelope.confidence,
    source: envelope.source,
    tags: [...envelope.tags],
    summary: envelope.summary,
    status: envelope.status,
    version: envelope.version,
    createdAt: isoTimestamp(row.created_at, "createdAt"),
    updatedAt: isoTimestamp(row.updated_at, "updatedAt"),
    createdBy: envelope.createdBy,
    updatedBy: envelope.updatedBy,
    lifecycleStatus: enumValue(
      row.lifecycle_status,
      "lifecycleStatus",
      LIFECYCLE_STATUSES,
    ),
  };
}

export function decodeMemoryRows(
  rows: readonly MemoryPostgresRow[],
  expectedTenantId: string,
): MemoryCrudRecord[] {
  const records = rows.map((row) => decodeMemoryRow(row, expectedTenantId));
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_LOGICAL_ID_CONFLICT",
        collection: "memories",
        operation: "load",
        detail: `Duplicate Memory logical id "${record.id}" exists for the tenant.`,
      });
    }
    ids.add(record.id);
  }
  return records;
}
