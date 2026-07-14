import assert from "node:assert/strict";
import { getNodeSnapshot, type KnowledgeNodeRecord } from "../../src/features/knowledge-crud";
import { runKnowledgeShadowRead } from "../../src/features/knowledge-shadow-read";
import type { KnowledgeShadowReadInput } from "../../src/features/knowledge-shadow-read";
import type { CanonicalReadServices } from "../../src/features/canonical-read";

const input: KnowledgeShadowReadInput = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  factKey: "goals-goal-1",
  domainKey: "goals",
  knowledgeScope: "company-wide",
};

const memoryNode: KnowledgeNodeRecord = {
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

function canonicalServices(
  override: Partial<
    Awaited<ReturnType<CanonicalReadServices["selectCanonicalKnowledgeFact"]>>
  >,
): CanonicalReadServices {
  return {
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
      identity: input,
      fact: {
        tenantId: input.tenantId,
        factKey: input.factKey,
        domainKey: input.domainKey,
        knowledgeScope: input.knowledgeScope,
        factVersion: 1,
      },
      activeNode: {
        id: "db-node-1",
        type: "fact",
        label: "Goal One",
        refId: "goals:goal-1",
        statement: "Canonical statement",
        lifecycleStatus: "active",
        health: "current",
        authority: "authoritative",
        ratifiedAt: "2026-07-12T09:00:00.000Z",
        knowledgeVersion: 1,
      },
      warnings: [],
      ...override,
    }),
  };
}

async function main() {
  const beforeSnapshot = getNodeSnapshot();

  const matched = await runKnowledgeShadowRead(input, {
    canonicalReadServices: canonicalServices({}),
    memoryNodes: [memoryNode],
  });
  assert.equal(matched.status, "partial-match");
  assert.equal(matched.memory.found, true);
  assert.equal(matched.postgres.found, true);

  const memoryOnly = await runKnowledgeShadowRead(input, {
    canonicalReadServices: canonicalServices({
      status: "not-found",
      resolved: false,
      fact: undefined,
      activeNode: undefined,
      reason: "fact-not-found",
      error: {
        code: "not_found",
        message: "missing",
        retryable: false,
      },
    }),
    memoryNodes: [memoryNode],
  });
  assert.equal(memoryOnly.status, "memory-only");

  const postgresOnly = await runKnowledgeShadowRead(input, {
    canonicalReadServices: canonicalServices({}),
    memoryNodes: [],
  });
  assert.equal(postgresOnly.status, "postgres-only");

  const notFound = await runKnowledgeShadowRead(input, {
    canonicalReadServices: canonicalServices({
      status: "not-found",
      resolved: false,
      fact: undefined,
      activeNode: undefined,
      reason: "fact-not-found",
      error: {
        code: "not_found",
        message: "missing",
        retryable: false,
      },
    }),
    memoryNodes: [],
  });
  assert.equal(notFound.status, "not-found");

  const unavailable = await runKnowledgeShadowRead(input, {
    canonicalReadServices: canonicalServices({
      status: "unavailable",
      resolved: false,
      fact: undefined,
      activeNode: undefined,
      reason: "missing_database_url",
      availability: {
        available: false,
        configured: false,
        source: "postgres",
        reason: "missing_database_url",
        warnings: [],
      },
      error: {
        code: "unavailable",
        message: "no database",
        retryable: false,
      },
    }),
    memoryNodes: [memoryNode],
  });
  assert.equal(unavailable.status, "unavailable");

  const tenantMismatch = await runKnowledgeShadowRead(input, {
    canonicalReadServices: canonicalServices({
      status: "tenant-mismatch",
      resolved: false,
      fact: undefined,
      activeNode: undefined,
      reason: "fact-tenant-mismatch",
      error: {
        code: "tenant_mismatch",
        message: "tenant mismatch",
        retryable: false,
      },
    }),
    memoryNodes: [memoryNode],
  });
  assert.equal(tenantMismatch.status, "tenant-mismatch");

  const invalid = await runKnowledgeShadowRead(
    { ...input, tenantId: "bad-uuid" },
    {
      canonicalReadServices: canonicalServices({}),
      memoryNodes: [memoryNode],
    },
  );
  assert.equal(invalid.status, "invalid-input");

  const afterSnapshot = getNodeSnapshot();
  assert.deepEqual(afterSnapshot, beforeSnapshot);

  console.log("knowledge-shadow-read service checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
