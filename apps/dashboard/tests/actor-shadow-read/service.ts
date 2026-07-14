import assert from "node:assert/strict";
import {
  runActorShadowRead,
  type MemoryActorShadowSummary,
} from "../../src/features/actor-shadow-read";
import type {
  ActorResolutionResult,
  CanonicalReadServices,
} from "../../src/features/canonical-read";
import { getById as getAgentById } from "../../src/features/agent-crud/agent-queries";

function unavailableAvailability() {
  return {
    available: false,
    configured: false,
    source: "postgres" as const,
    warnings: [],
  };
}

function resolvedActor(
  overrides: Partial<ActorResolutionResult>,
): ActorResolutionResult {
  return {
    kind: "actor-resolution",
    status: "resolved",
    resolved: true,
    availability: {
      available: true,
      configured: true,
      source: "postgres",
      warnings: [],
    },
    actorRef: {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "human",
      actorId: "22222222-2222-4222-8222-222222222222",
    },
    tenantMatch: true,
    active: true,
    suspended: false,
    archived: false,
    warnings: [],
    ...overrides,
  };
}

function createStubServices(
  resolver: (
    input: Parameters<CanonicalReadServices["resolveActor"]>[0],
  ) => Promise<ActorResolutionResult>,
): CanonicalReadServices {
  return {
    availability: async () => ({
      available: true,
      configured: true,
      source: "postgres",
      warnings: [],
    }),
    dispose: async () => undefined,
    resolveActor: resolver,
    selectCanonicalKnowledgeFact: async () => {
      throw new Error("knowledge should not run");
    },
    getExecutionLineage: async () => {
      throw new Error("execution should not run");
    },
  };
}

async function main() {
  const baselineAgent = getAgentById("agent-seo");

  const humanMemory: MemoryActorShadowSummary = {
    source: "no-human-registry",
    actorType: "human",
    actorId: "22222222-2222-4222-8222-222222222222",
    tenantId: "11111111-1111-4111-8111-111111111111",
    displayLabel: "Alice Example",
    lifecycleStatus: "active",
    active: true,
    suspended: false,
    archived: false,
    membership: {
      membershipExists: true,
      roleName: "Owner",
      roleType: "owner",
      authorityScope: "company",
    },
  };
  const matchedHuman = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "human",
      actorId: "22222222-2222-4222-8222-222222222222",
    },
    {
      memorySummary: humanMemory,
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          displayLabel: "Alice Example",
          lifecycleStatus: "active",
          membershipSummary: {
            membershipId: "33333333-3333-4333-8333-333333333333",
            tenantId: "11111111-1111-4111-8111-111111111111",
            roleName: "Owner",
            roleType: "owner",
            authorityScope: "company",
            authorityRank: 1,
            delegatedByActorType: "human",
            delegatedByActorId: "44444444-4444-4444-8444-444444444444",
            membershipVersion: "2",
          },
        }),
      ),
    },
  );
  assert.equal(matchedHuman.status, "partial-match");

  const memoryOnlyHuman = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "human",
      actorId: "22222222-2222-4222-8222-222222222222",
    },
    {
      memorySummary: humanMemory,
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          status: "not-found",
          resolved: false,
          active: false,
          reason: "user-not-found",
          error: {
            code: "not_found",
            message: "missing",
            retryable: false,
          },
        }),
      ),
    },
  );
  assert.equal(memoryOnlyHuman.status, "memory-only");

  const postgresOnlyHuman = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "human",
      actorId: "22222222-2222-4222-8222-222222222222",
    },
    {
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          displayLabel: "Alice Example",
          lifecycleStatus: "active",
        }),
      ),
    },
  );
  assert.equal(postgresOnlyHuman.status, "postgres-only");

  const tenantMismatch = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "human",
      actorId: "22222222-2222-4222-8222-222222222222",
    },
    {
      memorySummary: humanMemory,
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          status: "tenant-mismatch",
          resolved: false,
          tenantMatch: false,
          active: false,
          reason: "membership-missing-for-tenant",
          error: {
            code: "tenant_mismatch",
            message: "mismatch",
            retryable: false,
          },
        }),
      ),
    },
  );
  assert.equal(tenantMismatch.status, "tenant-mismatch");

  const matchedAgent = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "agent",
      actorId: "55555555-5555-4555-8555-555555555555",
    },
    {
      memorySummary: {
        source: "agent-crud",
        actorType: "agent",
        actorId: "55555555-5555-4555-8555-555555555555",
        displayLabel: "SEO Agent",
        lifecycleStatus: "active",
        active: true,
        suspended: false,
        archived: false,
      },
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          actorRef: {
            tenantId: "11111111-1111-4111-8111-111111111111",
            actorType: "agent",
            actorId: "55555555-5555-4555-8555-555555555555",
          },
          displayLabel: "SEO Agent",
          sourceTable: "agents",
          lifecycleStatus: "active",
          department: "Marketing",
          agentType: "operator",
          health: "healthy",
          riskLevel: "low",
          managerActorSummary: {
            actorType: "human",
            actorId: "66666666-6666-4666-8666-666666666666",
            displayLabel: "Manager Example",
          },
          authorityCeilingSummary: "object:scope",
          configProfileVersion: "7",
        }),
      ),
    },
  );
  assert.ok(["matched", "partial-match"].includes(matchedAgent.status));
  assert.equal(
    matchedAgent.postgres.summary?.authority?.configProfileVersion,
    "7",
  );

  const suspendedAgent = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "agent",
      actorId: "55555555-5555-4555-8555-555555555555",
    },
    {
      memorySummary: {
        source: "agent-crud",
        actorType: "agent",
        actorId: "55555555-5555-4555-8555-555555555555",
        displayLabel: "SEO Agent",
        lifecycleStatus: "active",
        active: true,
        suspended: false,
        archived: false,
      },
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          actorRef: {
            tenantId: "11111111-1111-4111-8111-111111111111",
            actorType: "agent",
            actorId: "55555555-5555-4555-8555-555555555555",
          },
          displayLabel: "SEO Agent",
          sourceTable: "agents",
          lifecycleStatus: "suspended",
          active: false,
          suspended: true,
        }),
      ),
    },
  );
  assert.equal(suspendedAgent.status, "mismatch");

  const missingAgent = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "agent",
      actorId: "99999999-9999-4999-8999-999999999999",
    },
    {
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          actorRef: {
            tenantId: "11111111-1111-4111-8111-111111111111",
            actorType: "agent",
            actorId: "99999999-9999-4999-8999-999999999999",
          },
          status: "not-found",
          resolved: false,
          active: false,
          reason: "agent-not-found",
          error: {
            code: "not_found",
            message: "missing",
            retryable: false,
          },
        }),
      ),
    },
  );
  assert.equal(missingAgent.status, "not-found");

  const missingHuman = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "human",
      actorId: "77777777-7777-4777-8777-777777777777",
    },
    {
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          actorRef: {
            tenantId: "11111111-1111-4111-8111-111111111111",
            actorType: "human",
            actorId: "77777777-7777-4777-8777-777777777777",
          },
          status: "not-found",
          resolved: false,
          active: false,
          reason: "user-not-found",
          error: {
            code: "not_found",
            message: "missing",
            retryable: false,
          },
        }),
      ),
    },
  );
  assert.equal(missingHuman.status, "not-found");

  const unresolvedSystem = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "system",
      actorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    },
    {
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          actorRef: {
            tenantId: "11111111-1111-4111-8111-111111111111",
            actorType: "system",
            actorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          },
          status: "unresolved",
          resolved: false,
          active: false,
          reason: "registry-required",
        }),
      ),
    },
  );
  assert.equal(unresolvedSystem.status, "unresolved-actor-type");

  const unresolvedService = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "service",
      actorId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    },
    {
      canonicalReadServices: createStubServices(async () =>
        resolvedActor({
          actorRef: {
            tenantId: "11111111-1111-4111-8111-111111111111",
            actorType: "service",
            actorId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          },
          status: "unresolved",
          resolved: false,
          active: false,
          reason: "registry-required",
        }),
      ),
    },
  );
  assert.equal(unresolvedService.status, "unresolved-actor-type");

  const unavailable = await runActorShadowRead(
    {
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorType: "human",
      actorId: "22222222-2222-4222-8222-222222222222",
    },
    {
      memorySummary: humanMemory,
      canonicalReadServices: createStubServices(async () => ({
        kind: "actor-resolution",
        status: "unavailable",
        resolved: false,
        availability: unavailableAvailability(),
        actorRef: {
          tenantId: "11111111-1111-4111-8111-111111111111",
          actorType: "human",
          actorId: "22222222-2222-4222-8222-222222222222",
        },
        tenantMatch: false,
        active: false,
        suspended: false,
        archived: false,
        warnings: [],
        reason: "actor-query-failed",
      })),
    },
  );
  assert.equal(unavailable.status, "unavailable");

  const invalid = await runActorShadowRead({
    tenantId: "bad-id",
    actorType: "human",
    actorId: "bad-id",
  });
  assert.equal(invalid.status, "invalid-input");

  assert.deepEqual(getAgentById("agent-seo"), baselineAgent);

  console.log("actor-shadow-read service checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
