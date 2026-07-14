import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { runKnowledgeShadowRead } from "../../src/features/knowledge-shadow-read";
import type { KnowledgeNodeRecord } from "../../src/features/knowledge-crud";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_knowledge_shadow");

async function seedDatabase(memoryNode: KnowledgeNodeRecord): Promise<{
  tenantId: string;
}> {
  const client = new Client({ connectionString: harness.dbUrl });
  await client.connect();
  const tenantId = randomUUID();
  const missionId = randomUUID();
  const governanceSessionId = randomUUID();
  const decisionRecordId = randomUUID();
  const nodeId = randomUUID();
  const factId = randomUUID();
  const actorId = randomUUID();
  try {
    await client.query("begin");
    await client.query(
      `insert into public.companies (id, name, slug) values ($1, 'Tenant A', 'tenant-a')`,
      [tenantId],
    );
    await client.query(
      `insert into public.users (id, email, name, display_name)
       values ($1, 'actor@example.com', 'Actor', 'Actor')`,
      [actorId],
    );
    await client.query(
      `insert into public.governance_sessions (
         id, tenant_id, governance_domain, decision_type, subject_type,
         proposer_actor_type, proposer_actor_id, risk_class
       ) values ($1, $2, 'knowledge-ratification', 'ratify', 'knowledge-fact', 'human', $3, 'medium')`,
      [governanceSessionId, tenantId, actorId],
    );
    await client.query(
      `insert into public.decision_records (
         id, tenant_id, session_id, decision_type, subject_type,
         actor_type, actor_id, outcome, justification
       ) values ($1, $2, $3, 'ratify', 'knowledge-fact', 'human', $4, 'approved', 'shadow verification')`,
      [decisionRecordId, tenantId, governanceSessionId, actorId],
    );
    await client.query(
      `insert into public.missions (
         id, tenant_id, statement, scope, mission_lifecycle_status, mission_version
       ) values ($1, $2, 'Mission', 'company', 'ratified', 1)`,
      [missionId, tenantId],
    );
    await client.query(
      `insert into public.knowledge_nodes (
         id, tenant_id, type, ref_id, label, statement, knowledge_lifecycle_status,
         knowledge_health, knowledge_scope, knowledge_authority, domain_key,
         governance_session_id, ratification_decision_id, ratified_by_actor_type,
         ratified_by_actor_id, ratified_at, freshness_evaluated_at, knowledge_version
       ) values (
         $1, $2, 'fact', $3, $4, $5, 'ratified', 'current', 'company-wide',
         'authoritative', $6, $7, $8, 'human', $9, now(),
         '2026-07-12T10:00:00.000Z'::timestamptz, 1
       )`,
      [
        nodeId,
        tenantId,
        memoryNode.id,
        memoryNode.title,
        memoryNode.description,
        memoryNode.tags[0],
        governanceSessionId,
        decisionRecordId,
        actorId,
      ],
    );
    await client.query(
      `insert into public.knowledge_facts (
         id, tenant_id, fact_key, domain_key, knowledge_scope, active_knowledge_node_id, fact_version
       ) values ($1, $2, $3, $4, 'company-wide', $5, 1)`,
      [factId, tenantId, memoryNode.slug, memoryNode.tags[0], nodeId],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }

  return { tenantId };
}

async function main() {
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

  await harness.createDatabase();
  try {
    harness.migrateDatabase();
    const seeded = await seedDatabase(memoryNode);
    const result = await runKnowledgeShadowRead(
      {
        tenantId: seeded.tenantId,
        factKey: memoryNode.slug,
        domainKey: "goals",
        knowledgeScope: "company-wide",
      },
      {
        env: {
          ...process.env,
          HEBUN_CANONICAL_READ_DATABASE_URL: harness.dbUrl,
        },
        memoryNodes: [memoryNode],
      },
    );

    assert.equal(result.memory.found, true);
    assert.equal(result.postgres.found, true);
    assert.equal(result.status, "mismatch");
    assert.ok(result.diff.mismatchCategories.includes("lifecycle mismatch"));

    console.log("knowledge-shadow-read integration checks passed");
  } finally {
    await harness.dropDatabase();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
