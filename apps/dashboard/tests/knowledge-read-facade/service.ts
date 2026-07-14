import assert from "node:assert/strict";
import {
  getNodeSnapshot,
  type KnowledgeNodeRecord,
} from "../../src/features/knowledge-crud";
import { readKnowledgeFromMemoryFacade } from "../../src/features/knowledge-read-facade";
import {
  createKnowledgeSilentDualReadMetricsSink,
} from "../../src/features/knowledge-silent-dual-read";
import type { CanonicalReadServices } from "../../src/features/canonical-read";

const baseNode: KnowledgeNodeRecord = {
  id: "goals:goal-1",
  title: "Goal One",
  slug: "goals-goal-1",
  description: "Canonical statement",
  nodeType: "Goal",
  ownerType: "organization",
  ownerId: "director",
  confidence: 98,
  importance: "critical",
  status: "verified",
  version: "1",
  source: "goals registry",
  tags: ["goals"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-07-12T10:00:00.000Z",
  createdBy: "Seed",
  updatedBy: "Seed",
  lifecycleStatus: "active",
};

async function main() {
  const beforeSnapshot = JSON.stringify(getNodeSnapshot());

  const found = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      factKey: "goals-goal-1",
      domainKey: "goals",
      knowledgeScope: "company-wide",
    },
    { memoryNodes: [baseNode] },
  );
  assert.equal(found.status, "found");
  assert.equal(found.found, true);
  assert.equal(found.node?.source, "memory");
  assert.equal(found.node?.logicalIdentity.lookupKeyType, "slug");
  assert.equal(found.node?.logicalIdentity.nodeId, baseNode.id);
  assert.equal(found.node?.title, "Goal One");
  assert.equal(found.node?.tenantBoundary.verification, "partial");
  assert.ok(found.nonComparableFields.includes("tenantId"));
  assert.notEqual(found.node?.sourceMetadata.tags, baseNode.tags);

  const notFound = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      factKey: "missing-key",
    },
    { memoryNodes: [baseNode] },
  );
  assert.equal(notFound.status, "not-found");

  const invalid = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "bad-id",
      factKey: "",
    },
    { memoryNodes: [baseNode] },
  );
  assert.equal(invalid.status, "invalid-input");

  const deterministicA = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      factKey: "goals-goal-1",
      domainKey: "goals",
      knowledgeScope: "company-wide",
    },
    { memoryNodes: [baseNode] },
  );
  const deterministicB = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      factKey: "goals-goal-1",
      domainKey: "goals",
      knowledgeScope: "company-wide",
    },
    { memoryNodes: [baseNode] },
  );
  assert.deepEqual(
    {
      ...deterministicA,
      readAt: "ignored",
    },
    {
      ...deterministicB,
      readAt: "ignored",
    },
  );

  const tenantTaggedNode: KnowledgeNodeRecord = {
    ...baseNode,
    tags: ["tenant:11111111-1111-4111-8111-111111111111", "goals"],
  };
  const tenantMatch = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      factKey: "goals-goal-1",
      domainKey: "goals",
      knowledgeScope: "company-wide",
    },
    { memoryNodes: [tenantTaggedNode] },
  );
  assert.equal(tenantMatch.status, "found");
  assert.equal(tenantMatch.node?.tenantBoundary.verification, "verified");
  assert.equal(
    tenantMatch.node?.tenantBoundary.memoryTenantId,
    "11111111-1111-4111-8111-111111111111",
  );

  const tenantMismatch = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "22222222-2222-4222-8222-222222222222",
      factKey: "goals-goal-1",
    },
    { memoryNodes: [tenantTaggedNode] },
  );
  assert.equal(tenantMismatch.status, "tenant-mismatch");

  const canonicalReadServices: CanonicalReadServices = {
    availability: async () => ({
      available: true,
      configured: true,
      source: "postgres",
      warnings: [],
    }),
    dispose: async () => undefined,
    resolveActor: async () => {
      throw new Error("not used");
    },
    getExecutionLineage: async () => {
      throw new Error("not used");
    },
    selectCanonicalKnowledgeFact: async () => ({
      kind: "canonical-knowledge-fact",
      status: "resolved",
      resolved: true,
      availability: {
        available: true,
        configured: true,
        source: "postgres",
        warnings: [],
      },
      identity: {
        tenantId: "11111111-1111-4111-8111-111111111111",
        factKey: "goals-goal-1",
        domainKey: "goals",
        knowledgeScope: "company-wide",
      },
      fact: {
        tenantId: "11111111-1111-4111-8111-111111111111",
        factKey: "goals-goal-1",
        domainKey: "goals",
        knowledgeScope: "company-wide",
        factVersion: 1,
      },
      activeNode: {
        id: "db-node-1",
        type: "fact",
        label: "Goal One",
        refId: "goals:goal-1",
        statement: "Canonical statement",
        lifecycleStatus: "active",
        knowledgeVersion: 1,
      },
      warnings: [],
    }),
  };
  const baselineFound = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      factKey: "goals-goal-1",
      domainKey: "goals",
      knowledgeScope: "company-wide",
    },
    { memoryNodes: [baseNode] },
  );
  const hookedFound = await readKnowledgeFromMemoryFacade(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      factKey: "goals-goal-1",
      domainKey: "goals",
      knowledgeScope: "company-wide",
    },
    {
      memoryNodes: [baseNode],
      env: {
        NODE_ENV: "development",
        HEBUN_ENABLE_KNOWLEDGE_SILENT_DUAL_READ: "true",
        HEBUN_KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST:
          "11111111-1111-4111-8111-111111111111",
        HEBUN_KNOWLEDGE_DUAL_READ_SAMPLE_RATE: "1",
        HEBUN_KNOWLEDGE_DUAL_READ_TIMEOUT_MS: "100",
      },
      metricsSink: createKnowledgeSilentDualReadMetricsSink({
        NODE_ENV: "development",
      }),
      canonicalReadServices,
    },
  );
  assert.deepEqual(
    {
      ...baselineFound,
      readAt: "ignored",
    },
    {
      ...hookedFound,
      readAt: "ignored",
    },
  );

  const serializable = JSON.parse(JSON.stringify(found));
  assert.equal(serializable.status, "found");
  assert.equal(serializable.node.title, "Goal One");

  const afterSnapshot = JSON.stringify(getNodeSnapshot());
  assert.equal(beforeSnapshot, afterSnapshot);

  console.log("knowledge-read-facade service checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
