import assert from "node:assert/strict";
import type { CanonicalReadServices } from "../../src/features/canonical-read";
import { createKnowledgeCanonicalRepository } from "../../src/features/knowledge-canonical-repository";
import type { KnowledgeNodeRecord } from "../../src/features/knowledge-crud";

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

  const repository = createKnowledgeCanonicalRepository({
    memoryNodes: [baseNode],
    canonicalReadServices,
  });

  assert.equal(repository.authoritative.descriptor.provider, "memory");
  assert.equal(repository.authoritative.descriptor.authoritative, true);
  assert.deepEqual(repository.authoritative.descriptor.capabilities, {
    read: true,
    write: false,
    shadow: false,
  });

  const authoritativeFound = await repository.authoritative.findOne({
    tenantId: "11111111-1111-4111-8111-111111111111",
    factKey: "goals-goal-1",
    domainKey: "goals",
    knowledgeScope: "company-wide",
  });
  assert.equal(authoritativeFound.status, "found");
  assert.equal(authoritativeFound.node?.title, "Goal One");
  assert.equal(authoritativeFound.node?.logicalIdentity.lookupKeyType, "slug");

  const authoritativeInvalid = await repository.authoritative.findOne({
    tenantId: "bad-id",
    factKey: "",
  });
  assert.equal(authoritativeInvalid.status, "invalid-input");

  assert.equal(repository.shadow.descriptor.provider, "postgres");
  assert.equal(repository.shadow.descriptor.authoritative, false);
  assert.deepEqual(repository.shadow.descriptor.capabilities, {
    read: true,
    write: false,
    shadow: true,
  });
  assert.equal(await repository.shadow.isAvailable(), true);

  const shadowFound = await repository.shadow.findShadow({
    tenantId: "11111111-1111-4111-8111-111111111111",
    factKey: "goals-goal-1",
    domainKey: "goals",
    knowledgeScope: "company-wide",
  });
  assert.equal(shadowFound.status, "found");
  assert.equal(shadowFound.node?.logicalIdentity.nodeId, "goals:goal-1");

  console.log("knowledge canonical repository checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
