import { CanonicalPgReadClient } from "./pg-read-client";
import type {
  DualShapeWarning,
  ExecutionLineageResult,
  LineageNodeReference,
} from "./types";

interface ExecutionLineageRow {
  execution_id: string;
  execution_tenant_id: string;
  execution_status: string;
  execution_lifecycle_status: string | null;
  execution_health: string | null;
  execution_version: number | null;
  execution_workflow_id: string | null;
  execution_task_id: string | null;
  execution_plan_id: string | null;
  execution_goal_id: string | null;
  execution_mission_id: string | null;
  execution_command_id: string | null;
  execution_simulation_mode: string | null;
  command_id: string | null;
  command_type: string | null;
  command_status: string | null;
  command_lifecycle_status: string | null;
  command_health: string | null;
  command_version: number | null;
  command_workflow_id: string | null;
  command_task_id: string | null;
  command_plan_id: string | null;
  command_goal_id: string | null;
  command_mission_id: string | null;
  correlation_id: string | null;
  causation_id: string | null;
  idempotency_key: string | null;
  command_simulation_mode: string | null;
  workflow_id: string | null;
  workflow_name: string | null;
  workflow_lifecycle_status: string | null;
  workflow_health: string | null;
  workflow_version: number | null;
  task_id: string | null;
  task_title: string | null;
  task_status: string | null;
  task_lifecycle_status: string | null;
  task_health: string | null;
  task_version: number | null;
  plan_id: string | null;
  plan_title: string | null;
  plan_lifecycle_status: string | null;
  plan_health: string | null;
  plan_version: number | null;
  goal_id: string | null;
  goal_title: string | null;
  goal_lifecycle_status: string | null;
  goal_health: string | null;
  goal_version: number | null;
  mission_id: string | null;
  mission_statement: string | null;
  mission_lifecycle_status: string | null;
  mission_version: number | null;
}

function unavailable(
  client: CanonicalPgReadClient,
  input: { tenantId: string; executionId: string },
): ExecutionLineageResult {
  return {
    kind: "execution-lineage",
    status: "unavailable",
    availability: client.unavailableAvailability(),
    executionId: input.executionId,
    tenantId: input.tenantId,
    completeness: "missing-root",
    warnings: [],
    reason: client.unavailableError().message,
    error: client.unavailableError(),
  };
}

function warn(code: string, message: string): DualShapeWarning {
  return { code, message, severity: "warning" };
}

function node(
  id: string | null,
  tenantId: string,
  values: Omit<LineageNodeReference, "id" | "tenantId">,
): LineageNodeReference | undefined {
  if (!id) return undefined;
  return { id, tenantId, ...values };
}

export async function getExecutionLineage(
  client: CanonicalPgReadClient,
  input: { tenantId: string; executionId: string },
): Promise<ExecutionLineageResult> {
  const availability = await client.availability();
  if (!availability.available) return unavailable(client, input);

  try {
    const row = await client.queryOne<ExecutionLineageRow>(
      `
        select
          e.id as execution_id,
          e.tenant_id as execution_tenant_id,
          e.status as execution_status,
          e.execution_lifecycle_status,
          e.execution_health,
          e.execution_version,
          e.workflow_id as execution_workflow_id,
          e.task_id as execution_task_id,
          e.plan_id as execution_plan_id,
          e.goal_id as execution_goal_id,
          e.mission_id as execution_mission_id,
          e.command_id as execution_command_id,
          e.simulation_mode as execution_simulation_mode,
          c.id as command_id,
          c.command_type,
          c.status as command_status,
          c.command_lifecycle_status,
          c.command_health,
          c.command_version,
          c.workflow_id as command_workflow_id,
          c.task_id as command_task_id,
          c.plan_id as command_plan_id,
          c.goal_id as command_goal_id,
          c.mission_id as command_mission_id,
          c.correlation_id,
          c.causation_id,
          c.idempotency_key,
          c.simulation_mode as command_simulation_mode,
          w.id as workflow_id,
          w.name as workflow_name,
          w.workflow_lifecycle_status,
          w.workflow_health,
          w.workflow_version,
          t.id as task_id,
          t.title as task_title,
          t.status as task_status,
          t.task_lifecycle_status,
          t.task_health,
          t.task_version,
          p.id as plan_id,
          p.title as plan_title,
          p.plan_lifecycle_status,
          p.plan_health,
          p.plan_version,
          g.id as goal_id,
          g.title as goal_title,
          g.goal_lifecycle_status,
          g.goal_health,
          g.goal_version,
          m.id as mission_id,
          m.statement as mission_statement,
          m.mission_lifecycle_status,
          m.mission_version
        from public.executions e
        left join public.commands c
          on c.id = e.command_id
         and c.tenant_id = e.tenant_id
        left join public.workflows w
          on w.id = coalesce(c.workflow_id, e.workflow_id)
         and w.tenant_id = e.tenant_id
        left join public.tasks t
          on t.id = coalesce(c.task_id, e.task_id)
         and t.tenant_id = e.tenant_id
        left join public.plans p
          on p.id = coalesce(t.plan_id, c.plan_id, e.plan_id)
         and p.tenant_id = e.tenant_id
        left join public.goals g
          on g.id = coalesce(p.goal_id, t.goal_id, c.goal_id, e.goal_id)
         and g.tenant_id = e.tenant_id
        left join public.missions m
          on m.id = coalesce(g.mission_id, p.mission_id, t.mission_id, c.mission_id, e.mission_id)
         and m.tenant_id = e.tenant_id
        where e.tenant_id = $1
          and e.id = $2
        limit 1
      `,
      [input.tenantId, input.executionId],
    );

    if (!row) {
      const elsewhere = await client.queryOne<{ exists: boolean }>(
        `
          select true as exists
          from public.executions
          where id = $1
          limit 1
        `,
        [input.executionId],
      );

      return {
        kind: "execution-lineage",
        status: elsewhere ? "tenant-mismatch" : "not-found",
        availability,
        executionId: input.executionId,
        tenantId: input.tenantId,
        completeness: "missing-root",
        warnings: elsewhere
          ? [warn("tenant-mismatch", "Execution exists outside the requested tenant.")]
          : [],
        reason: elsewhere ? "execution-tenant-mismatch" : "execution-not-found",
        error: {
          code: elsewhere ? "tenant_mismatch" : "not_found",
          message: elsewhere
            ? "Execution exists but does not belong to the requested tenant."
            : "No canonical execution exists for the requested tenant and id.",
          retryable: false,
        },
      };
    }

  const warnings: DualShapeWarning[] = [];
  if (!row.execution_lifecycle_status) {
    warnings.push(
      warn(
        "missing-execution-lifecycle",
        "Execution has a legacy runtime status but no canonical execution lifecycle status.",
      ),
    );
  }
  if (row.command_id && !row.command_lifecycle_status) {
    warnings.push(
      warn(
        "missing-command-lifecycle",
        "Command has a legacy runtime status but no canonical command lifecycle status.",
      ),
    );
  }
  if (row.task_id && !row.task_lifecycle_status) {
    warnings.push(
      warn(
        "missing-task-lifecycle",
        "Task has a legacy runtime status but no canonical task lifecycle status.",
      ),
    );
  }
  if (
    row.execution_workflow_id &&
    row.command_workflow_id &&
    row.execution_workflow_id !== row.command_workflow_id
  ) {
    warnings.push(
      warn(
        "workflow-id-disagreement",
        "Execution.workflow_id and Command.workflow_id disagree.",
      ),
    );
  }
  if (
    row.execution_task_id &&
    row.command_task_id &&
    row.execution_task_id !== row.command_task_id
  ) {
    warnings.push(
      warn("task-id-disagreement", "Execution.task_id and Command.task_id disagree."),
    );
  }
  if (!row.plan_id) {
    warnings.push(warn("missing-plan-link", "Lineage does not resolve to a Plan."));
  }
  if (!row.goal_id) {
    warnings.push(warn("missing-goal-link", "Lineage does not resolve to a Goal."));
  }
  if (!row.mission_id) {
    warnings.push(
      warn("missing-mission-link", "Lineage does not resolve to a Mission."),
    );
  }

  const execution = node(row.execution_id, row.execution_tenant_id, {
    legacyStatus: row.execution_status,
    lifecycleStatus: row.execution_lifecycle_status,
    health: row.execution_health,
    version: row.execution_version,
    simulationMode: row.execution_simulation_mode,
  });
  const command = node(row.command_id, row.execution_tenant_id, {
    label: row.command_type,
    legacyStatus: row.command_status,
    lifecycleStatus: row.command_lifecycle_status,
    health: row.command_health,
    version: row.command_version,
    correlationId: row.correlation_id,
    causationId: row.causation_id,
    idempotencyKey: row.idempotency_key,
    simulationMode: row.command_simulation_mode,
  });
  const workflow = node(row.workflow_id, row.execution_tenant_id, {
    label: row.workflow_name,
    lifecycleStatus: row.workflow_lifecycle_status,
    health: row.workflow_health,
    version: row.workflow_version,
  });
  const task = node(row.task_id, row.execution_tenant_id, {
    label: row.task_title,
    legacyStatus: row.task_status,
    lifecycleStatus: row.task_lifecycle_status,
    health: row.task_health,
    version: row.task_version,
  });
  const plan = node(row.plan_id, row.execution_tenant_id, {
    label: row.plan_title,
    lifecycleStatus: row.plan_lifecycle_status,
    health: row.plan_health,
    version: row.plan_version,
  });
  const goal = node(row.goal_id, row.execution_tenant_id, {
    label: row.goal_title,
    lifecycleStatus: row.goal_lifecycle_status,
    health: row.goal_health,
    version: row.goal_version,
  });
  const mission = node(row.mission_id, row.execution_tenant_id, {
    label: row.mission_statement,
    lifecycleStatus: row.mission_lifecycle_status,
    version: row.mission_version,
  });

  const completeness =
    workflow && task && plan && goal && mission ? "complete" : "partial";

    return {
      kind: "execution-lineage",
      status: warnings.length > 0 ? "partial" : "resolved",
      availability,
      executionId: input.executionId,
      tenantId: input.tenantId,
      completeness,
      execution,
      command,
      workflow,
      task,
      plan,
      goal,
      mission,
      warnings,
      reason:
        warnings.length > 0 ? "dual-shape-or-missing-link-warning" : undefined,
      error:
        warnings.length > 0
          ? {
              code: "partial_result",
              message:
                "Execution lineage resolved with missing links or dual-shape inconsistencies.",
              retryable: false,
            }
          : undefined,
    };
  } catch (error) {
    return {
      kind: "execution-lineage",
      status: "unavailable",
      availability,
      executionId: input.executionId,
      tenantId: input.tenantId,
      completeness: "missing-root",
      warnings: [],
      reason: "execution-lineage-query-failed",
      error: {
        code: "query_failed",
        message: "Canonical execution lineage query failed.",
        retryable: true,
        detail:
          error instanceof Error
            ? error.message
            : "Unknown execution lineage query failure.",
      },
    };
  }
}
