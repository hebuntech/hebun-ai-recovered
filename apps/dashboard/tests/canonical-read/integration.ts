import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { createCanonicalReadServices } from "../../src/features/canonical-read";
import { createDisposablePostgresHarness } from "../helpers/disposable-postgres";

const harness = createDisposablePostgresHarness("hebun_canonical_read");

async function seedDatabase(): Promise<{
  tenantId: string;
  otherTenantId: string;
  activeHumanId: string;
  suspendedHumanId: string;
  externalHumanId: string;
  activeAgentId: string;
  suspendedAgentId: string;
  activeFactKey: string;
  partialFactKey: string;
  completeExecutionId: string;
  partialExecutionId: string;
}> {
  const client = new Client({ connectionString: harness.dbUrl });
  await client.connect();
  const tenantId = randomUUID();
  const otherTenantId = randomUUID();
  const activeHumanId = randomUUID();
  const suspendedHumanId = randomUUID();
  const externalHumanId = randomUUID();
  const activeAgentId = randomUUID();
  const suspendedAgentId = randomUUID();
  const roleId = randomUUID();
  const missionId = randomUUID();
  const goalId = randomUUID();
  const planId = randomUUID();
  const workflowId = randomUUID();
  const taskId = randomUUID();
  const commandId = randomUUID();
  const executionId = randomUUID();
  const partialExecutionId = randomUUID();
  const activeNodeId = randomUUID();
  const historicalNodeId = randomUUID();
  const activeFactKey = "fact.ops.current";
  const partialFactKey = "fact.ops.partial";
  const governanceSessionId = randomUUID();
  const decisionRecordId = randomUUID();
  try {
    await client.query("begin");
    await client.query(
      `insert into public.companies (id, name, slug) values
       ($1, 'Tenant A', 'tenant-a'),
       ($2, 'Tenant B', 'tenant-b')`,
      [tenantId, otherTenantId],
    );
    await client.query(
      `insert into public.roles (id, tenant_id, name, type)
       values ($1, $2, 'Owner', 'owner')`,
      [roleId, tenantId],
    );
    await client.query(
      `insert into public.users (id, email, name, display_name, suspended_at)
       values
       ($1, 'active@example.com', 'Active Human', 'Active Human', null),
       ($2, 'suspended@example.com', 'Suspended Human', 'Suspended Human', now()),
       ($3, 'external@example.com', 'External Human', 'External Human', null)`,
      [activeHumanId, suspendedHumanId, externalHumanId],
    );
    await client.query(
      `insert into public.memberships (id, tenant_id, user_id, role_id, suspended_at)
       values
       ($1, $2, $3, $4, null),
       ($5, $2, $6, $4, now()),
       ($7, $8, $9, null, null)`,
      [
        randomUUID(),
        tenantId,
        activeHumanId,
        roleId,
        randomUUID(),
        suspendedHumanId,
        randomUUID(),
        otherTenantId,
        externalHumanId,
      ],
    );
    await client.query(
      `insert into public.agents (
         id, tenant_id, name, role, human_owner_type, human_owner_id,
         agent_lifecycle_status, agent_health, agent_type, suspended_at
       ) values
       ($1, $2, 'Active Agent', 'operator', 'human', $3, 'active', 'healthy', 'operator', null),
       ($4, $2, 'Suspended Agent', 'operator', 'human', $3, 'suspended', 'blocked', 'operator', now())`,
      [activeAgentId, tenantId, activeHumanId, suspendedAgentId],
    );
    await client.query(
      `insert into public.governance_sessions (
         id, tenant_id, governance_domain, decision_type, subject_type,
         proposer_actor_type, proposer_actor_id, risk_class
       ) values (
         $1, $2, 'knowledge-ratification', 'ratify', 'knowledge-fact',
         'human', $3, 'medium'
       )`,
      [governanceSessionId, tenantId, activeHumanId],
    );
    await client.query(
      `insert into public.decision_records (
         id, tenant_id, session_id, decision_type, subject_type,
         actor_type, actor_id, outcome, justification
       ) values (
         $1, $2, $3, 'ratify', 'knowledge-fact', 'human', $4,
         'approved', 'ratified for canonical read verification'
       )`,
      [decisionRecordId, tenantId, governanceSessionId, activeHumanId],
    );
    await client.query(
      `insert into public.missions (
         id, tenant_id, statement, scope, mission_lifecycle_status, mission_version
       ) values ($1, $2, 'Mission A', 'company', 'ratified', 2)`,
      [missionId, tenantId],
    );
    await client.query(
      `insert into public.goals (
         id, tenant_id, mission_id, mission_version, title, goal_scope, goal_priority,
         goal_lifecycle_status, goal_health, goal_version
       ) values ($1, $2, $3, 2, 'Goal A', 'strategic', 'high', 'active', 'on-track', 3)`,
      [goalId, tenantId, missionId],
    );
    await client.query(
      `insert into public.plans (
         id, tenant_id, mission_id, mission_version, goal_id, goal_version, title,
         plan_scope, plan_priority, plan_lifecycle_status, plan_health, plan_version
       ) values ($1, $2, $3, 2, $4, 3, 'Plan A', 'strategic', 'high', 'active', 'on-track', 4)`,
      [planId, tenantId, missionId, goalId],
    );
    await client.query(
      `insert into public.workflows (
         id, tenant_id, name, mission_id, mission_version, goal_id, goal_version,
         plan_id, plan_version, workflow_lifecycle_status, workflow_health, workflow_version
       ) values ($1, $2, 'Workflow A', $3, 2, $4, 3, $5, 4, 'running', 'healthy', 5)`,
      [workflowId, tenantId, missionId, goalId, planId],
    );
    await client.query(
      `insert into public.tasks (
         id, tenant_id, workflow_id, title, status, plan_id, plan_version,
         goal_id, goal_version, mission_id, mission_version, task_lifecycle_status,
         task_health, task_version
       ) values ($1, $2, $3, 'Task A', 'running', $4, 4, $5, 3, $6, 2, 'running', 'healthy', 6)`,
      [taskId, tenantId, workflowId, planId, goalId, missionId],
    );
    await client.query(
      `insert into public.commands (
         id, tenant_id, trace_id, command_type, actor, status, lifecycle, mission_id,
         mission_version, goal_id, goal_version, plan_id, plan_version, task_id,
         task_version, workflow_id, workflow_version, command_lifecycle_status,
         command_health, correlation_id, causation_id, idempotency_key,
         simulation_mode, command_version
       ) values (
         $1, $2, 'trace-a', 'demo.command', 'tester', 'running', '{}'::jsonb, $3,
         2, $4, 3, $5, 4, $6, 6, $7, 5, 'executing', 'healthy',
         'corr-1', 'cause-1', 'idem-1', 'simulation', 7
       )`,
      [commandId, tenantId, missionId, goalId, planId, taskId, workflowId],
    );
    await client.query(
      `insert into public.executions (
         id, tenant_id, workflow_id, status, command_id, task_id, plan_id, goal_id,
         mission_id, execution_lifecycle_status, execution_health, simulation_mode,
         execution_version
       ) values
       ($1, $2, $3, 'running', $4, $5, $6, $7, $8, 'executing', 'healthy', 'simulation', 8),
       ($9, $2, null, 'pending', null, null, null, null, null, null, null, null, 1)`,
      [
        executionId,
        tenantId,
        workflowId,
        commandId,
        taskId,
        planId,
        goalId,
        missionId,
        partialExecutionId,
      ],
    );
    await client.query(
      `insert into public.knowledge_nodes (
         id, tenant_id, type, label, statement, knowledge_lifecycle_status,
         knowledge_health, knowledge_scope, knowledge_authority, domain_key,
         provenance, source_attribution, governance_session_id,
         ratification_decision_id, ratified_by_actor_type, ratified_by_actor_id,
         ratified_at, knowledge_version
       ) values
       ($1, $2, 'fact', 'Active Node', 'Canonical statement', 'ratified',
        'current', 'domain', 'authoritative', 'ops', '{"source":"ops"}'::jsonb,
        '{"uri":"doc://ops"}'::jsonb, $4, $5, 'human', $6, now(), 5),
       ($3, $2, 'fact', 'Historical Node', 'Historical statement', 'superseded',
        'stale', 'domain', 'authoritative', 'ops', '{"source":"history"}'::jsonb,
        '{"uri":"doc://history"}'::jsonb, $4, $5, 'human', $6, now(), 4)`,
      [
        activeNodeId,
        tenantId,
        historicalNodeId,
        governanceSessionId,
        decisionRecordId,
        activeHumanId,
      ],
    );
    await client.query(
      `insert into public.knowledge_facts (
         id, tenant_id, fact_key, domain_key, knowledge_scope, active_knowledge_node_id,
         previous_knowledge_node_id, fact_version, selected_by_actor_type, selected_by_actor_id,
         governance_session_id, ratification_decision_id
       ) values
       ($1, $2, $3, 'ops', 'domain', $4, $5, 2, 'human', $6, $7, $8),
       ($9, $2, $10, 'ops', 'domain', null, null, 1, 'human', $6, $7, $8)`,
      [
        randomUUID(),
        tenantId,
        activeFactKey,
        activeNodeId,
        historicalNodeId,
        activeHumanId,
        governanceSessionId,
        decisionRecordId,
        randomUUID(),
        partialFactKey,
      ],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }

  return {
    tenantId,
    otherTenantId,
    activeHumanId,
    suspendedHumanId,
    externalHumanId,
    activeAgentId,
    suspendedAgentId,
    activeFactKey,
    partialFactKey,
    completeExecutionId: executionId,
    partialExecutionId,
  };
}

async function main(): Promise<void> {
  await harness.createDatabase();
  try {
    harness.migrateDatabase();
    const seeded = await seedDatabase();
    const services = createCanonicalReadServices({ connectionString: harness.dbUrl });
    const availability = await services.availability();
    assert.equal(availability.available, true);

    const activeHuman = await services.resolveActor({
      tenantId: seeded.tenantId,
      actorType: "human",
      actorId: seeded.activeHumanId,
    });
    assert.equal(activeHuman.status, "resolved");
    assert.equal(activeHuman.active, true);
    assert.equal(activeHuman.membershipSummary?.roleName, "Owner");

    const suspendedHuman = await services.resolveActor({
      tenantId: seeded.tenantId,
      actorType: "human",
      actorId: seeded.suspendedHumanId,
    });
    assert.equal(suspendedHuman.status, "resolved");
    assert.equal(suspendedHuman.suspended, true);

    const tenantMismatchHuman = await services.resolveActor({
      tenantId: seeded.tenantId,
      actorType: "human",
      actorId: seeded.externalHumanId,
    });
    assert.equal(tenantMismatchHuman.status, "tenant-mismatch");

    const activeAgent = await services.resolveActor({
      tenantId: seeded.tenantId,
      actorType: "agent",
      actorId: seeded.activeAgentId,
    });
    assert.equal(activeAgent.status, "resolved");
    assert.equal(activeAgent.humanOwnerSummary?.displayLabel, "Active Human");

    const suspendedAgent = await services.resolveActor({
      tenantId: seeded.tenantId,
      actorType: "agent",
      actorId: seeded.suspendedAgentId,
    });
    assert.equal(suspendedAgent.status, "resolved");
    assert.equal(suspendedAgent.suspended, true);

    const unresolvedSystem = await services.resolveActor({
      tenantId: seeded.tenantId,
      actorType: "system",
      actorId: "system-actor",
    });
    assert.equal(unresolvedSystem.status, "unresolved");

    const unresolvedService = await services.resolveActor({
      tenantId: seeded.tenantId,
      actorType: "service",
      actorId: "service-actor",
    });
    assert.equal(unresolvedService.status, "unresolved");

    const missingActor = await services.resolveActor({
      tenantId: seeded.tenantId,
      actorType: "human",
      actorId: randomUUID(),
    });
    assert.equal(missingActor.status, "not-found");

    const fact = await services.selectCanonicalKnowledgeFact({
      tenantId: seeded.tenantId,
      factKey: seeded.activeFactKey,
      domainKey: "ops",
      knowledgeScope: "domain",
    });
    assert.equal(fact.status, "resolved");
    assert.equal(fact.activeNode?.label, "Active Node");
    assert.equal(fact.activeNode?.knowledgeVersion, 5);
    assert.equal(fact.activeNode?.provenance?.source, "ops");
    assert.equal(fact.activeNode?.ratificationDecisionId !== null, true);
    assert.equal(fact.fact?.previousKnowledgeNodeId !== null, true);
    assert.notEqual(fact.activeNode?.id, fact.fact?.previousKnowledgeNodeId);

    const missingFact = await services.selectCanonicalKnowledgeFact({
      tenantId: seeded.tenantId,
      factKey: "missing.fact",
      domainKey: "ops",
      knowledgeScope: "domain",
    });
    assert.equal(missingFact.status, "not-found");

    const wrongScope = await services.selectCanonicalKnowledgeFact({
      tenantId: seeded.tenantId,
      factKey: seeded.activeFactKey,
      domainKey: "ops",
      knowledgeScope: "company-wide",
    });
    assert.equal(wrongScope.status, "not-found");

    const wrongDomain = await services.selectCanonicalKnowledgeFact({
      tenantId: seeded.tenantId,
      factKey: seeded.activeFactKey,
      domainKey: "finance",
      knowledgeScope: "domain",
    });
    assert.equal(wrongDomain.status, "not-found");

    const partialFact = await services.selectCanonicalKnowledgeFact({
      tenantId: seeded.tenantId,
      factKey: seeded.partialFactKey,
      domainKey: "ops",
      knowledgeScope: "domain",
    });
    assert.equal(partialFact.status, "partial");

    const tenantMismatchFact = await services.selectCanonicalKnowledgeFact({
      tenantId: seeded.otherTenantId,
      factKey: seeded.activeFactKey,
      domainKey: "ops",
      knowledgeScope: "domain",
    });
    assert.equal(tenantMismatchFact.status, "tenant-mismatch");

    const completeLineage = await services.getExecutionLineage({
      tenantId: seeded.tenantId,
      executionId: seeded.completeExecutionId,
    });
    assert.equal(completeLineage.status, "resolved");
    assert.equal(completeLineage.completeness, "complete");
    assert.equal(completeLineage.execution?.legacyStatus, "running");
    assert.equal(completeLineage.execution?.lifecycleStatus, "executing");
    assert.equal(completeLineage.command?.legacyStatus, "running");
    assert.equal(completeLineage.command?.lifecycleStatus, "executing");
    assert.equal(completeLineage.task?.legacyStatus, "running");
    assert.equal(completeLineage.task?.lifecycleStatus, "running");
    assert.equal(completeLineage.command?.correlationId, "corr-1");
    assert.equal(completeLineage.command?.idempotencyKey, "idem-1");
    assert.equal(completeLineage.execution?.simulationMode, "simulation");

    const partialLineage = await services.getExecutionLineage({
      tenantId: seeded.tenantId,
      executionId: seeded.partialExecutionId,
    });
    assert.equal(partialLineage.status, "partial");
    assert.equal(partialLineage.completeness, "partial");

    const missingExecution = await services.getExecutionLineage({
      tenantId: seeded.tenantId,
      executionId: randomUUID(),
    });
    assert.equal(missingExecution.status, "not-found");

    const tenantMismatchExecution = await services.getExecutionLineage({
      tenantId: seeded.otherTenantId,
      executionId: seeded.completeExecutionId,
    });
    assert.equal(tenantMismatchExecution.status, "tenant-mismatch");

    await services.dispose();
    console.log("canonical-read integration checks passed");
  } finally {
    await harness.dropDatabase();
  }
}

void main();
