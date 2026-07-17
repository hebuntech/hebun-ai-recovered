import assert from "node:assert/strict";
import { Client } from "pg";
import { createCanonicalReadServices } from "../../src/features/canonical-read";
import { getDirectorDashboardSnapshot } from "../../src/features/director-dashboard/foundation";
import { DirectorAIRuntime } from "../../src/features/director-ai-runtime";
import {
  runExecutionShadowRead,
  type MemoryExecutionLineageSummary,
} from "../../src/features/execution-shadow-read";
import { OrganizationalIntelligenceEngine } from "../../src/features/organizational-intelligence";
import {
  activeProvider,
  createRepository,
} from "../../src/features/persistence";
import type { PostgresPersistenceError } from "../../src/features/persistence/postgres-errors";
import { listRegisteredPersistenceProviders } from "../../src/features/persistence/provider-registry";
import { createPostgresAdapter } from "../../src/features/persistence/supabase-postgres-adapter";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
  type RuntimeProjectionCollection,
} from "../../src/features/runtime-projection";
import { getSnapshot as getWorkflowSnapshot } from "../../src/features/workflow-crud/workflow-adapter";
import type { WorkflowCrudRecord } from "../../src/features/workflow-crud/types";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_phase_3c4_verify");
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

function workflow(id: string, name = id): WorkflowCrudRecord {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    description: `${name} governed workflow`,
    department: "Marketing",
    category: "Content",
    owner: "Marketing Director",
    status: "idle",
    version: "v1.0.0",
    trigger: "manual",
    steps: ["research", "draft", "review"],
    assignedAgents: ["agent-content"],
    dependencies: [],
    approvalPolicy: "human-review",
    executionMode: "sequential",
    retryPolicy: "three-attempts",
    timeout: 900,
    runtime: "simulation",
    createdAt: "2026-07-16T10:00:00.000Z",
    updatedAt: "2026-07-16T10:00:00.000Z",
    createdBy: "Seed",
    updatedBy: "Seed",
    lifecycleStatus: "active",
    ownerAgent: "agent-content",
    successRate: 97.5,
    runsToday: 3,
    lastRun: "2026-07-16T09:55:00.000Z",
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
  const memoryBefore = getWorkflowSnapshot();
  const projectionsBefore = projectionData();
  const dashboardBefore = semanticSnapshot(await getDirectorDashboardSnapshot());
  const directorBefore = semanticSnapshot(DirectorAIRuntime.getRuntimeSurface());
  const intelligenceBefore = semanticSnapshot(
    OrganizationalIntelligenceEngine.getSnapshot(),
  );

  await harness.createDatabase();
  let adapter:
    | ReturnType<typeof createPostgresAdapter<WorkflowCrudRecord>>
    | undefined;
  const setup = new Client({ connectionString: harness.dbUrl });
  try {
    harness.migrateDatabase();
    await setup.connect();
    const object = await setup.query<{ relation: string | null }>(
      "select to_regclass('public.workflows')::text as relation",
    );
    assert.equal(object.rows[0]?.relation, "workflows");

    const tenants = await setup.query<{ id: string }>(
      `insert into companies (name, slug)
       values ('Workflow Tenant A', 'workflow-tenant-a'),
              ('Workflow Tenant B', 'workflow-tenant-b')
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

    const canonicalOnly = await setup.query<{ id: string }>(
      `insert into workflows
        (tenant_id, name, workflow_lifecycle_status, workflow_health,
         workflow_execution_strategy, orchestration_metadata, workflow_version)
       values ($1, 'Canonical Workflow', 'running', 'healthy', 'sequential',
               '{"canonicalOnly":{"source":"execution-lineage"}}'::jsonb, 7)
       returning id`,
      [tenantA],
    );

    adapter = createPostgresAdapter<WorkflowCrudRecord>({
      collection: "workflows",
      seed: () => [],
      env,
    });
    assert.equal(activeProvider(), "memory");
    assert.deepEqual(adapter.manifest.supportedCollections, [
      "registries",
      "knowledge-nodes",
      "agents",
      "workflows",
    ]);

    const sample = workflow("workflow-content", "Content Workflow");
    const missingTenantOperations: Array<() => Promise<unknown>> = [
      () => adapter!.load(),
      () => adapter!.save([]),
      () => adapter!.create(sample),
      () => adapter!.update(sample.id, { name: "Updated" }),
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
      orchestration_metadata: Record<string, unknown>;
    }>(
      `select id, orchestration_metadata
         from workflows
        where tenant_id = $1
          and orchestration_metadata->'hebunWorkflowCrudV1'->>'logicalId' = $2`,
      [tenantA, sample.id],
    );
    const physicalId = physical.rows[0]!.id;
    assert.notEqual(physicalId, sample.id);
    assert.equal(
      (
        physical.rows[0]!.orchestration_metadata.hebunWorkflowCrudV1 as {
          logicalId?: string;
        }
      ).logicalId,
      sample.id,
    );

    await expectCode(
      () => adapter!.create(sample, contextA),
      "PERSISTENCE_LOGICAL_ID_CONFLICT",
    );
    await adapter.create(sample, contextB);
    await adapter.create(workflow("alpha-workflow", "Alpha Workflow"), contextA);
    assert.deepEqual(
      (await adapter.list(contextA)).map((item) => item.id),
      ["alpha-workflow", "workflow-content"],
    );
    const repository = createRepository(adapter);
    assert.equal((await repository.findById(sample.id, contextA))?.id, sample.id);
    assert.equal(await adapter.exists(sample.id, contextA), true);

    await setup.query(
      `update workflows
          set orchestration_metadata = orchestration_metadata ||
              '{"canonicalSibling":{"source":"preserved"}}'::jsonb,
              workflow_lifecycle_status = 'running',
              workflow_health = 'healthy',
              workflow_execution_strategy = 'sequential',
              execution_graph = '{"nodes":["start"]}'::jsonb,
              rollback_strategy = '{"mode":"manual"}'::jsonb,
              compensation_strategy = '{"mode":"review"}'::jsonb,
              workflow_version = 4
        where id = $1`,
      [physicalId],
    );
    const updated = await adapter.update(
      sample.id,
      { status: "running", runsToday: 4, updatedBy: "Director" },
      contextA,
    );
    assert.equal(updated?.status, "running");
    const preserved = await setup.query<{
      orchestration_metadata: { canonicalSibling?: { source?: string } };
      workflow_lifecycle_status: string;
      workflow_health: string;
      workflow_execution_strategy: string;
      execution_graph: { nodes?: string[] };
      rollback_strategy: { mode?: string };
      compensation_strategy: { mode?: string };
      workflow_version: number;
    }>(
      `select orchestration_metadata, workflow_lifecycle_status, workflow_health,
              workflow_execution_strategy, execution_graph, rollback_strategy,
              compensation_strategy, workflow_version
         from workflows where id = $1`,
      [physicalId],
    );
    assert.equal(preserved.rows[0]!.orchestration_metadata.canonicalSibling?.source, "preserved");
    assert.equal(preserved.rows[0]!.workflow_lifecycle_status, "running");
    assert.equal(preserved.rows[0]!.workflow_health, "healthy");
    assert.equal(preserved.rows[0]!.workflow_execution_strategy, "sequential");
    assert.deepEqual(preserved.rows[0]!.execution_graph.nodes, ["start"]);
    assert.equal(preserved.rows[0]!.rollback_strategy.mode, "manual");
    assert.equal(preserved.rows[0]!.compensation_strategy.mode, "review");
    assert.equal(preserved.rows[0]!.workflow_version, 4);

    assert.equal((await adapter.archive(sample.id, contextA))?.lifecycleStatus, "archived");
    assert.equal((await adapter.restore(sample.id, contextA))?.lifecycleStatus, "active");
    assert.equal((await adapter.delete(sample.id, contextA))?.lifecycleStatus, "deleted");
    assert.equal((await adapter.list(contextB))[0]?.lifecycleStatus, "active");

    const immutable = adapter.getSnapshot();
    assert.throws(() => immutable[0]!.steps.push("mutated"));

    const invalid = await setup.query<{ id: string }>(
      `insert into workflows (tenant_id, name, description, orchestration_metadata)
       values ($1, 'Invalid Workflow', 'Invalid',
               '{"hebunWorkflowCrudV1":null}'::jsonb) returning id`,
      [tenantA],
    );
    const beforeInvalid = adapter.getSnapshot();
    const notificationsBeforeInvalid = notifications;
    await expectCode(() => adapter!.load(contextA), "PERSISTENCE_INVALID_RECORD_MAPPING");
    assert.strictEqual(adapter.getSnapshot(), beforeInvalid);
    assert.equal(notifications, notificationsBeforeInvalid);
    await setup.query("delete from workflows where id = $1", [invalid.rows[0]!.id]);

    const duplicate = await setup.query<{ id: string }>(
      `insert into workflows
        (tenant_id, name, description, orchestration_metadata,
         lifecycle_status, created_at, updated_at)
       select tenant_id, name, description, orchestration_metadata,
              lifecycle_status, created_at, updated_at
         from workflows where id = $1 returning id`,
      [physicalId],
    );
    await expectCode(() => adapter!.load(contextA), "PERSISTENCE_LOGICAL_ID_CONFLICT");
    assert.strictEqual(adapter.getSnapshot(), beforeInvalid);
    assert.equal(notifications, notificationsBeforeInvalid);
    await setup.query("delete from workflows where id = $1", [duplicate.rows[0]!.id]);

    await adapter.load(contextA);
    const beforeCommit = adapter.getSnapshot();
    const notificationsBeforeCommit = notifications;
    await adapter.transaction(async (transactionAdapter) => {
      await transactionAdapter.create(workflow("tx-one", "TX One"), contextA);
      await transactionAdapter.create(workflow("tx-two", "TX Two"), contextA);
      assert.strictEqual(adapter!.getSnapshot(), beforeCommit);
      assert.equal(notifications, notificationsBeforeCommit);
    });
    assert.equal(notifications, notificationsBeforeCommit + 1);
    assert.equal(await adapter.exists("tx-one", contextA), true);

    await expectCode(
      () =>
        adapter!.transaction(async (transactionAdapter) => {
          await transactionAdapter.create(workflow("cross-tenant"), contextA);
          await transactionAdapter.create(workflow("cross-tenant"), contextB);
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
    const notificationsBeforeRollback = notifications;
    await expectCode(
      () =>
        adapter!.transaction(async (transactionAdapter) => {
          await transactionAdapter.create(workflow("rollback"), contextA);
          throw new Error("rollback requested");
        }),
      "PERSISTENCE_TRANSACTION_FAILED",
    );
    assert.strictEqual(adapter.getSnapshot(), beforeRollback);
    assert.equal(notifications, notificationsBeforeRollback);
    assert.equal(await adapter.exists("rollback", contextA), false);

    const guard = await setup.query<{ id: string }>(
      `insert into tasks (tenant_id, workflow_id, title, status)
       values ($1, $2, 'Workflow guard', 'pending') returning id`,
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
    await setup.query("delete from tasks where id = $1", [guard.rows[0]!.id]);

    const saved = workflow("saved-workflow", "Saved Workflow");
    await adapter.save([saved], contextA);
    assert.deepEqual((await adapter.list(contextA)).map((item) => item.id), [saved.id]);
    const canonicalCount = await setup.query<{ count: string }>(
      "select count(*)::text as count from workflows where id = $1",
      [canonicalOnly.rows[0]!.id],
    );
    assert.equal(canonicalCount.rows[0]?.count, "1");

    const savedPhysical = await setup.query<{ id: string }>(
      `select id from workflows
        where tenant_id = $1
          and orchestration_metadata->'hebunWorkflowCrudV1'->>'logicalId' = $2`,
      [tenantA, saved.id],
    );
    const execution = await setup.query<{ id: string }>(
      `insert into executions
        (tenant_id, workflow_id, status, execution_lifecycle_status,
         execution_health, execution_version)
       values ($1, $2, 'running', 'executing', 'healthy', 1) returning id`,
      [tenantA, savedPhysical.rows[0]!.id],
    );
    await setup.query(
      `update workflows
          set workflow_lifecycle_status = 'running',
              workflow_health = 'healthy',
              workflow_version = 1
        where id = $1`,
      [savedPhysical.rows[0]!.id],
    );
    const canonicalServices = createCanonicalReadServices({
      connectionString: harness.dbUrl,
      statementTimeoutMs: 2000,
    });
    try {
      const lineage = await canonicalServices.getExecutionLineage({
        tenantId: tenantA,
        executionId: execution.rows[0]!.id,
      });
      assert.equal(lineage.status, "partial");
      assert.equal(lineage.workflow?.id, savedPhysical.rows[0]!.id);
      assert.equal(lineage.workflow?.label, saved.name);

      const memorySummary: MemoryExecutionLineageSummary = {
        source: "execution-session",
        execution: { id: execution.rows[0]!.id, legacyStatus: "running" },
        workflow: {
          id: savedPhysical.rows[0]!.id,
          label: saved.name,
          version: "1",
          lifecycleStatus: "running",
        },
        completeness: "partial",
        warnings: [],
      };
      const shadow = await runExecutionShadowRead(
        { tenantId: tenantA, executionId: execution.rows[0]!.id },
        { canonicalReadServices: canonicalServices, memorySummary },
      );
      assert.notEqual(shadow.status, "unavailable");
      assert.equal(shadow.postgres.summary?.workflow?.id, savedPhysical.rows[0]!.id);
    } finally {
      await canonicalServices.dispose();
    }
    await setup.query("delete from executions where id = $1", [execution.rows[0]!.id]);

    const tenantBCount = (await adapter.list(contextB)).length;
    await adapter.clear(contextA);
    assert.deepEqual(adapter.getSnapshot(), []);
    assert.equal((await adapter.list(contextA)).length, 0);
    assert.equal((await adapter.list(contextB)).length, tenantBCount);
    assert.equal(
      (
        await setup.query<{ count: string }>(
          "select count(*)::text as count from workflows where id = $1",
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
    ]);
    assert.equal(postgres?.health.state, "healthy");
    assert.equal((await adapter.health()).ok, true);
    assert.equal(activeProvider(), "memory");

    runtimeProjectionRegistry.refreshAll();
    assert.strictEqual(getWorkflowSnapshot(), memoryBefore);
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

  console.log("postgres workflows conformance checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
