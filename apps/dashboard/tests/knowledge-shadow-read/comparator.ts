import assert from "node:assert/strict";
import { compareKnowledgeShadow } from "../../src/features/knowledge-shadow-read";
import type {
  KnowledgeShadowReadInput,
  MemoryKnowledgeShadowSummary,
  PostgresKnowledgeShadowSummary,
} from "../../src/features/knowledge-shadow-read";

const input: KnowledgeShadowReadInput = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  factKey: "goals-goal-1",
  domainKey: "goals",
  knowledgeScope: "company-wide",
};

function baseMemory(): MemoryKnowledgeShadowSummary {
  return {
    lookupKey: "goals-goal-1",
    lookupKeyType: "slug",
    nodeId: "goals:goal-1",
    title: "Goal One",
    statementSummary: "Canonical statement",
    lifecycleStatus: "active",
    health: "current",
    authority: "authoritative",
    ratificationPresent: true,
    version: "1",
    domainKey: "goals",
    knowledgeScope: "company-wide",
    provenance: { source: "registry" },
    sourceAttribution: { uri: "doc://goal-1" },
    freshnessUpdatedAt: "2026-07-12T10:00:00.000Z",
    supersessionState: "active",
  };
}

function basePostgres(): PostgresKnowledgeShadowSummary {
  return {
    factKey: "goals-goal-1",
    domainKey: "goals",
    knowledgeScope: "company-wide",
    nodeId: "db-node-1",
    refId: "goals:goal-1",
    title: "Goal One",
    statementSummary: "Canonical statement",
    lifecycleStatus: "active",
    health: "current",
    authority: "authoritative",
    ratificationPresent: true,
    version: 1,
    provenance: { source: "registry" },
    sourceAttribution: { uri: "doc://goal-1" },
    freshnessUpdatedAt: "2026-07-12T10:00:00.000Z",
    reviewAt: "2026-08-01T00:00:00.000Z",
    supersessionState: "active",
  };
}

function fieldStatus(
  diff: ReturnType<typeof compareKnowledgeShadow>,
  field: string,
): string | undefined {
  return [...diff.matchedFields, ...diff.mismatches, ...diff.nonComparableFields, ...diff.missingFields].find(
    (item) => item.field === field,
  )?.status;
}

async function main() {
  const exact = compareKnowledgeShadow({
    input,
    memory: baseMemory(),
    postgres: basePostgres(),
  });
  assert.equal(exact.mismatches.length, 0);
  assert.equal(fieldStatus(exact, "factKey"), "match");
  assert.equal(fieldStatus(exact, "nodeIdentity"), "match");

  const partial = compareKnowledgeShadow({
    input,
    memory: { ...baseMemory(), authority: undefined },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(partial, "authority"), "non-comparable");

  const contentMismatch = compareKnowledgeShadow({
    input,
    memory: { ...baseMemory(), statementSummary: "Memory statement" },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(contentMismatch, "statementSummary"), "mismatch");

  const lifecycleMismatch = compareKnowledgeShadow({
    input,
    memory: { ...baseMemory(), lifecycleStatus: "archived" },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(lifecycleMismatch, "lifecycleStatus"), "mismatch");

  const versionMismatch = compareKnowledgeShadow({
    input,
    memory: { ...baseMemory(), version: "2" },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(versionMismatch, "version"), "mismatch");

  const provenanceMismatch = compareKnowledgeShadow({
    input,
    memory: { ...baseMemory(), provenance: { source: "memory" } },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(provenanceMismatch, "provenance"), "mismatch");

  const nonComparable = compareKnowledgeShadow({
    input,
    memory: { ...baseMemory(), knowledgeScope: undefined },
    postgres: basePostgres(),
  });
  assert.equal(fieldStatus(nonComparable, "knowledgeScope"), "missing-memory");

  const nullSafe = compareKnowledgeShadow({
    input,
    memory: { ...baseMemory(), sourceAttribution: undefined },
    postgres: { ...basePostgres(), sourceAttribution: null },
  });
  assert.equal(fieldStatus(nullSafe, "sourceAttribution"), "non-comparable");

  const first = JSON.stringify(
    compareKnowledgeShadow({
      input,
      memory: baseMemory(),
      postgres: basePostgres(),
    }),
  );
  const second = JSON.stringify(
    compareKnowledgeShadow({
      input,
      memory: baseMemory(),
      postgres: basePostgres(),
    }),
  );
  assert.equal(first, second);

  console.log("knowledge-shadow-read comparator checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

