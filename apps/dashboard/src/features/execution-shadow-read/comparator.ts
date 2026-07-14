import type {
  ExecutionFieldComparison,
  ExecutionShadowReadDiff,
  ExecutionNodeShadowSummary,
  ExecutionShadowMismatchCategory,
} from "./types";
import {
  compareReadField,
  partitionReadComparisons,
} from "@/features/canonical-read-platform";

function classifyNodeMismatch(
  node: ExecutionFieldComparison["node"],
): ExecutionShadowMismatchCategory {
  switch (node) {
    case "execution":
      return "execution mismatch";
    case "command":
      return "command mismatch";
    case "workflow":
      return "workflow mismatch";
    case "task":
      return "task mismatch";
    case "plan":
      return "plan mismatch";
    case "goal":
      return "goal mismatch";
    case "mission":
      return "mission mismatch";
  }
}

function classifyFieldMismatch(
  node: ExecutionFieldComparison["node"],
  field: ExecutionFieldComparison["field"],
): ExecutionShadowMismatchCategory {
  if (field === "version") return "version mismatch";
  if (field === "lifecycleStatus") return "lifecycle mismatch";
  if (field === "legacyStatus") return "legacy-status mismatch";
  return classifyNodeMismatch(node);
}

function compareField(params: {
  node: ExecutionFieldComparison["node"];
  field: ExecutionFieldComparison["field"];
  memoryValue?: string | number | null;
  postgresValue?: string | number | null;
  memoryComparable?: boolean;
  postgresComparable?: boolean;
  normalize?: "identifier" | "text" | "exact";
  note?: string;
}): ExecutionFieldComparison {
  return compareReadField({
    memoryValue: params.memoryValue,
    postgresValue: params.postgresValue,
    memoryComparable: params.memoryComparable,
    postgresComparable: params.postgresComparable,
    normalize: params.normalize,
    create: (status) => ({
      node: params.node,
      field: params.field,
      status,
      memoryValue: params.memoryValue ?? null,
      postgresValue: params.postgresValue ?? null,
      note: params.note,
    }),
  });
}

function nodeComparisons(
  node: ExecutionFieldComparison["node"],
  memoryNode?: ExecutionNodeShadowSummary,
  postgresNode?: ExecutionNodeShadowSummary,
): ExecutionFieldComparison[] {
  const lifecycleComparable = memoryNode?.lifecycleStatus != null;
  const healthComparable = memoryNode?.health != null;
  const correlationComparable = memoryNode?.correlationId != null;
  const causationComparable = memoryNode?.causationId != null;
  const idempotencyComparable = memoryNode?.idempotencyKey != null;
  const startedComparable = memoryNode?.startedAt != null;
  const completedComparable = memoryNode?.completedAt != null;

  return [
    compareField({
      node,
      field: "id",
      memoryValue: memoryNode?.id ?? null,
      postgresValue: postgresNode?.id ?? null,
      normalize: "identifier",
    }),
    compareField({
      node,
      field: "label",
      memoryValue: memoryNode?.label ?? null,
      postgresValue: postgresNode?.label ?? null,
      normalize: "text",
    }),
    compareField({
      node,
      field: "version",
      memoryValue:
        memoryNode?.version != null ? String(memoryNode.version) : null,
      postgresValue:
        postgresNode?.version != null ? String(postgresNode.version) : null,
    }),
    compareField({
      node,
      field: "lifecycleStatus",
      memoryValue: memoryNode?.lifecycleStatus ?? null,
      postgresValue: postgresNode?.lifecycleStatus ?? null,
      memoryComparable: lifecycleComparable,
      normalize: "identifier",
      note:
        lifecycleComparable
          ? undefined
          : "The current memory execution lineage does not expose a canonical lifecycle field for this node.",
    }),
    compareField({
      node,
      field: "legacyStatus",
      memoryValue: memoryNode?.legacyStatus ?? null,
      postgresValue: postgresNode?.legacyStatus ?? null,
      normalize: "identifier",
    }),
    compareField({
      node,
      field: "health",
      memoryValue: memoryNode?.health ?? null,
      postgresValue: postgresNode?.health ?? null,
      memoryComparable: healthComparable,
      normalize: "identifier",
      note:
        healthComparable
          ? undefined
          : "The current memory execution lineage does not expose health for this node.",
    }),
    compareField({
      node,
      field: "correlationId",
      memoryValue: memoryNode?.correlationId ?? null,
      postgresValue: postgresNode?.correlationId ?? null,
      memoryComparable: correlationComparable,
      note:
        correlationComparable
          ? undefined
          : "The current memory execution lineage does not expose a command correlation id.",
    }),
    compareField({
      node,
      field: "causationId",
      memoryValue: memoryNode?.causationId ?? null,
      postgresValue: postgresNode?.causationId ?? null,
      memoryComparable: causationComparable,
      note:
        causationComparable
          ? undefined
          : "The current memory execution lineage does not expose a command causation id.",
    }),
    compareField({
      node,
      field: "idempotencyKey",
      memoryValue: memoryNode?.idempotencyKey ?? null,
      postgresValue: postgresNode?.idempotencyKey ?? null,
      memoryComparable: idempotencyComparable,
      note:
        idempotencyComparable
          ? undefined
          : "The current memory execution lineage does not expose a command idempotency key.",
    }),
    compareField({
      node,
      field: "simulationMode",
      memoryValue: memoryNode?.simulationMode ?? null,
      postgresValue: postgresNode?.simulationMode ?? null,
      normalize: "identifier",
    }),
    compareField({
      node,
      field: "startedAt",
      memoryValue: memoryNode?.startedAt ?? null,
      postgresValue: postgresNode?.startedAt ?? null,
      memoryComparable: startedComparable,
      note:
        startedComparable
          ? undefined
          : "The current memory execution lineage does not expose a start timestamp for this node.",
    }),
    compareField({
      node,
      field: "completedAt",
      memoryValue: memoryNode?.completedAt ?? null,
      postgresValue: postgresNode?.completedAt ?? null,
      memoryComparable: completedComparable,
      note:
        completedComparable
          ? undefined
          : "The current memory execution lineage does not expose a completion timestamp for this node.",
    }),
  ];
}

export function compareExecutionShadow(input: {
  memory?: {
    execution?: ExecutionNodeShadowSummary;
    command?: ExecutionNodeShadowSummary;
    workflow?: ExecutionNodeShadowSummary;
    task?: ExecutionNodeShadowSummary;
    plan?: ExecutionNodeShadowSummary;
    goal?: ExecutionNodeShadowSummary;
    mission?: ExecutionNodeShadowSummary;
  };
  postgres?: {
    execution?: ExecutionNodeShadowSummary;
    command?: ExecutionNodeShadowSummary;
    workflow?: ExecutionNodeShadowSummary;
    task?: ExecutionNodeShadowSummary;
    plan?: ExecutionNodeShadowSummary;
    goal?: ExecutionNodeShadowSummary;
    mission?: ExecutionNodeShadowSummary;
  };
}): ExecutionShadowReadDiff {
  const comparisons = [
    ...nodeComparisons("execution", input.memory?.execution, input.postgres?.execution),
    ...nodeComparisons("command", input.memory?.command, input.postgres?.command),
    ...nodeComparisons("workflow", input.memory?.workflow, input.postgres?.workflow),
    ...nodeComparisons("task", input.memory?.task, input.postgres?.task),
    ...nodeComparisons("plan", input.memory?.plan, input.postgres?.plan),
    ...nodeComparisons("goal", input.memory?.goal, input.postgres?.goal),
    ...nodeComparisons("mission", input.memory?.mission, input.postgres?.mission),
  ];

  const {
    matchedFields,
    mismatches,
    nonComparableFields,
    missingFields,
  } = partitionReadComparisons(comparisons);

  const categories: ExecutionShadowMismatchCategory[] = [
    ...mismatches.map((item) => classifyFieldMismatch(item.node, item.field)),
    ...nonComparableFields.map(() => "non-comparable field" as const),
    ...missingFields.map((item) =>
      item.status === "missing-memory"
        ? ("missing lineage" as const)
        : ("broken chain" as const),
    ),
  ];

  return {
    mismatches,
    matchedFields,
    nonComparableFields,
    missingFields,
    mismatchCategories: [
      ...new Set<ExecutionShadowMismatchCategory>(categories),
    ],
  };
}
