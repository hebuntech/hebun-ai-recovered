import assert from "node:assert/strict";
import type { RegistryCrudRecord } from "../../src/features/registry-crud/types";
import type { PostgresPersistenceError } from "../../src/features/persistence/postgres-errors";
import {
  decodeRegistryRow,
  encodeRegistryRecord,
  type RegistryPostgresRow,
} from "../../src/features/persistence/registry-postgres-codec";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const PHYSICAL_ID = "22222222-2222-4222-8222-222222222222";
const record: RegistryCrudRecord = {
  id: "finance-controls",
  title: "Finance Controls",
  description: "Governed finance registry.",
  owner: "Finance",
  health: 94,
  totalRecords: 12,
  lifecycleStatus: "active",
  createdAt: "2026-07-15T10:00:00.000Z",
  updatedAt: "2026-07-15T11:00:00.000Z",
};

function row(overrides: Partial<RegistryPostgresRow> = {}): RegistryPostgresRow {
  return {
    id: PHYSICAL_ID,
    tenant_id: TENANT_ID,
    slug: record.id,
    title: record.title,
    description: record.description,
    owner: record.owner,
    health: record.health,
    total_records: record.totalRecords,
    lifecycle_status: record.lifecycleStatus,
    created_at: new Date(record.createdAt),
    updated_at: new Date(record.updatedAt),
    ...overrides,
  };
}

function expectCode(run: () => unknown, code: string): void {
  assert.throws(run, (error: PostgresPersistenceError) => error.code === code);
}

const encoded = encodeRegistryRecord(record, TENANT_ID);
assert.equal(encoded.tenantId, TENANT_ID);
assert.equal(encoded.slug, record.id);
assert.deepEqual(decodeRegistryRow(row(), TENANT_ID), record);
assert.notEqual(decodeRegistryRow(row(), TENANT_ID).id, PHYSICAL_ID);

expectCode(
  () => decodeRegistryRow(row({ description: null }), TENANT_ID),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);
expectCode(
  () => decodeRegistryRow(row({ owner: null }), TENANT_ID),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);
expectCode(
  () =>
    decodeRegistryRow(row(), "33333333-3333-4333-8333-333333333333"),
  "PERSISTENCE_TENANT_MISMATCH",
);
expectCode(
  () => decodeRegistryRow(row({ id: "not-a-uuid" }), TENANT_ID),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);

console.log("registry postgres codec checks passed");
