import assert from "node:assert/strict";
import { Client } from "pg";
import type { RegistryCrudRecord } from "../../src/features/registry-crud/types";
import {
  activeProvider,
  createRepository,
} from "../../src/features/persistence";
import type { PostgresPersistenceError } from "../../src/features/persistence/postgres-errors";
import { listRegisteredPersistenceProviders } from "../../src/features/persistence/provider-registry";
import { createPostgresAdapter } from "../../src/features/persistence/supabase-postgres-adapter";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_phase_3c1_verify");

function registry(id: string, title = id): RegistryCrudRecord {
  return {
    id,
    title,
    description: `${title} registry`,
    owner: "Director",
    health: 100,
    totalRecords: 0,
    lifecycleStatus: "active",
    createdAt: "2026-07-15T10:00:00.000Z",
    updatedAt: "2026-07-15T10:00:00.000Z",
  };
}

async function expectCode(
  run: () => Promise<unknown>,
  code: string,
): Promise<void> {
  await assert.rejects(run, (error: PostgresPersistenceError) => error.code === code);
}

async function main(): Promise<void> {
  await harness.createDatabase();
  let adapter: ReturnType<typeof createPostgresAdapter<RegistryCrudRecord>> | undefined;
  const setup = new Client({ connectionString: harness.dbUrl });
  try {
    harness.migrateDatabase();
    await setup.connect();
    const object = await setup.query<{ relation: string | null }>(
      "select to_regclass('public.registries')::text as relation",
    );
    assert.equal(object.rows[0]?.relation, "registries");

    const tenants = await setup.query<{ id: string }>(
      `insert into companies (name, slug)
       values ('Tenant A', 'tenant-a'), ('Tenant B', 'tenant-b')
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

    adapter = createPostgresAdapter<RegistryCrudRecord>({
      collection: "registries",
      seed: () => [],
      env,
    });
    assert.equal(activeProvider(), "memory");
    assert.deepEqual(adapter.manifest.supportedCollections, [
      "registries",
      "knowledge-nodes",
    ]);
    assert.equal(adapter.manifest.transactional, true);
    assert.equal(adapter.manifest.tenantIsolation, false);

    const sample = registry("finance", "Finance");
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
    assert.equal(created.id, sample.id);
    assert.equal(adapter.getSnapshot()[0]?.id, sample.id);
    assert.equal(notifications, 2);
    const physical = await setup.query<{ id: string; slug: string }>(
      "select id, slug from registries where tenant_id = $1 and slug = $2",
      [tenantA, sample.id],
    );
    assert.notEqual(physical.rows[0]?.id, sample.id);
    assert.equal(physical.rows[0]?.slug, sample.id);

    await expectCode(
      () => adapter!.create(sample, contextA),
      "PERSISTENCE_LOGICAL_ID_CONFLICT",
    );
    await adapter.create(sample, contextB);
    assert.equal((await adapter.list(contextA)).length, 1);
    assert.equal((await adapter.list(contextB)).length, 1);
    assert.equal(await adapter.exists(sample.id, contextA), true);

    await adapter.create(registry("alpha", "Alpha"), contextA);
    const repository = createRepository(adapter);
    assert.deepEqual(
      (await adapter.list(contextA)).map((item) => item.id),
      ["alpha", "finance"],
    );
    assert.deepEqual(
      (await adapter.find((item) => item.id === "finance", contextA)).map(
        (item) => item.id,
      ),
      ["finance"],
    );
    assert.equal((await repository.findById("finance", contextA))?.id, "finance");
    assert.equal((await adapter.update("finance", { health: 91 }, contextA))?.health, 91);
    assert.equal((await adapter.archive("finance", contextA))?.lifecycleStatus, "archived");
    assert.equal((await adapter.restore("finance", contextA))?.lifecycleStatus, "active");
    assert.equal((await adapter.delete("finance", contextA))?.lifecycleStatus, "deleted");
    const tenantBRecord = (await adapter.list(contextB)).find(
      (item) => item.id === "finance",
    );
    assert.equal(tenantBRecord?.health, 100);
    assert.equal(tenantBRecord?.lifecycleStatus, "active");

    const immutable = adapter.getSnapshot();
    assert.throws(() => {
      immutable[0]!.title = "mutated";
    });
    assert.notEqual(adapter.getSnapshot()[0]?.title, "mutated");

    const beforeInvalidHydration = adapter.getSnapshot();
    const notificationsBeforeInvalidHydration = notifications;
    await setup.query(
      `insert into registries (tenant_id, slug, title, description, owner)
       values ($1, 'invalid-null', 'Invalid', null, 'Director')`,
      [tenantA],
    );
    await expectCode(
      () => adapter!.load(contextA),
      "PERSISTENCE_INVALID_RECORD_MAPPING",
    );
    assert.strictEqual(adapter.getSnapshot(), beforeInvalidHydration);
    assert.equal(notifications, notificationsBeforeInvalidHydration);
    await setup.query(
      "delete from registries where tenant_id = $1 and slug = 'invalid-null'",
      [tenantA],
    );

    const beforeCommitNotifications = notifications;
    const beforeCommitSnapshot = adapter.getSnapshot();
    await adapter.transaction(async (transactionAdapter) => {
      await transactionAdapter.create(registry("tx-one", "TX One"), contextA);
      await transactionAdapter.create(registry("tx-two", "TX Two"), contextA);
      assert.strictEqual(adapter!.getSnapshot(), beforeCommitSnapshot);
      assert.equal(notifications, beforeCommitNotifications);
    });
    assert.equal(notifications, beforeCommitNotifications + 1);
    assert.equal(await adapter.exists("tx-one", contextA), true);

    const beforeRollback = adapter.getSnapshot();
    const beforeRollbackNotifications = notifications;
    await expectCode(
      () =>
        adapter!.transaction(async (transactionAdapter) => {
          await transactionAdapter.create(registry("rollback", "Rollback"), contextA);
          throw new Error("rollback requested");
        }),
      "PERSISTENCE_TRANSACTION_FAILED",
    );
    assert.strictEqual(adapter.getSnapshot(), beforeRollback);
    assert.equal(notifications, beforeRollbackNotifications);
    assert.equal(await adapter.exists("rollback", contextA), false);

    await adapter.save([registry("saved", "Saved")], contextA);
    assert.deepEqual(
      (await adapter.list(contextA)).map((item) => item.id),
      ["saved"],
    );

    const tenantBCount = (await adapter.list(contextB)).length;
    await adapter.clear(contextA);
    assert.deepEqual(adapter.getSnapshot(), []);
    assert.equal((await adapter.list(contextA)).length, 0);
    assert.equal((await adapter.list(contextB)).length, tenantBCount);

    const unsupported = createPostgresAdapter<RegistryCrudRecord>({
      collection: "agents",
      seed: () => [],
      env,
    });
    await expectCode(
      () => unsupported.list(contextA),
      "PERSISTENCE_COLLECTION_UNSUPPORTED",
    );
    await unsupported.dispose();

    const providers = await listRegisteredPersistenceProviders(env);
    const postgres = providers.find((provider) => provider.key === "postgres");
    assert.equal(postgres?.active, false);
    assert.equal(postgres?.status, "available");
    assert.deepEqual(postgres?.collections, ["registries", "knowledge-nodes"]);
    assert.deepEqual(postgres?.manifest, adapter.manifest);
    assert.equal(postgres?.health.state, "healthy");
    assert.equal((await adapter.health()).ok, true);
    assert.equal(activeProvider(), "memory");

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

  console.log("postgres registries conformance checks passed (32/32)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
