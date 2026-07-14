import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { runExecutionShadowRead } from "../../src/features/execution-shadow-read";
import type { MemoryExecutionLineageSummary } from "../../src/features/execution-shadow-read";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_execution_shadow");

async function seedDatabase(): Promise<{
  tenantId: string;
  executionId: string;
}> {
  const client = new Client({ connectionString: harness.dbUrl });
  await client.connect();
  const tenantId = randomUUID();
  const missionId = randomUUID();
  const goalId = randomUUID();
  const planId = randomUUID();
  const workflowId = randomUUID();
  const taskId = randomUUID();
  const commandId = randomUUID();
  const executionId = randomUUID();
  try {
    await client.query("begin");
    await client.query(
      `insert into public.companies (id, name, slug) values ($1, 'Tenant A', 'tenant-a')`,
      [tenantId],
    );
    await client.query(
      `insert into public.missions (
         id, tenant_id, statement, scope, mission_lifecycle_status, mission_version
       ) values ($1, $2, 'Mission', 'company', 'ratified', 1)`,
      [missionId, tenantId],
    );
    await client.query(
      `insert into public.goals (
         id, tenant_id, mission_id, mission_version, title, goal_scope, goal_priority,
         goal_lifecycle_status, goal_health, goal_version
       ) values ($1, $2, $3, 1, 'Goal', 'strategic', 'high', 'active', 'on-track', 1)`,
      [goalId, tenantId, missionId],
    );
    await client.query(
      `insert into public.plans (
         id, tenant_id, mission_id, mission_version, goal_id, goal_version, title,
         plan_scope, plan_priority, plan_lifecycle_status, plan_health, plan_version
       ) values ($1, $2, $3, 1, $4, 1, 'Plan', 'strategic', 'high', 'active', 'on-track', 1)`,
      [planId, tenantId, missionId, goalId],
    );
    await client.query(
      `insert into public.workflows (
         id, tenant_id, name, mission_id, mission_version, goal_id, goal_version,
         plan_id, plan_version, workflow_lifecycle_status, workflow_health, workflow_version
       ) values ($1, $2, 'Workflow', $3, 1, $4, 1, $5, 1, 'running', 'healthy', 1)`,
      [workflowId, tenantId, missionId, goalId, planId],
    );
    await client.query(
      `insert into public.tasks (
         id, tenant_id, workflow_id, title, status, plan_id, plan_version,
         goal_id, goal_version, mission_id, mission_version, task_lifecycle_status,
         task_health, task_version
       ) values ($1, $2, $3, 'Task', 'running', $4, 1, $5, 1, $6, 1, 'running', 'healthy', 1)`,
      [taskId, tenantId, workflowId, planId, goalId, missionId],
    );
    await client.query(
      `insert into public.commands (
         id, tenant_id, trace_id, command_type, actor, status, lifecycle, mission_id,
         mission_version, goal_id, goal_version, plan_id, plan_version, task_id,
         task_version, workflow_id, workflow_version, command_lifecycle_status,
         correlation_id, causation_id, idempotency_key, simulation_mode, command_version
       ) values (
         $1, $2, 'trace-a', 'demo.command', 'tester', 'running', '{}'::jsonb, $3,
         1, $4, 1, $5, 1, $6, 1, $7, 1, 'executing', 'corr-1', 'cause-1', 'idem-1', 'simulation', 1
       )`,
      [commandId, tenantId, missionId, goalId, planId, taskId, workflowId],
    );
    await client.query(
      `insert into public.executions (
         id, tenant_id, workflow_id, status, command_id, task_id, plan_id, goal_id,
         mission_id, execution_lifecycle_status, execution_health, simulation_mode, started_at,
         completed_at, execution_version
       ) values (
         $1, $2, $3, 'running', $4, $5, $6, $7, $8, 'executing', 'healthy', 'simulation',
         '2026-07-12T10:00:00.000Z'::timestamptz, null, 1
       )`,
      [executionId, tenantId, workflowId, commandId, taskId, planId, goalId, missionId],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
  return { tenantId, executionId };
}

async function main() {
  const memorySummary: MemoryExecutionLineageSummary = {
    source: "execution-session",
    execution: {
      id: "exec-memory",
      legacyStatus: "running",
      startedAt: "2026-07-12T10:00:00.000Z",
    },
    command: undefined,
    workflow: { id: "wf-1" },
    task: { id: "task-1", legacyStatus: "planned" },
    plan: { id: "plan-1" },
    goal: { id: "goal-1" },
    mission: undefined,
    completeness: "partial",
    warnings: [],
  };

  await harness.createDatabase();
  try {
    harness.migrateDatabase();
    const seeded = await seedDatabase();
    const result = await runExecutionShadowRead(
      {
        tenantId: seeded.tenantId,
        executionId: seeded.executionId,
      },
      {
        env: {
          ...process.env,
          HEBUN_CANONICAL_READ_DATABASE_URL: harness.dbUrl,
        },
        memorySummary,
      },
    );

    assert.equal(result.postgres.found, true);
    assert.equal(result.memory.found, true);
    if (!["mismatch", "partial-match"].includes(result.status)) {
      throw new Error(`unexpected status: ${result.status}`);
    }

    console.log("execution-shadow-read integration checks passed");
  } finally {
    await harness.dropDatabase();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
