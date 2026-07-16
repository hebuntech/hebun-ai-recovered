import assert from "node:assert/strict";
import type { KnowledgeNodeRecord } from "../../src/features/knowledge-crud/types";
import {
  decodeKnowledgeNodeRow,
  decodeKnowledgeNodeRows,
  encodeKnowledgeNodeRecord,
  type KnowledgeNodePostgresRow,
} from "../../src/features/persistence/knowledge-node-postgres-codec";
import type { PostgresPersistenceError } from "../../src/features/persistence/postgres-errors";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const PHYSICAL_ID = "22222222-2222-4222-8222-222222222222";
const record: KnowledgeNodeRecord = {
  id: "goals:goal-1",
  title: "Goal One",
  slug: "goal-one",
  description: "Canonical goal statement.",
  nodeType: "Goal",
  ownerType: "organization",
  ownerId: "director",
  confidence: 94,
  importance: "high",
  status: "verified",
  version: "v1.0.0",
  source: "goals registry",
  tags: ["goals", "director"],
  createdAt: "2026-07-15T10:00:00.000Z",
  updatedAt: "2026-07-15T11:00:00.000Z",
  createdBy: "Seed",
  updatedBy: "Director",
  lifecycleStatus: "active",
};

function row(
  overrides: Partial<KnowledgeNodePostgresRow> = {},
): KnowledgeNodePostgresRow {
  const encoded = encodeKnowledgeNodeRecord(record, TENANT_ID);
  return {
    id: PHYSICAL_ID,
    tenant_id: TENANT_ID,
    ref_id: encoded.refId,
    type: encoded.type,
    label: encoded.label,
    statement: encoded.statement,
    provenance: {
      canonicalSibling: { source: "preserved" },
      ...encoded.provenancePatch,
    },
    lifecycle_status: encoded.lifecycleStatus,
    created_at: new Date(encoded.createdAt),
    updated_at: new Date(encoded.updatedAt),
    ...overrides,
  };
}

function expectCode(run: () => unknown, code: string): void {
  assert.throws(run, (error: PostgresPersistenceError) => error.code === code);
}

const encoded = encodeKnowledgeNodeRecord(record, TENANT_ID);
assert.equal(encoded.refId, record.id);
assert.equal(encoded.tenantId, TENANT_ID);
assert.deepEqual(decodeKnowledgeNodeRow(row(), TENANT_ID), record);
assert.notEqual(decodeKnowledgeNodeRow(row(), TENANT_ID).id, PHYSICAL_ID);

expectCode(
  () => decodeKnowledgeNodeRow(row({ ref_id: null }), TENANT_ID),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);
expectCode(
  () => decodeKnowledgeNodeRow(row({ statement: null }), TENANT_ID),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);
expectCode(
  () => decodeKnowledgeNodeRow(row({ provenance: null }), TENANT_ID),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);
expectCode(
  () =>
    decodeKnowledgeNodeRow(
      row({
        provenance: {
          hebunKnowledgeCrudV1: {
            ...encoded.provenancePatch.hebunKnowledgeCrudV1,
            schemaVersion: 2,
          },
        },
      }),
      TENANT_ID,
    ),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);
expectCode(
  () =>
    decodeKnowledgeNodeRow(
      row({
        provenance: {
          hebunKnowledgeCrudV1: {
            ...encoded.provenancePatch.hebunKnowledgeCrudV1,
            unexpected: true,
          },
        },
      }),
      TENANT_ID,
    ),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);
expectCode(
  () =>
    decodeKnowledgeNodeRow(
      row(),
      "33333333-3333-4333-8333-333333333333",
    ),
  "PERSISTENCE_TENANT_MISMATCH",
);
expectCode(
  () => decodeKnowledgeNodeRow(row({ id: "not-a-uuid" }), TENANT_ID),
  "PERSISTENCE_INVALID_RECORD_MAPPING",
);
expectCode(
  () => decodeKnowledgeNodeRows([row(), row()], TENANT_ID),
  "PERSISTENCE_LOGICAL_ID_CONFLICT",
);

console.log("knowledge node postgres codec checks passed");
