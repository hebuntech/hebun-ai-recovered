import assert from "node:assert/strict";
import type { MemoryCrudRecord } from "../../src/features/memory-crud/types";
import {
  decodeMemoryRow,
  decodeMemoryRows,
  encodeMemoryRecord,
  type MemoryPostgresRow,
} from "../../src/features/persistence/memory-postgres-codec";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";

const record: MemoryCrudRecord = {
  id: "memory-launch-decision",
  title: "Launch Decision",
  slug: "launch-decision",
  description: "The governed launch decision and its supporting context.",
  memoryType: "Decision",
  ownerType: "organization",
  ownerId: "organization-hebun",
  importance: "critical",
  confidence: 92.5,
  source: "director-review",
  tags: ["launch", "governance"],
  summary: "Launch proceeds after governance review.",
  status: "stable",
  version: "v1.2.0",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  createdBy: "Director",
  updatedBy: "Governance",
  lifecycleStatus: "active",
};

const encoded = encodeMemoryRecord(record, TENANT_ID);

function row(overrides: Partial<MemoryPostgresRow> = {}): MemoryPostgresRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    tenant_id: TENANT_ID,
    content: encoded.content,
    storage_metadata: {
      canonicalSibling: { source: "canonical-memory" },
      ...encoded.storageMetadataPatch,
    },
    lifecycle_status: encoded.lifecycleStatus,
    created_at: encoded.createdAt,
    updated_at: encoded.updatedAt,
    ...overrides,
  };
}

assert.equal(encoded.logicalId, record.id);
assert.notEqual(row().id, record.id);
assert.deepEqual(decodeMemoryRow(row(), TENANT_ID), record);

for (const invalid of [
  row({ content: "" }),
  row({ storage_metadata: null }),
  row({
    storage_metadata: {
      hebunMemoryCrudV1: {
        ...encoded.storageMetadataPatch.hebunMemoryCrudV1,
        schemaVersion: 2,
      },
    },
  }),
  row({
    storage_metadata: {
      hebunMemoryCrudV1: {
        ...encoded.storageMetadataPatch.hebunMemoryCrudV1,
        unknown: true,
      },
    },
  }),
  row({
    storage_metadata: {
      hebunMemoryCrudV1: {
        ...encoded.storageMetadataPatch.hebunMemoryCrudV1,
        memoryType: "Unknown",
      },
    },
  }),
  row({
    storage_metadata: {
      hebunMemoryCrudV1: {
        ...encoded.storageMetadataPatch.hebunMemoryCrudV1,
        confidence: 101,
      },
    },
  }),
  row({
    storage_metadata: {
      hebunMemoryCrudV1: {
        ...encoded.storageMetadataPatch.hebunMemoryCrudV1,
        tags: [],
      },
    },
  }),
  row({ created_at: "not-a-date" }),
]) {
  assert.throws(
    () => decodeMemoryRow(invalid, TENANT_ID),
    (error: { code?: string }) =>
      error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
  );
}

assert.throws(
  () => encodeMemoryRecord({ ...record, ownerType: "human" as never }, TENANT_ID),
  (error: { code?: string }) =>
    error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () => encodeMemoryRecord({ ...record, confidence: -1 }, TENANT_ID),
  (error: { code?: string }) =>
    error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () => encodeMemoryRecord({ ...record, tags: [] }, TENANT_ID),
  (error: { code?: string }) =>
    error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () => decodeMemoryRow(row({ id: "not-a-uuid" }), TENANT_ID),
  (error: { code?: string }) =>
    error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () =>
    decodeMemoryRow(row(), "33333333-3333-4333-8333-333333333333"),
  (error: { code?: string }) => error.code === "PERSISTENCE_TENANT_MISMATCH",
);
assert.throws(
  () =>
    decodeMemoryRows(
      [row(), row({ id: "44444444-4444-4444-8444-444444444444" })],
      TENANT_ID,
    ),
  (error: { code?: string }) =>
    error.code === "PERSISTENCE_LOGICAL_ID_CONFLICT",
);

console.log("memory postgres codec checks passed");
