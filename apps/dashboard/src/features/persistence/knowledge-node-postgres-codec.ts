import type {
  KnowledgeImportance,
  KnowledgeNodeRecord,
  KnowledgeNodeStatus,
  KnowledgeNodeType,
  KnowledgeOwnerType,
} from "@/features/knowledge-crud/types";
import { postgresPersistenceError } from "./postgres-errors";
import type { LifecycleStatus, PersistenceOperation } from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ENVELOPE_KEY = "hebunKnowledgeCrudV1";
const ENVELOPE_FIELDS = new Set([
  "schemaVersion",
  "slug",
  "ownerType",
  "ownerId",
  "confidence",
  "importance",
  "status",
  "version",
  "source",
  "tags",
  "createdBy",
  "updatedBy",
]);
const NODE_TYPES = new Set<KnowledgeNodeType>([
  "Agent",
  "Workflow",
  "Department",
  "Organization",
  "Customer",
  "Project",
  "Decision",
  "Memory",
  "Knowledge",
  "Policy",
  "Goal",
  "Plan",
  "Tool",
  "Model",
  "Capability",
  "Event",
  "Risk",
  "Entity",
  "Execution",
  "Learning",
  "Experience",
  "Governance",
]);
const OWNER_TYPES = new Set<KnowledgeOwnerType>([
  "agent",
  "workflow",
  "department",
  "organization",
]);
const IMPORTANCE_VALUES = new Set<KnowledgeImportance>([
  "critical",
  "high",
  "medium",
  "low",
]);
const STATUS_VALUES = new Set<KnowledgeNodeStatus>([
  "verified",
  "provisional",
  "review",
]);
const LIFECYCLE_STATUSES = new Set<LifecycleStatus>([
  "active",
  "archived",
  "deleted",
]);

interface KnowledgeNodeCodecEnvelope {
  readonly schemaVersion: 1;
  readonly slug: string;
  readonly ownerType: KnowledgeOwnerType;
  readonly ownerId: string;
  readonly confidence: number;
  readonly importance: KnowledgeImportance;
  readonly status: KnowledgeNodeStatus;
  readonly version: string;
  readonly source: string;
  readonly tags: readonly string[];
  readonly createdBy: string;
  readonly updatedBy: string;
}

export interface KnowledgeNodePostgresRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly ref_id: string | null;
  readonly type: string;
  readonly label: string;
  readonly statement: string | null;
  readonly provenance: unknown;
  readonly lifecycle_status: string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
}

export interface KnowledgeNodePostgresWriteRow {
  readonly tenantId: string;
  readonly refId: string;
  readonly type: KnowledgeNodeType;
  readonly label: string;
  readonly statement: string;
  readonly provenancePatch: Record<typeof ENVELOPE_KEY, KnowledgeNodeCodecEnvelope>;
  readonly lifecycleStatus: LifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function invalidMapping(detail: string, operation?: PersistenceOperation): never {
  throw postgresPersistenceError({
    code: "PERSISTENCE_INVALID_RECORD_MAPPING",
    collection: "knowledge-nodes",
    operation,
    detail,
  });
}

function plainObject(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return invalidMapping(`Knowledge node ${field} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return invalidMapping(`Knowledge node ${field} must be a non-empty string.`);
  }
  return value;
}

function isoTimestamp(value: unknown, field: string): string {
  if (!(typeof value === "string" || value instanceof Date)) {
    return invalidMapping(`Knowledge node ${field} must be a timestamp.`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return invalidMapping(`Knowledge node ${field} must be a valid timestamp.`);
  }
  return parsed.toISOString();
}

function enumValue<T extends string>(
  value: unknown,
  field: string,
  allowed: ReadonlySet<T>,
): T {
  const candidate = requiredString(value, field) as T;
  if (!allowed.has(candidate)) {
    return invalidMapping(`Knowledge node ${field} is unsupported.`);
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
    return invalidMapping("Knowledge node confidence must be between 0 and 100.");
  }
  return value;
}

function tags(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((tag) => typeof tag !== "string" || tag.length === 0)
  ) {
    return invalidMapping("Knowledge node tags must be a non-empty string array.");
  }
  return [...value];
}

function decodeEnvelope(provenance: unknown): KnowledgeNodeCodecEnvelope {
  const root = plainObject(provenance, "provenance");
  const envelope = plainObject(root[ENVELOPE_KEY], `${ENVELOPE_KEY} envelope`);
  const unknownFields = Object.keys(envelope).filter(
    (field) => !ENVELOPE_FIELDS.has(field),
  );
  if (unknownFields.length > 0) {
    return invalidMapping(
      `Knowledge node codec envelope contains unsupported fields: ${unknownFields.join(", ")}.`,
    );
  }
  if (envelope.schemaVersion !== 1) {
    return invalidMapping("Knowledge node codec envelope schemaVersion must be 1.");
  }

  return {
    schemaVersion: 1,
    slug: requiredString(envelope.slug, "slug"),
    ownerType: enumValue(envelope.ownerType, "ownerType", OWNER_TYPES),
    ownerId: requiredString(envelope.ownerId, "ownerId"),
    confidence: confidence(envelope.confidence),
    importance: enumValue(
      envelope.importance,
      "importance",
      IMPORTANCE_VALUES,
    ),
    status: enumValue(envelope.status, "status", STATUS_VALUES),
    version: requiredString(envelope.version, "version"),
    source: requiredString(envelope.source, "source"),
    tags: tags(envelope.tags),
    createdBy: requiredString(envelope.createdBy, "createdBy"),
    updatedBy: requiredString(envelope.updatedBy, "updatedBy"),
  };
}

export function encodeKnowledgeNodeRecord(
  record: KnowledgeNodeRecord,
  tenantId: string,
): KnowledgeNodePostgresWriteRow {
  if (!UUID_PATTERN.test(tenantId)) {
    return invalidMapping("Knowledge node tenantId must be a UUID.", "save");
  }
  const lifecycleStatus = enumValue(
    record.lifecycleStatus,
    "lifecycleStatus",
    LIFECYCLE_STATUSES,
  );
  const envelope: KnowledgeNodeCodecEnvelope = {
    schemaVersion: 1,
    slug: requiredString(record.slug, "slug"),
    ownerType: enumValue(record.ownerType, "ownerType", OWNER_TYPES),
    ownerId: requiredString(record.ownerId, "ownerId"),
    confidence: confidence(record.confidence),
    importance: enumValue(record.importance, "importance", IMPORTANCE_VALUES),
    status: enumValue(record.status, "status", STATUS_VALUES),
    version: requiredString(record.version, "version"),
    source: requiredString(record.source, "source"),
    tags: tags(record.tags),
    createdBy: requiredString(record.createdBy, "createdBy"),
    updatedBy: requiredString(record.updatedBy, "updatedBy"),
  };

  return {
    tenantId,
    refId: requiredString(record.id, "id"),
    type: enumValue(record.nodeType, "nodeType", NODE_TYPES),
    label: requiredString(record.title, "title"),
    statement: requiredString(record.description, "description"),
    provenancePatch: { [ENVELOPE_KEY]: envelope },
    lifecycleStatus,
    createdAt: isoTimestamp(record.createdAt, "createdAt"),
    updatedAt: isoTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function decodeKnowledgeNodeRow(
  row: KnowledgeNodePostgresRow,
  expectedTenantId: string,
): KnowledgeNodeRecord {
  if (row.tenant_id !== expectedTenantId) {
    throw postgresPersistenceError({
      code: "PERSISTENCE_TENANT_MISMATCH",
      collection: "knowledge-nodes",
      detail: "Knowledge node row tenant does not match the requested tenant context.",
    });
  }
  if (!UUID_PATTERN.test(row.id)) {
    return invalidMapping("Knowledge node physical id must be a UUID.");
  }
  if (row.ref_id === null || row.statement === null) {
    return invalidMapping(
      "Knowledge node rows require ref_id and statement in the supported row invariant.",
    );
  }
  const envelope = decodeEnvelope(row.provenance);

  return {
    id: requiredString(row.ref_id, "refId"),
    title: requiredString(row.label, "label"),
    slug: envelope.slug,
    description: requiredString(row.statement, "statement"),
    nodeType: enumValue(row.type, "type", NODE_TYPES),
    ownerType: envelope.ownerType,
    ownerId: envelope.ownerId,
    confidence: envelope.confidence,
    importance: envelope.importance,
    status: envelope.status,
    version: envelope.version,
    source: envelope.source,
    tags: [...envelope.tags],
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

export function decodeKnowledgeNodeRows(
  rows: readonly KnowledgeNodePostgresRow[],
  expectedTenantId: string,
): KnowledgeNodeRecord[] {
  const records = rows.map((row) => decodeKnowledgeNodeRow(row, expectedTenantId));
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_LOGICAL_ID_CONFLICT",
        collection: "knowledge-nodes",
        operation: "load",
        detail: `Duplicate knowledge node logical id "${record.id}" exists for the tenant.`,
      });
    }
    ids.add(record.id);
  }
  return records;
}
