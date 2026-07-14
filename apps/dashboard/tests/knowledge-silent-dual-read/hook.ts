import assert from "node:assert/strict";
import type { CanonicalReadServices } from "../../src/features/canonical-read";
import type { KnowledgeReadResult } from "../../src/features/knowledge-read-facade";
import {
  KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
  createKnowledgeSilentDualReadMetricsSink,
  runKnowledgeSilentDualReadHookForFacade,
} from "../../src/features/knowledge-silent-dual-read";

function canonicalServices(
  override: Partial<
    Awaited<ReturnType<CanonicalReadServices["selectCanonicalKnowledgeFact"]>>
  > = {},
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

function foundResult(): KnowledgeReadResult {
  return {
    kind: "knowledge-read-facade",
    status: "found",
    request: {
      tenantId: "11111111-1111-4111-8111-111111111111",
      factKey: "goals-goal-1",
      domainKey: "goals",
      knowledgeScope: "company-wide",
    },
    found: true,
    availability: {
      available: true,
      source: "memory",
    },
    source: "memory",
    node: {
      source: "memory",
      logicalIdentity: {
        tenantId: "11111111-1111-4111-8111-111111111111",
        factKey: "goals-goal-1",
        domainKey: "goals",
        knowledgeScope: "company-wide",
        lookupKeyType: "slug",
        nodeId: "goals:goal-1",
      },
      title: "Goal One",
      statementSummary: "Canonical statement",
      lifecycleStatus: "active",
      version: "1",
      sourceMetadata: {
        source: "goals registry",
        tags: ["goals"],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-07-12T10:00:00.000Z",
        createdBy: "Seed",
        updatedBy: "Seed",
      },
      tenantBoundary: {
        requestedTenantId: "11111111-1111-4111-8111-111111111111",
        verification: "partial",
      },
    },
    warnings: [],
    nonComparableFields: ["tenantId"],
    readAt: "2026-07-12T10:00:00.000Z",
  };
}

async function main() {
  const env: NodeJS.ProcessEnv = {
    NODE_ENV: "development",
    HEBUN_ENABLE_KNOWLEDGE_SILENT_DUAL_READ: "true",
    HEBUN_KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST:
      "11111111-1111-4111-8111-111111111111",
    HEBUN_KNOWLEDGE_DUAL_READ_SAMPLE_RATE: "1",
    HEBUN_KNOWLEDGE_DUAL_READ_TIMEOUT_MS: "100",
  };

  const metricsSink = createKnowledgeSilentDualReadMetricsSink(env);
  const observation = await runKnowledgeSilentDualReadHookForFacade(
    foundResult(),
    {
      env,
      metricsSink,
      canonicalReadServices: canonicalServices({}),
      memoryNodes: [
        {
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
        },
      ],
    },
  );
  assert.equal(observation.executed, true);
  assert.equal(observation.status, "partial-match");
  assert.equal(observation.timedOut, false);
  assert.equal(
    metricsSink.snapshot().counters.shadow_rollout_enabled_count,
    1,
  );
  assert.equal(
    metricsSink.snapshot().counters.shadow_rollout_sampled_count,
    1,
  );
  assert.equal(
    metricsSink.snapshot().counters.shadow_knowledge_executed_count,
    1,
  );
  assert.equal(
    metricsSink.snapshot().counters.shadow_knowledge_partial_match_count,
    1,
  );
  assert.ok(metricsSink.snapshot().latencySamples.length === 1);

  const timedOut = await runKnowledgeSilentDualReadHookForFacade(foundResult(), {
    env: {
      ...env,
      HEBUN_KNOWLEDGE_DUAL_READ_TIMEOUT_MS: "1",
    },
    metricsSink: createKnowledgeSilentDualReadMetricsSink({
      NODE_ENV: "development",
    }),
    canonicalReadServices: {
      ...canonicalServices({}),
      selectCanonicalKnowledgeFact: async (...args) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return canonicalServices({}).selectCanonicalKnowledgeFact(...args);
      },
    },
    memoryNodes: [],
  });
  assert.equal(timedOut.executed, true);
  assert.equal(timedOut.timedOut, true);
  assert.equal(timedOut.errorCategory, "timeout");

  const ineligible = await runKnowledgeSilentDualReadHookForFacade(foundResult(), {
    env: {
      NODE_ENV: "development",
      HEBUN_ENABLE_KNOWLEDGE_SILENT_DUAL_READ: "false",
    },
    metricsSink: createKnowledgeSilentDualReadMetricsSink({
      NODE_ENV: "development",
    }),
    canonicalReadServices: canonicalServices({}),
  });
  assert.equal(ineligible.executed, false);

  const killedMetrics = createKnowledgeSilentDualReadMetricsSink({
    NODE_ENV: "development",
  });
  const killed = await runKnowledgeSilentDualReadHookForFacade(foundResult(), {
    env: {
      ...env,
      HEBUN_DISABLE_KNOWLEDGE_SILENT_DUAL_READ: "true",
    },
    metricsSink: killedMetrics,
    canonicalReadServices: canonicalServices({}),
  });
  assert.equal(killed.executed, false);
  assert.equal(killedMetrics.snapshot().counters.shadow_rollout_killswitch_count, 1);
  assert.equal(killedMetrics.snapshot().counters.shadow_rollout_skipped_count, 1);

  const nonFound = await runKnowledgeSilentDualReadHookForFacade({
    ...foundResult(),
    status: "not-found",
    found: false,
    node: undefined,
  });
  assert.equal(nonFound.executed, false);

  assert.equal(
    KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
    "v1",
  );

  console.log("knowledge-silent-dual-read hook checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
