import type { WorkflowCrudRecord } from "@/features/workflow-crud/types";
import type { WorkflowStatus } from "@/types";
import { postgresPersistenceError } from "./postgres-errors";
import type { LifecycleStatus, PersistenceOperation } from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const WORKFLOW_ENVELOPE_KEY = "hebunWorkflowCrudV1";
const ENVELOPE_FIELDS = new Set([
  "schemaVersion",
  "logicalId",
  "slug",
  "department",
  "category",
  "owner",
  "status",
  "version",
  "trigger",
  "steps",
  "assignedAgents",
  "dependencies",
  "approvalPolicy",
  "executionMode",
  "retryPolicy",
  "timeout",
  "runtime",
  "createdBy",
  "updatedBy",
  "ownerAgent",
  "successRate",
  "runsToday",
  "lastRun",
]);
const WORKFLOW_STATUSES = new Set<WorkflowStatus>([
  "running",
  "idle",
  "failed",
  "scheduled",
]);
const LIFECYCLE_STATUSES = new Set<LifecycleStatus>([
  "active",
  "archived",
  "deleted",
]);

interface WorkflowCodecEnvelope {
  readonly schemaVersion: 1;
  readonly logicalId: string;
  readonly slug: string;
  readonly department: string;
  readonly category: string;
  readonly owner: string;
  readonly status: WorkflowStatus;
  readonly version: string;
  readonly trigger: string;
  readonly steps: readonly string[];
  readonly assignedAgents: readonly string[];
  readonly dependencies: readonly string[];
  readonly approvalPolicy: string;
  readonly executionMode: string;
  readonly retryPolicy: string;
  readonly timeout: number;
  readonly runtime: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly ownerAgent: string;
  readonly successRate: number;
  readonly runsToday: number;
  readonly lastRun: string;
}

export interface WorkflowPostgresRow {
  readonly id: string;
  readonly tenant_id: string;
  readonly name: string;
  readonly description: string | null;
  readonly orchestration_metadata: unknown;
  readonly lifecycle_status: string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
}

export interface WorkflowPostgresWriteRow {
  readonly tenantId: string;
  readonly logicalId: string;
  readonly name: string;
  readonly description: string;
  readonly orchestrationMetadataPatch: Record<
    typeof WORKFLOW_ENVELOPE_KEY,
    WorkflowCodecEnvelope
  >;
  readonly lifecycleStatus: LifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function invalidMapping(detail: string, operation?: PersistenceOperation): never {
  throw postgresPersistenceError({
    code: "PERSISTENCE_INVALID_RECORD_MAPPING",
    collection: "workflows",
    operation,
    detail,
  });
}

function plainObject(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return invalidMapping(`Workflow ${field} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return invalidMapping(`Workflow ${field} must be a non-empty string.`);
  }
  return value;
}

function stringArray(
  value: unknown,
  field: string,
  allowEmpty = true,
): string[] {
  if (
    !Array.isArray(value) ||
    (!allowEmpty && value.length === 0) ||
    value.some((entry) => typeof entry !== "string" || entry.length === 0)
  ) {
    return invalidMapping(`Workflow ${field} must be a valid string array.`);
  }
  return [...value];
}

function finiteNumber(value: unknown, field: string, minimum: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum) {
    return invalidMapping(`Workflow ${field} must be a finite number >= ${minimum}.`);
  }
  return value;
}

function nonNegativeInteger(value: unknown, field: string): number {
  const number = finiteNumber(value, field, 0);
  if (!Number.isInteger(number)) {
    return invalidMapping(`Workflow ${field} must be an integer.`);
  }
  return number;
}

function isoTimestamp(value: unknown, field: string): string {
  if (!(typeof value === "string" || value instanceof Date)) {
    return invalidMapping(`Workflow ${field} must be a timestamp.`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return invalidMapping(`Workflow ${field} must be a valid timestamp.`);
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
    return invalidMapping(`Workflow ${field} is unsupported.`);
  }
  return candidate;
}

function decodeEnvelope(metadata: unknown): WorkflowCodecEnvelope {
  const root = plainObject(metadata, "orchestration_metadata");
  const envelope = plainObject(
    root[WORKFLOW_ENVELOPE_KEY],
    `${WORKFLOW_ENVELOPE_KEY} envelope`,
  );
  const unknownFields = Object.keys(envelope).filter(
    (field) => !ENVELOPE_FIELDS.has(field),
  );
  if (unknownFields.length > 0) {
    return invalidMapping(
      `Workflow codec envelope contains unsupported fields: ${unknownFields.join(", ")}.`,
    );
  }
  if (envelope.schemaVersion !== 1) {
    return invalidMapping("Workflow codec envelope schemaVersion must be 1.");
  }

  return {
    schemaVersion: 1,
    logicalId: requiredString(envelope.logicalId, "logicalId"),
    slug: requiredString(envelope.slug, "slug"),
    department: requiredString(envelope.department, "department"),
    category: requiredString(envelope.category, "category"),
    owner: requiredString(envelope.owner, "owner"),
    status: enumValue(envelope.status, "status", WORKFLOW_STATUSES),
    version: requiredString(envelope.version, "version"),
    trigger: requiredString(envelope.trigger, "trigger"),
    steps: stringArray(envelope.steps, "steps", false),
    assignedAgents: stringArray(
      envelope.assignedAgents,
      "assignedAgents",
      false,
    ),
    dependencies: stringArray(envelope.dependencies, "dependencies"),
    approvalPolicy: requiredString(envelope.approvalPolicy, "approvalPolicy"),
    executionMode: requiredString(envelope.executionMode, "executionMode"),
    retryPolicy: requiredString(envelope.retryPolicy, "retryPolicy"),
    timeout: finiteNumber(envelope.timeout, "timeout", Number.MIN_VALUE),
    runtime: requiredString(envelope.runtime, "runtime"),
    createdBy: requiredString(envelope.createdBy, "createdBy"),
    updatedBy: requiredString(envelope.updatedBy, "updatedBy"),
    ownerAgent: requiredString(envelope.ownerAgent, "ownerAgent"),
    successRate: finiteNumber(envelope.successRate, "successRate", 0),
    runsToday: nonNegativeInteger(envelope.runsToday, "runsToday"),
    lastRun: requiredString(envelope.lastRun, "lastRun"),
  };
}

export function encodeWorkflowRecord(
  record: WorkflowCrudRecord,
  tenantId: string,
): WorkflowPostgresWriteRow {
  if (!UUID_PATTERN.test(tenantId)) {
    return invalidMapping("Workflow tenantId must be a UUID.", "save");
  }
  const envelope: WorkflowCodecEnvelope = {
    schemaVersion: 1,
    logicalId: requiredString(record.id, "id"),
    slug: requiredString(record.slug, "slug"),
    department: requiredString(record.department, "department"),
    category: requiredString(record.category, "category"),
    owner: requiredString(record.owner, "owner"),
    status: enumValue(record.status, "status", WORKFLOW_STATUSES),
    version: requiredString(record.version, "version"),
    trigger: requiredString(record.trigger, "trigger"),
    steps: stringArray(record.steps, "steps", false),
    assignedAgents: stringArray(record.assignedAgents, "assignedAgents", false),
    dependencies: stringArray(record.dependencies, "dependencies"),
    approvalPolicy: requiredString(record.approvalPolicy, "approvalPolicy"),
    executionMode: requiredString(record.executionMode, "executionMode"),
    retryPolicy: requiredString(record.retryPolicy, "retryPolicy"),
    timeout: finiteNumber(record.timeout, "timeout", Number.MIN_VALUE),
    runtime: requiredString(record.runtime, "runtime"),
    createdBy: requiredString(record.createdBy, "createdBy"),
    updatedBy: requiredString(record.updatedBy, "updatedBy"),
    ownerAgent: requiredString(record.ownerAgent, "ownerAgent"),
    successRate: finiteNumber(record.successRate, "successRate", 0),
    runsToday: nonNegativeInteger(record.runsToday, "runsToday"),
    lastRun: requiredString(record.lastRun, "lastRun"),
  };

  return {
    tenantId,
    logicalId: envelope.logicalId,
    name: requiredString(record.name, "name"),
    description: requiredString(record.description, "description"),
    orchestrationMetadataPatch: { [WORKFLOW_ENVELOPE_KEY]: envelope },
    lifecycleStatus: enumValue(
      record.lifecycleStatus,
      "lifecycleStatus",
      LIFECYCLE_STATUSES,
    ),
    createdAt: isoTimestamp(record.createdAt, "createdAt"),
    updatedAt: isoTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function decodeWorkflowRow(
  row: WorkflowPostgresRow,
  expectedTenantId: string,
): WorkflowCrudRecord {
  if (row.tenant_id !== expectedTenantId) {
    throw postgresPersistenceError({
      code: "PERSISTENCE_TENANT_MISMATCH",
      collection: "workflows",
      detail: "Workflow row tenant does not match the requested tenant context.",
    });
  }
  if (!UUID_PATTERN.test(row.id) || !UUID_PATTERN.test(row.tenant_id)) {
    return invalidMapping("Workflow physical id and tenant id must be UUIDs.");
  }
  const envelope = decodeEnvelope(row.orchestration_metadata);

  return {
    id: envelope.logicalId,
    name: requiredString(row.name, "name"),
    slug: envelope.slug,
    description: requiredString(row.description, "description"),
    department: envelope.department,
    category: envelope.category,
    owner: envelope.owner,
    status: envelope.status,
    version: envelope.version,
    trigger: envelope.trigger,
    steps: [...envelope.steps],
    assignedAgents: [...envelope.assignedAgents],
    dependencies: [...envelope.dependencies],
    approvalPolicy: envelope.approvalPolicy,
    executionMode: envelope.executionMode,
    retryPolicy: envelope.retryPolicy,
    timeout: envelope.timeout,
    runtime: envelope.runtime,
    createdAt: isoTimestamp(row.created_at, "createdAt"),
    updatedAt: isoTimestamp(row.updated_at, "updatedAt"),
    createdBy: envelope.createdBy,
    updatedBy: envelope.updatedBy,
    lifecycleStatus: enumValue(
      row.lifecycle_status,
      "lifecycleStatus",
      LIFECYCLE_STATUSES,
    ),
    ownerAgent: envelope.ownerAgent,
    successRate: envelope.successRate,
    runsToday: envelope.runsToday,
    lastRun: envelope.lastRun,
  };
}

export function decodeWorkflowRows(
  rows: readonly WorkflowPostgresRow[],
  expectedTenantId: string,
): WorkflowCrudRecord[] {
  const records = rows.map((row) => decodeWorkflowRow(row, expectedTenantId));
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_LOGICAL_ID_CONFLICT",
        collection: "workflows",
        operation: "load",
        detail: `Duplicate Workflow logical id "${record.id}" exists for the tenant.`,
      });
    }
    ids.add(record.id);
  }
  return records;
}
