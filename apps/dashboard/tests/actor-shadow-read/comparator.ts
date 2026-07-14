import assert from "node:assert/strict";
import {
  compareActorShadow,
  type MemoryActorShadowSummary,
  type PostgresActorShadowSummary,
} from "../../src/features/actor-shadow-read";

const INPUT = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  actorType: "human",
  actorId: "22222222-2222-4222-8222-222222222222",
} as const;

function main() {
  const exactHumanMemory: MemoryActorShadowSummary = {
    source: "no-human-registry",
    actorType: "human",
    actorId: INPUT.actorId,
    tenantId: INPUT.tenantId,
    displayLabel: "Alice Example",
    lifecycleStatus: "active",
    active: true,
    suspended: false,
    archived: false,
    membership: {
      membershipExists: true,
      roleId: "33333333-3333-4333-8333-333333333333",
      roleName: "Owner",
      roleType: "owner",
      authorityScope: "company",
      effectiveFrom: "2026-07-01T00:00:00.000Z",
      effectiveUntil: null,
      membershipVersion: "2",
    },
    authority: {
      roleRank: 1,
      authorityScope: "company",
      delegatedByActorType: "human",
      delegatedByActorId: "44444444-4444-4444-8444-444444444444",
    },
  };
  const exactHumanPostgres: PostgresActorShadowSummary = {
    source: "canonical-actor-resolution",
    actorType: "human",
    actorId: INPUT.actorId,
    tenantId: INPUT.tenantId,
    resolved: true,
    displayLabel: "Alice Example",
    lifecycleStatus: "active",
    active: true,
    suspended: false,
    archived: false,
    sourceTable: "users",
    membership: {
      membershipExists: true,
      roleId: "33333333-3333-4333-8333-333333333333",
      roleName: "Owner",
      roleType: "owner",
      authorityScope: "company",
      effectiveFrom: "2026-07-01T00:00:00.000Z",
      effectiveUntil: null,
      membershipVersion: "2",
    },
    authority: {
      roleRank: 1,
      authorityScope: "company",
      delegatedByActorType: "human",
      delegatedByActorId: "44444444-4444-4444-8444-444444444444",
    },
  };
  const exactHuman = compareActorShadow({
    input: INPUT,
    memory: exactHumanMemory,
    postgres: exactHumanPostgres,
  });
  assert.equal(exactHuman.mismatches.length, 0);
  assert.ok(exactHuman.matchedFields.length > 5);

  const partialHuman = compareActorShadow({
    input: INPUT,
    memory: {
      ...exactHumanMemory,
      membership: null,
      authority: null,
    },
    postgres: exactHumanPostgres,
  });
  assert.ok(partialHuman.nonComparableFields.length > 0);
  assert.ok(partialHuman.mismatchCategories.includes("non-comparable field"));

  const membershipMismatch = compareActorShadow({
    input: INPUT,
    memory: {
      ...exactHumanMemory,
      membership: {
        ...exactHumanMemory.membership!,
        membershipExists: false,
      },
    },
    postgres: exactHumanPostgres,
  });
  assert.ok(
    membershipMismatch.mismatchCategories.includes("membership mismatch"),
  );

  const roleMismatch = compareActorShadow({
    input: INPUT,
    memory: {
      ...exactHumanMemory,
      membership: {
        ...exactHumanMemory.membership!,
        roleName: "Member",
      },
    },
    postgres: exactHumanPostgres,
  });
  assert.ok(roleMismatch.mismatchCategories.includes("role mismatch"));

  const suspensionMismatch = compareActorShadow({
    input: INPUT,
    memory: {
      ...exactHumanMemory,
      suspended: true,
    },
    postgres: exactHumanPostgres,
  });
  assert.ok(
    suspensionMismatch.mismatchCategories.includes("suspension mismatch"),
  );

  const exactAgentMemory: MemoryActorShadowSummary = {
    source: "agent-crud",
    actorType: "agent",
    actorId: "55555555-5555-4555-8555-555555555555",
    tenantId: INPUT.tenantId,
    displayLabel: "Ops Agent",
    lifecycleStatus: "active",
    active: true,
    suspended: false,
    archived: false,
    department: "Operations",
    agentType: "operator",
    health: "healthy",
    riskLevel: "low",
    ownership: {
      humanOwnerActorType: "human",
      humanOwnerActorId: INPUT.actorId,
      humanOwnerDisplayLabel: "Alice Example",
      managerActorType: "human",
      managerActorId: "66666666-6666-4666-8666-666666666666",
      managerDisplayLabel: "Manager Example",
      replacementActorId: null,
    },
    authority: {
      authorityCeilingSummary: "department:ops",
      configProfileVersion: "7",
    },
  };
  const exactAgentPostgres: PostgresActorShadowSummary = {
    source: "canonical-actor-resolution",
    actorType: "agent",
    actorId: "55555555-5555-4555-8555-555555555555",
    tenantId: INPUT.tenantId,
    resolved: true,
    displayLabel: "Ops Agent",
    lifecycleStatus: "active",
    active: true,
    suspended: false,
    archived: false,
    sourceTable: "agents",
    department: "Operations",
    agentType: "operator",
    health: "healthy",
    riskLevel: "low",
    ownership: {
      humanOwnerActorType: "human",
      humanOwnerActorId: INPUT.actorId,
      humanOwnerDisplayLabel: "Alice Example",
      managerActorType: "human",
      managerActorId: "66666666-6666-4666-8666-666666666666",
      managerDisplayLabel: "Manager Example",
      replacementActorId: null,
    },
    authority: {
      authorityCeilingSummary: "department:ops",
      configProfileVersion: "7",
    },
  };
  const exactAgent = compareActorShadow({
    input: { ...INPUT, actorType: "agent", actorId: exactAgentMemory.actorId },
    memory: exactAgentMemory,
    postgres: exactAgentPostgres,
  });
  assert.equal(exactAgent.mismatches.length, 0);

  const ownerMismatch = compareActorShadow({
    input: { ...INPUT, actorType: "agent", actorId: exactAgentMemory.actorId },
    memory: {
      ...exactAgentMemory,
      ownership: {
        ...exactAgentMemory.ownership!,
        humanOwnerActorId: "77777777-7777-4777-8777-777777777777",
      },
    },
    postgres: exactAgentPostgres,
  });
  assert.ok(ownerMismatch.mismatchCategories.includes("ownership mismatch"));

  const managerMismatch = compareActorShadow({
    input: { ...INPUT, actorType: "agent", actorId: exactAgentMemory.actorId },
    memory: {
      ...exactAgentMemory,
      ownership: {
        ...exactAgentMemory.ownership!,
        managerActorId: "88888888-8888-4888-8888-888888888888",
      },
    },
    postgres: exactAgentPostgres,
  });
  assert.ok(managerMismatch.mismatchCategories.includes("manager mismatch"));

  const lifecycleMismatch = compareActorShadow({
    input: { ...INPUT, actorType: "agent", actorId: exactAgentMemory.actorId },
    memory: {
      ...exactAgentMemory,
      lifecycleStatus: "suspended",
    },
    postgres: exactAgentPostgres,
  });
  assert.ok(lifecycleMismatch.mismatchCategories.includes("lifecycle mismatch"));

  const healthTypeRiskMismatch = compareActorShadow({
    input: { ...INPUT, actorType: "agent", actorId: exactAgentMemory.actorId },
    memory: {
      ...exactAgentMemory,
      agentType: "specialist",
      health: "blocked",
      riskLevel: "high",
    },
    postgres: exactAgentPostgres,
  });
  assert.ok(healthTypeRiskMismatch.mismatchCategories.includes("agent-type mismatch"));
  assert.ok(healthTypeRiskMismatch.mismatchCategories.includes("health mismatch"));
  assert.ok(healthTypeRiskMismatch.mismatchCategories.includes("risk mismatch"));

  const nonComparableAuthority = compareActorShadow({
    input: INPUT,
    memory: {
      ...exactHumanMemory,
      authority: null,
    },
    postgres: exactHumanPostgres,
  });
  assert.ok(nonComparableAuthority.nonComparableFields.length > 0);

  const orderedA = compareActorShadow({
    input: INPUT,
    memory: exactHumanMemory,
    postgres: exactHumanPostgres,
  });
  const orderedB = compareActorShadow({
    input: INPUT,
    memory: exactHumanMemory,
    postgres: exactHumanPostgres,
  });
  assert.deepEqual(orderedA, orderedB);

  const nullSafe = compareActorShadow({
    input: INPUT,
    memory: {
      ...exactHumanMemory,
      displayLabel: null,
    },
    postgres: {
      ...exactHumanPostgres,
      displayLabel: null,
    },
  });
  assert.equal(
    nullSafe.matchedFields.some((field) => field.field === "displayLabel"),
    true,
  );

  console.log("actor-shadow-read comparator checks passed");
}

main();
