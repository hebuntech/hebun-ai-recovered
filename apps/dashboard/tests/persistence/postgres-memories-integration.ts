import assert from "node:assert/strict";
import { Client } from "pg";
import { getDirectorDashboardSnapshot } from "../../src/features/director-dashboard/foundation";
import { DirectorAIRuntime } from "../../src/features/director-ai-runtime";
import { getSnapshot as getMemorySnapshot } from "../../src/features/memory-crud/memory-adapter";
import type { MemoryCrudRecord } from "../../src/features/memory-crud/types";
import { OrganizationalIntelligenceEngine } from "../../src/features/organizational-intelligence";
import { activeProvider, createRepository } from "../../src/features/persistence";
import type { PostgresPersistenceError } from "../../src/features/persistence/postgres-errors";
import { listRegisteredPersistenceProviders } from "../../src/features/persistence/provider-registry";
import { createPostgresAdapter } from "../../src/features/persistence/supabase-postgres-adapter";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
  type RuntimeProjectionCollection,
} from "../../src/features/runtime-projection";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_phase_3c5_verify");
const PROJECTION_COLLECTIONS: readonly RuntimeProjectionCollection[] = [
  "organization-runtime",
  "agent-runtime",
  "workflow-runtime",
  "goal-runtime",
  "mission-runtime",
  "knowledge-runtime",
  "memory-runtime",
  "decision-runtime",
  "executive-timeline-runtime",
];
const VOLATILE_KEYS = new Set([
  "generatedAt",
  "createdAt",
  "checkedAt",
  "lastRefreshedAt",
  "latencyMs",
  "lastDurationMs",
]);

function memory(id: string, title = id): MemoryCrudRecord {
  return {
    id,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    description: `${title} governed memory content`,
    memoryType: "Decision",
    ownerType: "organization",
    ownerId: "organization-hebun",
    importance: "high",
    confidence: 94,
    source: "director-review",
    tags: ["governed", "decision"],
    summary: `${title} summary`,
    status: "stable",
    version: "v1.0.0",
    createdAt: "2026-07-18T10:00:00.000Z",
    updatedAt: "2026-07-18T10:00:00.000Z",
    createdBy: "Director",
    updatedBy: "Director",
    lifecycleStatus: "active",
  };
}

async function expectCode(
  run: () => Promise<unknown>,
  code: string,
): Promise<void> {
  await assert.rejects(run, (error: PostgresPersistenceError) => error.code === code);
}

function projectionData(): Record<string, unknown> {
  return Object.fromEntries(
    PROJECTION_COLLECTIONS.map((collection) => {
      const snapshot = runtimeProjectionRegistry.getSnapshot(collection);
      assert.ok(snapshot, `Missing ${collection} snapshot.`);
      return [collection, snapshot.data];
    }),
  );
}

function semanticSnapshot<T>(value: T): unknown {
  return JSON.parse(
    JSON.stringify(value, (key, current) =>
      VOLATILE_KEYS.has(key) ? undefined : current,
    ),
  );
}

async function main(): Promise<void> {
  ensureRuntimeProjectionRegistry();
  const memoryBefore = getMemorySnapshot();
  const projectionsBefore = projectionData();
  const dashboardBefore = semanticSnapshot(await getDirectorDashboardSnapshot());
  const directorBefore = semanticSnapshot(DirectorAIRuntime.getRuntimeSurface());
  const intelligenceBefore = semanticSnapshot(
    OrganizationalIntelligenceEngine.getSnapshot(),
  );

  await harness.createDatabase();
  let adapter:
    | ReturnType<typeof createPostgresAdapter<MemoryCrudRecord>>
    | undefined;
  const setup = new Client({ connectionString: harness.dbUrl });
  try {
    harness.migrateDatabase();
    await setup.connect();
    const object = await setup.query<{ relation: string | null }>(
      "select to_regclass('public.memories')::text as relation",
    );
    assert.equal(object.rows[0]?.relation, "memories");

    const tenants = await setup.query<{ id: string }>(
      `insert into companies (name, slug)
       values ('Memory Tenant A', 'memory-tenant-a'),
              ('Memory Tenant B', 'memory-tenant-b')
       returning id`,
    );
    const tenantA = tenants.rows[0]!.id;
    const tenantB = tenants.rows[1]!.id;
    const contextA = { tenantId: tenantA };
    const contextB = { tenantId: tenantB };
    const env: NodeJS.ProcessEnv = {
      HEBUN_PERSISTENCE_POSTGRES_DATABASE_URL: harness.dbUrl,
      NODE_ENV: "test",
    };

    const canonicalOnly = await setup.query<{ id: string }>(
      `insert into memories
        (tenant_id, content, kind, importance, storage_metadata,
         memory_lifecycle_status, memory_health, memory_version)
       values ($1, 'Canonical memory', 'semantic', 77,
               '{"canonicalOnly":{"source":"long-term-memory"}}'::jsonb,
               'active', 'trusted', 7)
       returning id`,
      [tenantA],
    );

    adapter = createPostgresAdapter<MemoryCrudRecord>({
      collection: "memories",
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

    const sample = memory("memory-launch", "Launch Decision");
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
    assert.deepEqual(await adapter.create(sample, contextA), sample);
    assert.equal(notifications, 2);

    const physical = await setup.query<{
      id: string;
      agent_id: string | null;
      kind: string;
      importance: number;
      storage_metadata: Record<string, unknown>;
    }>(
      `select id, agent_id, kind, importance, storage_metadata
         from memories
        where tenant_id = $1
          and storage_metadata->'hebunMemoryCrudV1'->>'logicalId' = $2`,
      [tenantA, sample.id],
    );
    const physicalId = physical.rows[0]!.id;
    assert.notEqual(physicalId, sample.id);
    assert.equal(physical.rows[0]!.agent_id, null);
    assert.equal(physical.rows[0]!.kind, "episodic");
    assert.equal(physical.rows[0]!.importance, 0);
    assert.equal(
      (
        physical.rows[0]!.storage_metadata.hebunMemoryCrudV1 as {
          logicalId?: string;
        }
      ).logicalId,
      sample.id,
    );

    await expectCode(
      () => adapter!.create(sample, contextA),
      "PERSISTENCE_LOGICAL_ID_CONFLICT",
    );
    await expectCode(
      () => adapter!.save([sample, sample], contextA),
      "PERSISTENCE_LOGICAL_ID_CONFLICT",
    );
    await adapter.create(sample, contextB);
    await adapter.create(memory("alpha-memory", "Alpha Memory"), contextA);
    assert.deepEqual(
      (await adapter.list(contextA)).map((item) => item.id),
      ["alpha-memory", "memory-launch"],
    );
    const repository = createRepository(adapter);
    assert.equal((await repository.findById(sample.id, contextA))?.id, sample.id);
    assert.equal(await adapter.exists(sample.id, contextA), true);

    const department = await setup.query<{ id: string }>(
      `insert into departments (tenant_id, name, slug)
       values ($1, 'Memory', 'memory') returning id`,
      [tenantA],
    );
    const agent = await setup.query<{ id: string }>(
      `insert into agents (tenant_id, department_id, name)
       values ($1, $2, 'Memory Steward') returning id`,
      [tenantA, department.rows[0]!.id],
    );
    await setup.query(
      `update memories
          set agent_id = $2,
              kind = 'procedural',
              importance = 88,
              source_command_id = '55555555-5555-4555-8555-555555555555',
              scope = 'organizational',
              namespace = 'director',
              collection = 'decisions',
              provenance = '{"source":"review"}'::jsonb,
              lineage = '{"parent":"decision"}'::jsonb,
              trust = '{"score":95}'::jsonb,
              quality = '{"score":90}'::jsonb,
              promotion_metadata = '{"state":"promoted"}'::jsonb,
              retention_metadata = '{"policy":"retain"}'::jsonb,
              aging_metadata = '{"age":1}'::jsonb,
              correction_metadata = '{"corrected":false}'::jsonb,
              supersession_metadata = '{"state":"current"}'::jsonb,
              storage_metadata = storage_metadata ||
                '{"canonicalSibling":{"source":"preserved"}}'::jsonb,
              memory_lifecycle_status = 'active',
              memory_health = 'trusted',
              memory_version = 9
        where id = $1`,
      [physicalId, agent.rows[0]!.id],
    );
    const updated = await adapter.update(
      sample.id,
      { status: "review", updatedBy: "Governance" },
      contextA,
    );
    assert.equal(updated?.status, "review");
    const preserved = await setup.query<{
      agent_id: string;
      kind: string;
      importance: number;
      source_command_id: string;
      scope: string;
      namespace: string;
      collection: string;
      provenance: { source?: string };
      lineage: { parent?: string };
      trust: { score?: number };
      quality: { score?: number };
      promotion_metadata: { state?: string };
      retention_metadata: { policy?: string };
      aging_metadata: { age?: number };
      correction_metadata: { corrected?: boolean };
      supersession_metadata: { state?: string };
      storage_metadata: { canonicalSibling?: { source?: string } };
      memory_lifecycle_status: string;
      memory_health: string;
      memory_version: number;
    }>("select * from memories where id = $1", [physicalId]);
    const canonical = preserved.rows[0]!;
    assert.equal(canonical.agent_id, agent.rows[0]!.id);
    assert.equal(canonical.kind, "procedural");
    assert.equal(canonical.importance, 88);
    assert.equal(canonical.source_command_id, "55555555-5555-4555-8555-555555555555");
    assert.equal(canonical.scope, "organizational");
    assert.equal(canonical.namespace, "director");
    assert.equal(canonical.collection, "decisions");
    assert.equal(canonical.provenance.source, "review");
    assert.equal(canonical.lineage.parent, "decision");
    assert.equal(canonical.trust.score, 95);
    assert.equal(canonical.quality.score, 90);
    assert.equal(canonical.promotion_metadata.state, "promoted");
    assert.equal(canonical.retention_metadata.policy, "retain");
    assert.equal(canonical.aging_metadata.age, 1);
    assert.equal(canonical.correction_metadata.corrected, false);
    assert.equal(canonical.supersession_metadata.state, "current");
    assert.equal(canonical.storage_metadata.canonicalSibling?.source, "preserved");
    assert.equal(canonical.memory_lifecycle_status, "active");
    assert.equal(canonical.memory_health, "trusted");
    assert.equal(canonical.memory_version, 9);

    assert.equal((await adapter.archive(sample.id, contextA))?.lifecycleStatus, "archived");
    assert.equal((await adapter.restore(sample.id, contextA))?.lifecycleStatus, "active");
    assert.equal((await adapter.delete(sample.id, contextA))?.lifecycleStatus, "deleted");
    const lifecycleIsolation = await setup.query<{
      memory_lifecycle_status: string;
      memory_health: string;
      memory_version: number;
    }>(
      `select memory_lifecycle_status, memory_health, memory_version
         from memories where id = $1`,
      [physicalId],
    );
    assert.deepEqual(lifecycleIsolation.rows[0], {
      memory_lifecycle_status: "active",
      memory_health: "trusted",
      memory_version: 9,
    });
    assert.equal((await adapter.list(contextB))[0]?.lifecycleStatus, "active");

    const immutable = adapter.getSnapshot();
    assert.throws(() => immutable[0]!.tags.push("mutated"));
    const invalid = await setup.query<{ id: string }>(
      `insert into memories (tenant_id, content, storage_metadata)
       values ($1, 'Invalid', '{"hebunMemoryCrudV1":null}'::jsonb) returning id`,
      [tenantA],
    );
    const beforeInvalid = adapter.getSnapshot();
    const notificationsBeforeInvalid = notifications;
    await expectCode(() => adapter!.load(contextA), "PERSISTENCE_INVALID_RECORD_MAPPING");
    assert.strictEqual(adapter.getSnapshot(), beforeInvalid);
    assert.equal(notifications, notificationsBeforeInvalid);
    await setup.query("delete from memories where id = $1", [invalid.rows[0]!.id]);

    const duplicate = await setup.query<{ id: string }>(
      `insert into memories
        (tenant_id, content, storage_metadata, lifecycle_status, created_at, updated_at)
       select tenant_id, content, storage_metadata, lifecycle_status, created_at, updated_at
         from memories where id = $1 returning id`,
      [physicalId],
    );
    await expectCode(() => adapter!.load(contextA), "PERSISTENCE_LOGICAL_ID_CONFLICT");
    assert.strictEqual(adapter.getSnapshot(), beforeInvalid);
    assert.equal(notifications, notificationsBeforeInvalid);
    await setup.query("delete from memories where id = $1", [duplicate.rows[0]!.id]);

    await adapter.load(contextA);
    const beforeCommit = adapter.getSnapshot();
    const notificationsBeforeCommit = notifications;
    await adapter.transaction(async (transactionAdapter) => {
      await transactionAdapter.create(memory("tx-one"), contextA);
      await transactionAdapter.create(memory("tx-two"), contextA);
      assert.strictEqual(adapter!.getSnapshot(), beforeCommit);
      assert.equal(notifications, notificationsBeforeCommit);
    });
    assert.equal(notifications, notificationsBeforeCommit + 1);
    assert.equal(await adapter.exists("tx-one", contextA), true);

    await expectCode(
      () => adapter!.transaction(async (tx) => {
        await tx.create(memory("cross-tenant"), contextA);
        await tx.create(memory("cross-tenant"), contextB);
      }),
      "PERSISTENCE_TENANT_MISMATCH",
    );
    await expectCode(
      () => adapter!.transaction((tx) => tx.transaction(async () => undefined)),
      "PERSISTENCE_OPERATION_UNSUPPORTED",
    );
    const beforeRollback = adapter.getSnapshot();
    const notificationsBeforeRollback = notifications;
    await expectCode(
      () => adapter!.transaction(async (tx) => {
        await tx.create(memory("rollback"), contextA);
        throw new Error("rollback requested");
      }),
      "PERSISTENCE_TRANSACTION_FAILED",
    );
    assert.strictEqual(adapter.getSnapshot(), beforeRollback);
    assert.equal(notifications, notificationsBeforeRollback);
    assert.equal(await adapter.exists("rollback", contextA), false);

    const guard = await setup.query<{ id: string }>(
      `insert into memories
        (tenant_id, content, supersedes_memory_id, storage_metadata)
       values ($1, 'Canonical child', $2, '{"canonicalOnly":{"guard":true}}'::jsonb)
       returning id`,
      [tenantA, physicalId],
    );
    const beforeGuard = adapter.getSnapshot();
    const notificationsBeforeGuard = notifications;
    await expectCode(() => adapter!.save([], contextA), "PERSISTENCE_INVALID_RECORD_MAPPING");
    assert.strictEqual(adapter.getSnapshot(), beforeGuard);
    assert.equal(notifications, notificationsBeforeGuard);
    await expectCode(() => adapter!.clear(contextA), "PERSISTENCE_INVALID_RECORD_MAPPING");
    assert.strictEqual(adapter.getSnapshot(), beforeGuard);
    assert.equal(notifications, notificationsBeforeGuard);
    await setup.query("delete from memories where id = $1", [guard.rows[0]!.id]);

    const parent = memory("superseded-parent");
    const child = memory("superseding-child");
    await adapter.save([parent, child], contextA);
    const relation = await setup.query<{ parent_id: string; child_id: string }>(
      `select p.id as parent_id, c.id as child_id
         from memories p cross join memories c
        where p.tenant_id = $1 and c.tenant_id = $1
          and p.storage_metadata->'hebunMemoryCrudV1'->>'logicalId' = $2
          and c.storage_metadata->'hebunMemoryCrudV1'->>'logicalId' = $3`,
      [tenantA, parent.id, child.id],
    );
    await setup.query(
      "update memories set supersedes_memory_id = $1 where id = $2",
      [relation.rows[0]!.parent_id, relation.rows[0]!.child_id],
    );
    const beforeSelfReference = adapter.getSnapshot();
    const notificationsBeforeSelfReference = notifications;
    await expectCode(
      () => adapter!.save([child], contextA),
      "PERSISTENCE_INVALID_RECORD_MAPPING",
    );
    assert.strictEqual(adapter.getSnapshot(), beforeSelfReference);
    assert.equal(notifications, notificationsBeforeSelfReference);
    await setup.query("update memories set supersedes_memory_id = null where id = $1", [
      relation.rows[0]!.child_id,
    ]);

    const saved = memory("saved-memory", "Saved Memory");
    await adapter.save([saved], contextA);
    assert.deepEqual((await adapter.list(contextA)).map((item) => item.id), [saved.id]);
    assert.equal(
      (
        await setup.query<{ count: string }>(
          "select count(*)::text as count from memories where id = $1",
          [canonicalOnly.rows[0]!.id],
        )
      ).rows[0]?.count,
      "1",
    );

    const tenantBCount = (await adapter.list(contextB)).length;
    await adapter.clear(contextA);
    assert.deepEqual(adapter.getSnapshot(), []);
    assert.equal((await adapter.list(contextB)).length, tenantBCount);
    assert.equal(
      (
        await setup.query<{ count: string }>(
          "select count(*)::text as count from memories where id = $1",
          [canonicalOnly.rows[0]!.id],
        )
      ).rows[0]?.count,
      "1",
    );

    const providers = await listRegisteredPersistenceProviders(env);
    const postgres = providers.find((provider) => provider.key === "postgres");
    assert.equal(postgres?.active, false);
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

    runtimeProjectionRegistry.refreshAll();
    assert.strictEqual(getMemorySnapshot(), memoryBefore);
    assert.deepEqual(projectionData(), projectionsBefore);
    assert.deepEqual(
      semanticSnapshot(await getDirectorDashboardSnapshot()),
      dashboardBefore,
    );
    assert.deepEqual(
      semanticSnapshot(DirectorAIRuntime.getRuntimeSurface()),
      directorBefore,
    );
    assert.deepEqual(
      semanticSnapshot(OrganizationalIntelligenceEngine.getSnapshot()),
      intelligenceBefore,
    );

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

  console.log("postgres memories conformance checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
