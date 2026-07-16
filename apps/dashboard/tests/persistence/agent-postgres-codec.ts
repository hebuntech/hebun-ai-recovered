import assert from "node:assert/strict";
import type { AgentCrudRecord } from "../../src/features/agent-crud/types";
import {
  decodeAgentRow,
  decodeAgentRows,
  encodeAgentRecord,
  type AgentPostgresRow,
} from "../../src/features/persistence/agent-postgres-codec";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const DEPARTMENT_ID = "22222222-2222-4222-8222-222222222222";

const record: AgentCrudRecord = {
  id: "agent-seo",
  name: "SEO Agent",
  slug: "seo-agent",
  description: "Search optimization agent.",
  department: "Marketing",
  category: "Search Optimization",
  owner: "Marketing",
  status: "running",
  version: "v1.4.2",
  capabilities: ["Search Optimization", "Marketing execution"],
  provider: "reference-simulation-provider",
  model: "gpt-5.4-mini",
  tools: ["search", "analytics"],
  permissions: ["agent.read", "workflow.execute"],
  runtime: "simulation",
  memory: "Marketing working memory",
  knowledge: "Marketing playbooks",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  createdBy: "Seed",
  updatedBy: "Seed",
  lifecycleStatus: "active",
  role: "Search Optimization",
  tasksToday: 32,
  costToday: 2.14,
  lastActive: "2m ago",
};

const encoded = encodeAgentRecord(record, TENANT_ID);

function row(overrides: Partial<AgentPostgresRow> = {}): AgentPostgresRow {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    tenant_id: TENANT_ID,
    department_id: DEPARTMENT_ID,
    department_name: record.department,
    department_tenant_id: TENANT_ID,
    department_match_count: 1,
    name: encoded.name,
    role: encoded.role,
    provider_profile: {
      canonicalSibling: { executionPosture: "simulation" },
      ...encoded.providerProfilePatch,
    },
    lifecycle_status: encoded.lifecycleStatus,
    created_at: encoded.createdAt,
    updated_at: encoded.updatedAt,
    ...overrides,
  };
}

assert.equal(encoded.logicalId, record.id);
assert.notEqual(row().id, record.id);
assert.deepEqual(decodeAgentRow(row(), TENANT_ID), record);

assert.throws(
  () => decodeAgentRow(row({ provider_profile: null }), TENANT_ID),
  (error: { code?: string }) => error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () =>
    decodeAgentRow(
      row({
        provider_profile: {
          hebunAgentCrudV1: {
            ...encoded.providerProfilePatch.hebunAgentCrudV1,
            schemaVersion: 2,
          },
        },
      }),
      TENANT_ID,
    ),
  (error: { code?: string }) => error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () =>
    decodeAgentRow(
      row({
        provider_profile: {
          hebunAgentCrudV1: {
            ...encoded.providerProfilePatch.hebunAgentCrudV1,
            unsupported: true,
          },
        },
      }),
      TENANT_ID,
    ),
  (error: { code?: string }) => error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () => decodeAgentRow(row({ id: "not-a-uuid" }), TENANT_ID),
  (error: { code?: string }) => error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () => decodeAgentRow(row({ department_id: null }), TENANT_ID),
  (error: { code?: string }) => error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () => decodeAgentRow(row({ department_match_count: 2 }), TENANT_ID),
  (error: { code?: string }) => error.code === "PERSISTENCE_INVALID_RECORD_MAPPING",
);
assert.throws(
  () => decodeAgentRow(row(), "44444444-4444-4444-8444-444444444444"),
  (error: { code?: string }) => error.code === "PERSISTENCE_TENANT_MISMATCH",
);
assert.throws(
  () => decodeAgentRows([row(), row({ id: "55555555-5555-4555-8555-555555555555" })], TENANT_ID),
  (error: { code?: string }) => error.code === "PERSISTENCE_LOGICAL_ID_CONFLICT",
);

console.log("agent postgres codec checks passed");
