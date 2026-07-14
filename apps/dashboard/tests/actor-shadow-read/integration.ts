import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import {
  runActorShadowRead,
  type MemoryActorShadowSummary,
} from "../../src/features/actor-shadow-read";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_actor_shadow");

async function seedDatabase(): Promise<{
  tenantId: string;
  humanId: string;
  agentId: string;
  departmentId: string;
  replacementAgentId: string;
}> {
  const client = new Client({ connectionString: harness.dbUrl });
  await client.connect();
  const tenantId = randomUUID();
  const humanId = randomUUID();
  const roleId = randomUUID();
  const membershipId = randomUUID();
  const departmentId = randomUUID();
  const agentId = randomUUID();
  const replacementAgentId = randomUUID();
  try {
    await client.query("begin");
    await client.query(
      `insert into public.companies (id, name, slug)
       values ($1, 'Tenant A', 'tenant-a')`,
      [tenantId],
    );
    await client.query(
      `insert into public.roles (id, tenant_id, name, type)
       values ($1, $2, 'Owner', 'owner')`,
      [roleId, tenantId],
    );
    await client.query(
      `update public.roles
          set authority_rank = 1
        where id = $1`,
      [roleId],
    );
    await client.query(
      `insert into public.users (id, email, name, display_name)
       values ($1, 'alice@example.com', 'Alice Example', 'Alice Example')`,
      [humanId],
    );
    await client.query(
      `insert into public.departments (id, tenant_id, name, slug)
       values ($1, $2, 'Operations', 'operations')`,
      [departmentId, tenantId],
    );
    await client.query(
      `insert into public.memberships (
         id, tenant_id, user_id, role_id, authority_scope, effective_from,
         delegated_by_type, delegated_by_id
       ) values (
         $1, $2, $3, $4, 'company', '2026-07-01T00:00:00.000Z'::timestamptz,
         'human', $3
       )`,
      [membershipId, tenantId, humanId, roleId],
    );
    await client.query(
      `insert into public.agents (
         id, tenant_id, department_id, name, role, agent_lifecycle_status,
         agent_health, agent_type, risk_level, config_version
       ) values (
         $1, $2, $3, 'Ops Agent Replacement', 'operator', 'active',
         'healthy', 'operator', 'low', 1
       )`,
      [replacementAgentId, tenantId, departmentId],
    );
    await client.query(
      `insert into public.agents (
         id, tenant_id, department_id, name, role, human_owner_type, human_owner_id,
         manager_actor_type, manager_actor_id, agent_lifecycle_status,
         agent_health, agent_type, risk_level, authority_ceiling, config_version,
         replaced_by_agent_id
       ) values (
         $1, $2, $3, 'Ops Agent', 'operator', 'human', $4, 'human', $4,
         'active', 'healthy', 'operator', 'low', '{"scope":"department"}'::jsonb, 7,
         $5
       )`,
      [agentId, tenantId, departmentId, humanId, replacementAgentId],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }

  return { tenantId, humanId, agentId, departmentId, replacementAgentId };
}

async function main() {
  await harness.createDatabase();
  try {
    harness.migrateDatabase();
    const seeded = await seedDatabase();

    const humanMemory: MemoryActorShadowSummary = {
      source: "no-human-registry",
      actorType: "human",
      actorId: seeded.humanId,
      tenantId: seeded.tenantId,
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
        effectiveFrom: "2026-07-01T00:00:00.000Z",
      },
    };

    const humanResult = await runActorShadowRead(
      {
        tenantId: seeded.tenantId,
        actorType: "human",
        actorId: seeded.humanId,
      },
      {
        env: {
          ...process.env,
          HEBUN_CANONICAL_READ_DATABASE_URL: harness.dbUrl,
        },
        memorySummary: humanMemory,
      },
    );
    assert.equal(humanResult.postgres.found, true);
    assert.equal(humanResult.memory.found, true);
    assert.ok(["matched", "partial-match"].includes(humanResult.status));
    assert.equal(humanResult.postgres.summary?.membership?.authorityRank, 1);
    assert.equal(
      humanResult.postgres.summary?.membership?.delegatedByActorType,
      "human",
    );
    assert.equal(humanResult.postgres.summary?.authority?.roleRank, 1);

    const agentMemory: MemoryActorShadowSummary = {
      source: "agent-crud",
      actorType: "agent",
      actorId: seeded.agentId,
      tenantId: seeded.tenantId,
      displayLabel: "Ops Agent",
      lifecycleStatus: "active",
      active: true,
      suspended: false,
      archived: false,
      department: "Operations",
      ownership: {
        humanOwnerActorType: "human",
        humanOwnerActorId: seeded.humanId,
        humanOwnerDisplayLabel: "Alice Example",
        managerActorType: "human",
        managerActorId: seeded.humanId,
        managerDisplayLabel: "Alice Example",
        replacementActorId: seeded.replacementAgentId,
      },
      agentType: "operator",
      health: "healthy",
      riskLevel: "low",
      authority: {
        authorityCeilingSummary: "object:scope",
        configProfileVersion: "7",
      },
    };

    const agentResult = await runActorShadowRead(
      {
        tenantId: seeded.tenantId,
        actorType: "agent",
        actorId: seeded.agentId,
      },
      {
        env: {
          ...process.env,
          HEBUN_CANONICAL_READ_DATABASE_URL: harness.dbUrl,
        },
        memorySummary: agentMemory,
      },
    );
    assert.equal(agentResult.postgres.found, true);
    assert.equal(agentResult.memory.found, true);
    assert.ok(["matched", "partial-match"].includes(agentResult.status));
    assert.equal(agentResult.postgres.summary?.department, "Operations");
    assert.equal(
      agentResult.postgres.summary?.authority?.authorityCeilingSummary,
      "object:scope",
    );
    assert.equal(
      agentResult.postgres.summary?.ownership?.replacementActorId,
      seeded.replacementAgentId,
    );

    const unresolvedSystem = await runActorShadowRead(
      {
        tenantId: seeded.tenantId,
        actorType: "system",
        actorId: randomUUID(),
      },
      {
        env: {
          ...process.env,
          HEBUN_CANONICAL_READ_DATABASE_URL: harness.dbUrl,
        },
      },
    );
    assert.equal(unresolvedSystem.status, "unresolved-actor-type");

    console.log("actor-shadow-read integration checks passed");
  } finally {
    await harness.dropDatabase();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
