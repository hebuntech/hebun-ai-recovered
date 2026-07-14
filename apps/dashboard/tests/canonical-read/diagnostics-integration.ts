import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Client } from "pg";
import { CanonicalReadDiagnosticsPage } from "../../src/components/canonical-read/diagnostics-page";
import { buildCanonicalReadDiagnosticsModel } from "../../src/features/canonical-read/diagnostics";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_canonical_read_diag");

async function seedDatabase(): Promise<{
  tenantId: string;
  actorId: string;
  executionId: string;
}> {
  const client = new Client({ connectionString: harness.dbUrl });
  await client.connect();

  const tenantId = randomUUID();
  const actorId = randomUUID();
  const membershipId = randomUUID();
  const missionId = randomUUID();
  const goalId = randomUUID();
  const planId = randomUUID();
  const workflowId = randomUUID();
  const taskId = randomUUID();
  const commandId = randomUUID();
  const executionId = randomUUID();
  const factId = randomUUID();
  const nodeId = randomUUID();
  try {
    await client.query("begin");
    await client.query(
      `insert into public.companies (id, name, slug) values ($1, 'Tenant A', 'tenant-a')`,
      [tenantId],
    );
    await client.query(
      `insert into public.users (id, email, name, display_name)
       values ($1, 'actor@example.com', 'Actor', 'Actor One')`,
      [actorId],
    );
    await client.query(
      `insert into public.memberships (id, tenant_id, user_id)
       values ($1, $2, $3)`,
      [membershipId, tenantId, actorId],
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
         id, tenant_id, trace_id, command_type, actor, status, lifecycle,
         mission_id, mission_version, goal_id, goal_version, plan_id, plan_version,
         task_id, task_version, workflow_id, workflow_version, command_lifecycle_status,
         correlation_id, causation_id, idempotency_key, simulation_mode, command_version
       ) values (
         $1, $2, 'trace-a', 'demo.command', 'tester', 'running', '{}'::jsonb,
         $3, 1, $4, 1, $5, 1, $6, 1, $7, 1, 'executing', 'corr-1', 'cause-1', 'idem-1', 'simulation', 1
       )`,
      [commandId, tenantId, missionId, goalId, planId, taskId, workflowId],
    );
    await client.query(
      `insert into public.executions (
         id, tenant_id, workflow_id, status, command_id, task_id, plan_id, goal_id,
         mission_id, execution_lifecycle_status, execution_health, simulation_mode,
         execution_version
       ) values (
         $1, $2, $3, 'running', $4, $5, $6, $7, $8, 'executing', 'healthy', 'simulation', 1
       )`,
      [executionId, tenantId, workflowId, commandId, taskId, planId, goalId, missionId],
    );
    await client.query(
      `insert into public.knowledge_nodes (
         id, tenant_id, type, label, statement, knowledge_lifecycle_status,
         knowledge_health, knowledge_scope, knowledge_authority, domain_key, knowledge_version
       ) values (
         $1, $2, 'fact', 'Ops Truth', 'Canonical statement', 'ratified',
         'current', 'domain', 'authoritative', 'ops', 1
       )`,
      [nodeId, tenantId],
    );
    await client.query(
      `insert into public.knowledge_facts (
         id, tenant_id, fact_key, domain_key, knowledge_scope, active_knowledge_node_id, fact_version
       ) values ($1, $2, 'fact.ops.current', 'ops', 'domain', $3, 1)`,
      [factId, tenantId, nodeId],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }

  return { tenantId, actorId, executionId };
}

async function main() {
  await harness.createDatabase();
  try {
    harness.migrateDatabase();
    const seeded = await seedDatabase();
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: "development",
      HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS: "true",
      HEBUN_CANONICAL_READ_DATABASE_URL: harness.dbUrl,
    };

    const actorModel = await buildCanonicalReadDiagnosticsModel(
      {
        inspect: "actor",
        actorTenantId: seeded.tenantId,
        actorType: "human",
        actorId: seeded.actorId,
      },
      { env },
    );
    const actorHtml = renderToStaticMarkup(
      createElement(CanonicalReadDiagnosticsPage, { model: actorModel }),
    );
    assert.match(actorHtml, /Actor One/);

    const knowledgeModel = await buildCanonicalReadDiagnosticsModel(
      {
        inspect: "knowledge",
        knowledgeTenantId: seeded.tenantId,
        factKey: "fact.ops.current",
        domainKey: "ops",
        knowledgeScope: "domain",
      },
      { env },
    );
    const knowledgeHtml = renderToStaticMarkup(
      createElement(CanonicalReadDiagnosticsPage, { model: knowledgeModel }),
    );
    assert.match(knowledgeHtml, /Ops Truth/);

    const executionModel = await buildCanonicalReadDiagnosticsModel(
      {
        inspect: "execution",
        executionTenantId: seeded.tenantId,
        executionId: seeded.executionId,
      },
      { env },
    );
    const executionHtml = renderToStaticMarkup(
      createElement(CanonicalReadDiagnosticsPage, { model: executionModel }),
    );
    assert.match(executionHtml, /corr-1/);
    assert.match(executionHtml, /Workflow/);

    console.log("canonical-read diagnostics integration checks passed");
  } finally {
    await harness.dropDatabase();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
