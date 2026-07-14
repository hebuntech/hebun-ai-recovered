import {
  createCanonicalReadServices,
  type CanonicalReadServices,
} from "@/features/canonical-read";
import {
  createReadComparisonResult,
  createReadComparedAt,
  createUnavailableReadAvailability,
  deriveReadMatchStatus,
  deriveReadPresenceStatus,
  isReadUuidLike,
} from "@/features/canonical-read-platform";
import { readCanonicalReadConfigFromEnv } from "@/features/canonical-read/config";
import { executionSessionById } from "@/features/execution/execution-queries";
import type { ExecutionSession } from "@/features/execution/types";
import type { WorkflowCrudRecord } from "@/features/workflow-crud";
import { getSnapshot as getWorkflowSnapshot } from "@/features/workflow-crud/workflow-adapter";
import { compareExecutionShadow } from "./comparator";
import type {
  ExecutionNodeShadowSummary,
  ExecutionShadowReadInput,
  ExecutionShadowReadResult,
  MemoryExecutionLineageSummary,
  PostgresExecutionLineageSummary,
} from "./types";

function workflowFromPlan(
  session: ExecutionSession,
  workflowRecords: readonly WorkflowCrudRecord[],
): ExecutionNodeShadowSummary | undefined {
  const workflowRef =
    session.orchestration.plan.resourceAllocation.resources.find(
      (resource) => resource.category === "workflows",
    )?.referenceId ??
    session.orchestration.plan.tasks.find((task) => task.owner === "Workflow Engine")
      ?.id;

  if (!workflowRef) return undefined;

  const workflow =
    getWorkflowSnapshot().find((record) => record.id === workflowRef) ??
    workflowRecords.find((record) => record.id === workflowRef);

  return {
    id: workflow?.id ?? workflowRef,
    label: workflow?.name ?? "Workflow reference",
    version: workflow?.version ?? null,
    lifecycleStatus: workflow?.lifecycleStatus ?? null,
    legacyStatus: workflow?.status ?? null,
    simulationMode: workflow?.executionMode ?? null,
  };
}

function taskFromPlan(session: ExecutionSession): ExecutionNodeShadowSummary | undefined {
  const task = session.orchestration.plan.tasks[0];
  if (!task) return undefined;

  return {
    id: task.id,
    label: task.title,
    legacyStatus: task.status,
    version: null,
  };
}

function summarizeMemoryExecutionSession(
  session: ExecutionSession,
  workflowRecords: readonly WorkflowCrudRecord[],
): MemoryExecutionLineageSummary {
  const workflow = workflowFromPlan(session, workflowRecords);
  const task = taskFromPlan(session);
  const plan: ExecutionNodeShadowSummary = {
    id: session.planId,
    label: session.orchestration.plan.title,
    version: null,
  };
  const goal: ExecutionNodeShadowSummary = {
    id: session.orchestration.plan.goalId,
    label: session.orchestration.plan.goal.title,
    version: null,
  };

  const warnings: string[] = [];
  warnings.push(
    "The current memory execution runtime does not carry a canonical command lineage row.",
  );
  warnings.push(
    "The current memory execution runtime does not carry a Mission lineage reference.",
  );

  return {
    source: "execution-session",
    execution: {
      id: session.id,
      label: session.summary.headline,
      version: null,
      lifecycleStatus: null,
      legacyStatus: session.executionState,
      simulationMode: "offline",
      startedAt: session.startedAt,
      completedAt: session.endedAt ?? null,
    },
    command: undefined,
    workflow,
    task,
    plan,
    goal,
    mission: undefined,
    completeness:
      workflow && task && plan && goal ? "partial" : "missing-root",
    warnings,
  };
}

function summarizePostgres(
  result: Awaited<ReturnType<CanonicalReadServices["getExecutionLineage"]>>,
): PostgresExecutionLineageSummary | undefined {
  if (
    !result.execution &&
    !result.command &&
    !result.workflow &&
    !result.task &&
    !result.plan &&
    !result.goal &&
    !result.mission
  ) {
    return undefined;
  }

  return {
    execution: result.execution,
    command: result.command,
    workflow: result.workflow,
    task: result.task,
    plan: result.plan,
    goal: result.goal,
    mission: result.mission,
    completeness: result.completeness,
    warnings: result.warnings.map((warning) => warning.message),
  };
}

export interface ExecutionShadowReadServiceOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly canonicalReadServices?: CanonicalReadServices;
  readonly memorySummary?: MemoryExecutionLineageSummary;
  readonly workflowRecords?: readonly WorkflowCrudRecord[];
}

export async function runExecutionShadowRead(
  input: ExecutionShadowReadInput,
  options: ExecutionShadowReadServiceOptions = {},
): Promise<ExecutionShadowReadResult> {
  if (!isReadUuidLike(input.tenantId) || !input.executionId.trim()) {
    return createReadComparisonResult({
      kind: "execution-shadow-read",
      input,
      status: "invalid-input",
      postgresAvailability: createUnavailableReadAvailability(),
      postgresReason: "invalid-input",
      diff: {
        mismatches: [],
        matchedFields: [],
        nonComparableFields: [],
        missingFields: [],
        mismatchCategories: [],
      },
      warnings: ["Execution shadow read input is invalid."],
      comparedAt: createReadComparedAt(),
    });
  }

  const ownServices = !options.canonicalReadServices;
  const services =
    options.canonicalReadServices ??
    createCanonicalReadServices(
      readCanonicalReadConfigFromEnv(options.env ?? process.env),
    );

  try {
    const memorySummary =
      options.memorySummary ??
      (() => {
        const session = executionSessionById(input.executionId);
        if (!session) return undefined;
        const workflows = options.workflowRecords ?? getWorkflowSnapshot();
        return summarizeMemoryExecutionSession(session, workflows);
      })();

    const canonical = await services.getExecutionLineage(input);
    const postgresSummary = summarizePostgres(canonical);
    const diff = compareExecutionShadow({
      memory: memorySummary,
      postgres: postgresSummary,
    });
    const warnings = [
      ...(memorySummary?.warnings ?? []),
      ...(postgresSummary?.warnings ?? []),
    ];
    const comparedAt = createReadComparedAt();

    if (canonical.status === "tenant-mismatch") {
      return createReadComparisonResult({
        kind: "execution-shadow-read",
        input,
        status: "tenant-mismatch",
        memorySummary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    if (canonical.status === "unavailable") {
      return createReadComparisonResult({
        kind: "execution-shadow-read",
        input,
        status: "unavailable",
        memorySummary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    const presenceStatus = deriveReadPresenceStatus({
      memoryFound: Boolean(memorySummary),
      postgresFound: Boolean(postgresSummary),
    });

    if (presenceStatus === "memory-only") {
      return createReadComparisonResult({
        kind: "execution-shadow-read",
        input,
        status: "memory-only",
        memorySummary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    if (presenceStatus === "postgres-only") {
      return createReadComparisonResult({
        kind: "execution-shadow-read",
        input,
        status: "postgres-only",
        postgresAvailability: canonical.availability,
        postgresSummary,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    if (presenceStatus === "not-found") {
      return createReadComparisonResult({
        kind: "execution-shadow-read",
        input,
        status: "not-found",
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    const status = deriveReadMatchStatus(diff);

    return createReadComparisonResult({
      kind: "execution-shadow-read",
      input,
      status,
      memorySummary,
      postgresAvailability: canonical.availability,
      postgresSummary,
      postgresReason: canonical.reason,
      diff,
      warnings,
      comparedAt,
    });
  } finally {
    if (ownServices) {
      await services.dispose();
    }
  }
}
