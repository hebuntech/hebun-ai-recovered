import assert from "node:assert/strict";
import type { WorkflowCrudRecord } from "../../src/features/workflow-crud/types";
import {
  decodeWorkflowRow,
  decodeWorkflowRows,
  encodeWorkflowRecord,
  type WorkflowPostgresRow,
} from "../../src/features/persistence/workflow-postgres-codec";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";

const record: WorkflowCrudRecord = {
  id: "workflow-content",
  name: "Content Workflow",
  slug: "content-workflow",
  description: "Produces governed content.",
  department: "Marketing",
  category: "Content",
  owner: "Marketing Director",
  status: "running",
  version: "v1.2.0",
  trigger: "campaign-approved",
  steps: ["research", "draft", "review"],
  assignedAgents: ["agent-research", "agent-content"],
  dependencies: ["workflow-research"],
  approvalPolicy: "human-review",
  executionMode: "sequential",
  retryPolicy: "three-attempts",
  timeout: 900,
  runtime: "simulation",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  createdBy: "Seed",
  updatedBy: "Director",
  lifecycleStatus: "active",
  ownerAgent: "agent-content",
  successRate: 98.5,
  runsToday: 12,
  lastRun: "2026-01-02T09:00:00.000Z",
};

const encoded = encodeWorkflowRecord(record, TENANT_ID);

function row(overrides: Partial<WorkflowPostgresRow> = {}): WorkflowPostgresRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    tenant_id: TENANT_ID,
    name: encoded.name,
    description: encoded.description,
    orchestration_metadata: {
      canonicalSibling: { source: "execution-lineage" },
      ...encoded.orchestrationMetadataPatch,
    },
    lifecycle_status: encoded.lifecycleStatus,
    created_at: encoded.createdAt,
    updated_at: encoded.updatedAt,
    ...overrides,
  };
}

assert.equal(encoded.logicalId, record.id);
assert.notEqual(row().id, record.id);
assert.deepEqual(decodeWorkflowRow(row(), TENANT_ID), record);

for (const invalid of [
  row({ description: null }),
  row({ orchestration_metadata: null }),
  row({
    orchestration_metadata: {
      hebunWorkflowCrudV1: {
        ...encoded.orchestrationMetadataPatch.hebunWorkflowCrudV1,
        schemaVersion: 2,
      },
    },
  }),
  row({
    orchestration_metadata: {
      hebunWorkflowCrudV1: {
        ...encoded.orchestrationMetadataPatch.hebunWorkflowCrudV1,
        unknown: true,
      },
    },
  }),
]) {
  assert.throws(
    () => decodeWorkflowRow(invalid, TENANT_ID),
    (error: { code?: string }) =>
      error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
  );
}

assert.throws(
  () => decodeWorkflowRow(row({ id: "not-a-uuid" }), TENANT_ID),
  (error: { code?: string }) =>
    error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () =>
    decodeWorkflowRow(row(), "33333333-3333-4333-8333-333333333333"),
  (error: { code?: string }) => error.code === "PERSISTENCE_TENANT_MISMATCH",
);
assert.throws(
  () =>
    decodeWorkflowRows(
      [row(), row({ id: "44444444-4444-4444-8444-444444444444" })],
      TENANT_ID,
    ),
  (error: { code?: string }) =>
    error.code === "PERSISTENCE_LOGICAL_ID_CONFLICT",
);

console.log("workflow postgres codec checks passed");
