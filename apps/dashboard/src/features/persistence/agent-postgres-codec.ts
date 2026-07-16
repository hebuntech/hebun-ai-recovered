import type { AgentStatus } from "@/types";
import type { AgentCrudRecord } from "@/features/agent-crud/types";
import { postgresPersistenceError } from "./postgres-errors";
import type { LifecycleStatus, PersistenceOperation } from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ENVELOPE_KEY = "hebunAgentCrudV1";
const ENVELOPE_FIELDS = new Set([
  "schemaVersion",
  "logicalId",
  "slug",
  "description",
  "department",
  "category",
  "owner",
  "status",
  "version",
  "provider",
  "model",
  "capabilities",
  "tools",
  "runtime",
  "memory",
  "knowledge",
  "permissions",
  "createdBy",
  "updatedBy",
  "tasksToday",
  "costToday",
  "lastActive",
]);
const AGENT_STATUSES = new Set<AgentStatus>([
  "running",
  "idle",
  "paused",
  "error",
]);
const LIFECYCLE_STATUSES = new Set<LifecycleStatus>([
  "active",
  "archived",
  "deleted",
]);

interface AgentCodecEnvelope {
  readonly schemaVersion: 1;
  readonly logicalId: string;
  readonly slug: string;
  readonly description: string;
  readonly department: string;
  readonly category: string;
  readonly owner: string;
  readonly status: AgentStatus;
  readonly version: string;
  readonly provider: string;
  readonly model: string;
  readonly capabilities: readonly string[];
  readonly tools: readonly string[];
  readonly runtime: string;
  readonly memory: string;
  readonly knowledge: string;
  readonly permissions: readonly string[];
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly tasksToday: number;
  readonly costToday: number;
  readonly lastActive: string;
}

export interface AgentPostgresRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly department_id: string | null;
  readonly department_name: string | null;
  readonly department_tenant_id: string | null;
  readonly department_match_count: number;
  readonly name: string;
  readonly role: string | null;
  readonly provider_profile: unknown;
  readonly lifecycle_status: string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
}

export interface AgentPostgresWriteRow {
  readonly tenantId: string;
  readonly logicalId: string;
  readonly department: string;
  readonly name: string;
  readonly role: string;
  readonly providerProfilePatch: Record<typeof ENVELOPE_KEY, AgentCodecEnvelope>;
  readonly lifecycleStatus: LifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function invalidMapping(detail: string, operation?: PersistenceOperation): never {
  throw postgresPersistenceError({
    code: "PERSISTENCE_INVALID_RECORD_MAPPING",
    collection: "agents",
    operation,
    detail,
  });
}

function plainObject(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return invalidMapping(`Agent ${field} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return invalidMapping(`Agent ${field} must be a non-empty string.`);
  }
  return value;
}

function stringArray(value: unknown, field: string): string[] {
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== "string" || entry.length === 0)
  ) {
    return invalidMapping(`Agent ${field} must be a string array.`);
  }
  return [...value];
}

function nonNegativeNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return invalidMapping(`Agent ${field} must be a non-negative number.`);
  }
  return value;
}

function isoTimestamp(value: unknown, field: string): string {
  if (!(typeof value === "string" || value instanceof Date)) {
    return invalidMapping(`Agent ${field} must be a timestamp.`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return invalidMapping(`Agent ${field} must be a valid timestamp.`);
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
    return invalidMapping(`Agent ${field} is unsupported.`);
  }
  return candidate;
}

function decodeEnvelope(providerProfile: unknown): AgentCodecEnvelope {
  const root = plainObject(providerProfile, "provider_profile");
  const envelope = plainObject(root[ENVELOPE_KEY], `${ENVELOPE_KEY} envelope`);
  const unknownFields = Object.keys(envelope).filter(
    (field) => !ENVELOPE_FIELDS.has(field),
  );
  if (unknownFields.length > 0) {
    return invalidMapping(
      `Agent codec envelope contains unsupported fields: ${unknownFields.join(", ")}.`,
    );
  }
  if (envelope.schemaVersion !== 1) {
    return invalidMapping("Agent codec envelope schemaVersion must be 1.");
  }

  return {
    schemaVersion: 1,
    logicalId: requiredString(envelope.logicalId, "logicalId"),
    slug: requiredString(envelope.slug, "slug"),
    description: requiredString(envelope.description, "description"),
    department: requiredString(envelope.department, "department"),
    category: requiredString(envelope.category, "category"),
    owner: requiredString(envelope.owner, "owner"),
    status: enumValue(envelope.status, "status", AGENT_STATUSES),
    version: requiredString(envelope.version, "version"),
    provider: requiredString(envelope.provider, "provider"),
    model: requiredString(envelope.model, "model"),
    capabilities: stringArray(envelope.capabilities, "capabilities"),
    tools: stringArray(envelope.tools, "tools"),
    runtime: requiredString(envelope.runtime, "runtime"),
    memory: requiredString(envelope.memory, "memory"),
    knowledge: requiredString(envelope.knowledge, "knowledge"),
    permissions: stringArray(envelope.permissions, "permissions"),
    createdBy: requiredString(envelope.createdBy, "createdBy"),
    updatedBy: requiredString(envelope.updatedBy, "updatedBy"),
    tasksToday: nonNegativeNumber(envelope.tasksToday, "tasksToday"),
    costToday: nonNegativeNumber(envelope.costToday, "costToday"),
    lastActive: requiredString(envelope.lastActive, "lastActive"),
  };
}

export function encodeAgentRecord(
  record: AgentCrudRecord,
  tenantId: string,
): AgentPostgresWriteRow {
  if (!UUID_PATTERN.test(tenantId)) {
    return invalidMapping("Agent tenantId must be a UUID.", "save");
  }
  const envelope: AgentCodecEnvelope = {
    schemaVersion: 1,
    logicalId: requiredString(record.id, "id"),
    slug: requiredString(record.slug, "slug"),
    description: requiredString(record.description, "description"),
    department: requiredString(record.department, "department"),
    category: requiredString(record.category, "category"),
    owner: requiredString(record.owner, "owner"),
    status: enumValue(record.status, "status", AGENT_STATUSES),
    version: requiredString(record.version, "version"),
    provider: requiredString(record.provider, "provider"),
    model: requiredString(record.model, "model"),
    capabilities: stringArray(record.capabilities, "capabilities"),
    tools: stringArray(record.tools, "tools"),
    runtime: requiredString(record.runtime, "runtime"),
    memory: requiredString(record.memory, "memory"),
    knowledge: requiredString(record.knowledge, "knowledge"),
    permissions: stringArray(record.permissions, "permissions"),
    createdBy: requiredString(record.createdBy, "createdBy"),
    updatedBy: requiredString(record.updatedBy, "updatedBy"),
    tasksToday: nonNegativeNumber(record.tasksToday, "tasksToday"),
    costToday: nonNegativeNumber(record.costToday, "costToday"),
    lastActive: requiredString(record.lastActive, "lastActive"),
  };

  return {
    tenantId,
    logicalId: envelope.logicalId,
    department: envelope.department,
    name: requiredString(record.name, "name"),
    role: requiredString(record.role, "role"),
    providerProfilePatch: { [ENVELOPE_KEY]: envelope },
    lifecycleStatus: enumValue(
      record.lifecycleStatus,
      "lifecycleStatus",
      LIFECYCLE_STATUSES,
    ),
    createdAt: isoTimestamp(record.createdAt, "createdAt"),
    updatedAt: isoTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function decodeAgentRow(
  row: AgentPostgresRow,
  expectedTenantId: string,
): AgentCrudRecord {
  if (row.tenant_id !== expectedTenantId) {
    throw postgresPersistenceError({
      code: "PERSISTENCE_TENANT_MISMATCH",
      collection: "agents",
      detail: "Agent row tenant does not match the requested tenant context.",
    });
  }
  if (!UUID_PATTERN.test(row.id) || !UUID_PATTERN.test(row.tenant_id)) {
    return invalidMapping("Agent physical id and tenant id must be UUIDs.");
  }
  const envelope = decodeEnvelope(row.provider_profile);
  if (
    !row.department_id ||
    row.department_tenant_id !== expectedTenantId ||
    row.department_name !== envelope.department ||
    row.department_match_count !== 1
  ) {
    return invalidMapping(
      "Agent department must resolve to exactly one row in the requested tenant.",
    );
  }

  return {
    id: envelope.logicalId,
    name: requiredString(row.name, "name"),
    slug: envelope.slug,
    description: envelope.description,
    department: envelope.department,
    category: envelope.category,
    owner: envelope.owner,
    status: envelope.status,
    version: envelope.version,
    capabilities: [...envelope.capabilities],
    provider: envelope.provider,
    model: envelope.model,
    tools: [...envelope.tools],
    permissions: [...envelope.permissions],
    runtime: envelope.runtime,
    memory: envelope.memory,
    knowledge: envelope.knowledge,
    createdAt: isoTimestamp(row.created_at, "createdAt"),
    updatedAt: isoTimestamp(row.updated_at, "updatedAt"),
    createdBy: envelope.createdBy,
    updatedBy: envelope.updatedBy,
    lifecycleStatus: enumValue(
      row.lifecycle_status,
      "lifecycleStatus",
      LIFECYCLE_STATUSES,
    ),
    role: requiredString(row.role, "role"),
    tasksToday: envelope.tasksToday,
    costToday: envelope.costToday,
    lastActive: envelope.lastActive,
  };
}

export function decodeAgentRows(
  rows: readonly AgentPostgresRow[],
  expectedTenantId: string,
): AgentCrudRecord[] {
  const records = rows.map((row) => decodeAgentRow(row, expectedTenantId));
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_LOGICAL_ID_CONFLICT",
        collection: "agents",
        operation: "load",
        detail: `Duplicate Agent logical id "${record.id}" exists for the tenant.`,
      });
    }
    ids.add(record.id);
  }
  return records;
}
