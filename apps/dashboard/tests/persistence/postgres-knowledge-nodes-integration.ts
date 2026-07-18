import assert from "node:assert/strict";
import { Client } from "pg";
import { getNodeSnapshot } from "../../src/features/knowledge-crud/node-adapter";
import type { KnowledgeNodeRecord } from "../../src/features/knowledge-crud/types";
import { runKnowledgeShadowRead } from "../../src/features/knowledge-shadow-read";
import {
  activeProvider,
  createRepository,
} from "../../src/features/persistence";
import type { PostgresPersistenceError } from "../../src/features/persistence/postgres-errors";
import { listRegisteredPersistenceProviders } from "../../src/features/persistence/provider-registry";
import { createPostgresAdapter } from "../../src/features/persistence/supabase-postgres-adapter";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_phase_3c2_verify");

function node(id: string, title = id): KnowledgeNodeRecord {
  return {
    id,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    description: `${title} canonical statement`,
    nodeType: "Goal",
    ownerType: "organization",
    ownerId: "director",
    confidence: 94,
    importance: "high",
    status: "verified",
    version: "v1.0.0",
    source: "goals registry",
    tags: ["goals", "director"],
    createdAt: "2026-07-15T10:00:00.000Z",
    updatedAt: "2026-07-15T10:00:00.000Z",
    createdBy: "Seed",
    updatedBy: "Seed",
    lifecycleStatus: "active",
  };
}

async function expectCode(
  run: () => Promise<unknown>,
  code: string,
): Promise<void> {
  await assert.rejects(run, (error: PostgresPersistenceError) => error.code === code);
}

function fieldMatched(
  result: Awaited<ReturnType<typeof runKnowledgeShadowRead>>,
  field: string,
): boolean {
  return result.diff.matchedFields.some((entry) => entry.field === field);
}

async function main(): Promise<void> {
  await harness.createDatabase();
  let adapter:
    | ReturnType<typeof createPostgresAdapter<KnowledgeNodeRecord>>
    | undefined;
  const setup = new Client({ connectionString: harness.dbUrl });
  try {
    harness.migrateDatabase();
    await setup.connect();
    const object = await setup.query<{ relation: string | null }>(
      "select to_regclass('public.knowledge_nodes')::text as relation",
    );
    assert.equal(object.rows[0]?.relation, "knowledge_nodes");

    const tenants = await setup.query<{ id: string }>(
      `insert into companies (name, slug)
       values ('Knowledge Tenant A', 'knowledge-tenant-a'),
              ('Knowledge Tenant B', 'knowledge-tenant-b')
       returning id`,
    );
    const tenantA = tenants.rows[0]!.id;
    const tenantB = tenants.rows[1]!.id;
    const contextA = { tenantId: tenantA };
    const contextB = { tenantId: tenantB };
    const env: NodeJS.ProcessEnv = {
      HEBUN_PERSISTENCE_POSTGRES_DATABASE_URL: harness.dbUrl,
      HEBUN_CANONICAL_READ_DATABASE_URL: harness.dbUrl,
      NODE_ENV: "test",
    };

    adapter = createPostgresAdapter<KnowledgeNodeRecord>({
      collection: "knowledge-nodes",
      seed: () => [],
      env,
    });
    assert.equal(activeProvider(), "memory");
    assert.deepEqual(adapter.manifest.supportedCollections, [
      "registries",
      "knowledge-nodes",
      "agents",
      "workflows",
      "memories",
    ]);
    assert.equal(adapter.manifest.transactional, true);
    assert.equal(adapter.manifest.tenantIsolation, false);

    const memoryBefore = getNodeSnapshot();
    const sample = node("goals:goal-1", "Goal One");
    const missingTenantOperations: Array<() => Promise<unknown>> = [
      () => adapter!.load(),
      () => adapter!.save([]),
      () => adapter!.create(sample),
      () => adapter!.update(sample.id, { title: "Updated" }),
      () => adapter!.delete(sample.id),
      () => adapter!.restore(sample.id),
      () => adapter!.archive(sample.id),
      () => adapter!.exists(sample.id),
      () => adapter!.list(),
      () => adapter!.find(() => true),
      () => adapter!.clear(),
      () => adapter!.transaction(async () => undefined),
    ];
    for (const operation of missingTenantOperations) {
      await expectCode(operation, "PERSISTENCE_TENANT_REQUIRED");
    }

    let notifications = 0;
    const unsubscribe = adapter.subscribe(() => {
      notifications += 1;
    });
    assert.deepEqual(await adapter.load(contextA), []);
    assert.equal(notifications, 1);

    const created = await adapter.create(sample, contextA);
    assert.deepEqual(created, sample);
    assert.equal(notifications, 2);
    const physical = await setup.query<{
      id: string;
      ref_id: string;
      provenance: Record<string, unknown>;
    }>(
      "select id, ref_id, provenance from knowledge_nodes where tenant_id = $1 and ref_id = $2",
      [tenantA, sample.id],
    );
    assert.notEqual(physical.rows[0]?.id, sample.id);
    assert.equal(physical.rows[0]?.ref_id, sample.id);
    assert.ok(physical.rows[0]?.provenance.hebunKnowledgeCrudV1);

    await expectCode(
      () => adapter!.create(sample, contextA),
      "PERSISTENCE_LOGICAL_ID_CONFLICT",
    );
    await adapter.create(sample, contextB);
    assert.equal((await adapter.list(contextA)).length, 1);
    assert.equal((await adapter.list(contextB)).length, 1);

    await setup.query(
      `update knowledge_nodes
          set provenance = provenance || '{"canonicalSibling":{"source":"preserved"}}'::jsonb
        where tenant_id = $1 and ref_id = $2`,
      [tenantA, sample.id],
    );
    const updated = await adapter.update(
      sample.id,
      { confidence: 91, updatedBy: "Director" },
      contextA,
    );
    assert.equal(updated?.confidence, 91);
    assert.equal(updated?.updatedBy, "Director");
    const preserved = await setup.query<{
      provenance: { canonicalSibling?: { source?: string } };
    }>(
      "select provenance from knowledge_nodes where tenant_id = $1 and ref_id = $2",
      [tenantA, sample.id],
    );
    assert.equal(preserved.rows[0]?.provenance.canonicalSibling?.source, "preserved");

    await adapter.create(node("alpha", "Alpha"), contextA);
    assert.deepEqual(
      (await adapter.list(contextA)).map((item) => item.id),
      ["alpha", "goals:goal-1"],
    );
    const repository = createRepository(adapter);
    assert.equal(
      (await repository.findById(sample.id, contextA))?.id,
      sample.id,
    );
    assert.equal(await adapter.exists(sample.id, contextA), true);

    assert.equal(
      (await adapter.archive(sample.id, contextA))?.lifecycleStatus,
      "archived",
    );
    assert.equal(
      (await adapter.restore(sample.id, contextA))?.lifecycleStatus,
      "active",
    );
    assert.equal(
      (await adapter.delete(sample.id, contextA))?.lifecycleStatus,
      "deleted",
    );
    assert.equal(
      (await adapter.list(contextB))[0]?.lifecycleStatus,
      "active",
    );

    const immutable = adapter.getSnapshot();
    assert.throws(() => {
      immutable[0]!.tags.push("mutated");
    });

    const beforeInvalidHydration = adapter.getSnapshot();
    const notificationsBeforeInvalidHydration = notifications;
    const invalid = await setup.query<{ id: string }>(
      `insert into knowledge_nodes
        (tenant_id, ref_id, type, label, statement, provenance)
       values ($1, 'invalid-null-envelope', 'Goal', 'Invalid', 'Invalid', null)
       returning id`,
      [tenantA],
    );
    await expectCode(
      () => adapter!.load(contextA),
      "PERSISTENCE_INVALID_RECORD_MAPPING",
    );
    assert.strictEqual(adapter.getSnapshot(), beforeInvalidHydration);
    assert.equal(notifications, notificationsBeforeInvalidHydration);
    await setup.query("delete from knowledge_nodes where id = $1", [
      invalid.rows[0]!.id,
    ]);

    const duplicate = await setup.query<{ id: string }>(
      `insert into knowledge_nodes
        (tenant_id, ref_id, type, label, statement, provenance,
         lifecycle_status, created_at, updated_at)
       select tenant_id, ref_id, type, label, statement, provenance,
              lifecycle_status, created_at, updated_at
         from knowledge_nodes
        where tenant_id = $1 and ref_id = $2
       returning id`,
      [tenantA, sample.id],
    );
    await expectCode(
      () => adapter!.load(contextA),
      "PERSISTENCE_LOGICAL_ID_CONFLICT",
    );
    assert.strictEqual(adapter.getSnapshot(), beforeInvalidHydration);
    assert.equal(notifications, notificationsBeforeInvalidHydration);
    await setup.query("delete from knowledge_nodes where id = $1", [
      duplicate.rows[0]!.id,
    ]);

    await adapter.load(contextA);
    const beforeCommitNotifications = notifications;
    const beforeCommitSnapshot = adapter.getSnapshot();
    await adapter.transaction(async (transactionAdapter) => {
      await transactionAdapter.create(node("tx-one", "TX One"), contextA);
      await transactionAdapter.create(node("tx-two", "TX Two"), contextA);
      assert.strictEqual(adapter!.getSnapshot(), beforeCommitSnapshot);
      assert.equal(notifications, beforeCommitNotifications);
    });
    assert.equal(notifications, beforeCommitNotifications + 1);
    assert.equal(await adapter.exists("tx-one", contextA), true);

    await expectCode(
      () =>
        adapter!.transaction(async (transactionAdapter) => {
          await transactionAdapter.create(node("cross-tenant"), contextA);
          await transactionAdapter.create(node("cross-tenant"), contextB);
        }),
      "PERSISTENCE_TENANT_MISMATCH",
    );
    assert.equal(await adapter.exists("cross-tenant", contextA), false);

    await expectCode(
      () =>
        adapter!.transaction((transactionAdapter) =>
          transactionAdapter.transaction(async () => undefined),
        ),
      "PERSISTENCE_OPERATION_UNSUPPORTED",
    );

    const beforeRollback = adapter.getSnapshot();
    const beforeRollbackNotifications = notifications;
    await expectCode(
      () =>
        adapter!.transaction(async (transactionAdapter) => {
          await transactionAdapter.create(node("rollback"), contextA);
          throw new Error("rollback requested");
        }),
      "PERSISTENCE_TRANSACTION_FAILED",
    );
    assert.strictEqual(adapter.getSnapshot(), beforeRollback);
    assert.equal(notifications, beforeRollbackNotifications);
    assert.equal(await adapter.exists("rollback", contextA), false);

    const saved = node("goals:saved-goal", "Saved Goal");
    await adapter.save([saved], contextA);
    assert.deepEqual(
      (await adapter.list(contextA)).map((item) => item.id),
      [saved.id],
    );
    const savedPhysical = await setup.query<{ id: string }>(
      "select id from knowledge_nodes where tenant_id = $1 and ref_id = $2",
      [tenantA, saved.id],
    );
    await setup.query(
      `insert into knowledge_facts
        (tenant_id, fact_key, domain_key, knowledge_scope, active_knowledge_node_id)
       values ($1, $2, 'goals', 'company-wide', $3)`,
      [tenantA, saved.id, savedPhysical.rows[0]!.id],
    );
    const shadow = await runKnowledgeShadowRead(
      {
        tenantId: tenantA,
        factKey: saved.id,
        domainKey: "goals",
        knowledgeScope: "company-wide",
      },
      { env, memoryNodes: [saved] },
    );
    assert.equal(shadow.postgres.summary?.refId, saved.id);
    assert.equal(fieldMatched(shadow, "nodeIdentity"), true);
    assert.equal(fieldMatched(shadow, "title"), true);
    assert.equal(fieldMatched(shadow, "statementSummary"), true);

    const snapshotBeforeReferencedClear = adapter.getSnapshot();
    const notificationsBeforeReferencedClear = notifications;
    await expectCode(
      () => adapter!.clear(contextA),
      "PERSISTENCE_INVALID_RECORD_MAPPING",
    );
    assert.strictEqual(adapter.getSnapshot(), snapshotBeforeReferencedClear);
    assert.equal(notifications, notificationsBeforeReferencedClear);
    await setup.query(
      "delete from knowledge_facts where tenant_id = $1 and fact_key = $2",
      [tenantA, saved.id],
    );

    const tenantBCount = (await adapter.list(contextB)).length;
    await adapter.clear(contextA);
    assert.deepEqual(adapter.getSnapshot(), []);
    assert.equal((await adapter.list(contextA)).length, 0);
    assert.equal((await adapter.list(contextB)).length, tenantBCount);

    const providers = await listRegisteredPersistenceProviders(env);
    const postgres = providers.find((provider) => provider.key === "postgres");
    assert.equal(postgres?.active, false);
    assert.equal(postgres?.status, "available");
    assert.deepEqual(postgres?.collections, [
      "registries",
      "knowledge-nodes",
      "agents",
      "workflows",
      "memories",
    ]);
    assert.equal(postgres?.health.state, "healthy");
    assert.equal((await adapter.health()).ok, true);
    assert.equal(activeProvider(), "memory");
    assert.strictEqual(getNodeSnapshot(), memoryBefore);

    unsubscribe();
    const notificationsAfterUnsubscribe = notifications;
    await adapter.clear(contextB);
    assert.equal(notifications, notificationsAfterUnsubscribe);
  } finally {
    if (adapter) await adapter.dispose();
    await setup.end().catch(() => undefined);
    await harness.dropDatabase();
    const admin = new Client({ connectionString: harness.adminUrl });
    await admin.connect();
    try {
      const exists = await admin.query<{ exists: boolean }>(
        "select exists(select 1 from pg_database where datname = $1) as exists",
        [harness.dbName],
      );
      assert.equal(exists.rows[0]?.exists, false);
    } finally {
      await admin.end();
    }
  }

  console.log("postgres knowledge nodes conformance checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
