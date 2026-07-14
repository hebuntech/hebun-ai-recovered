import type { CanonicalReadAvailability } from "@/features/canonical-read";
import type {
  ReadFieldComparisonStatus,
  ReadSourceAvailability,
  ReadStatus,
} from "@/features/canonical-read-platform";

export type ExecutionShadowReadStatus = ReadStatus;

export type ExecutionShadowMismatchCategory =
  | "execution mismatch"
  | "command mismatch"
  | "workflow mismatch"
  | "task mismatch"
  | "plan mismatch"
  | "goal mismatch"
  | "mission mismatch"
  | "version mismatch"
  | "lifecycle mismatch"
  | "legacy-status mismatch"
  | "missing lineage"
  | "broken chain"
  | "tenant mismatch"
  | "unavailable source"
  | "non-comparable field";

export type ExecutionFieldComparisonStatus = ReadFieldComparisonStatus;

export interface ExecutionShadowReadInput {
  readonly tenantId: string;
  readonly executionId: string;
}

export interface ExecutionNodeShadowSummary {
  readonly id: string;
  readonly label?: string | null;
  readonly version?: string | number | null;
  readonly lifecycleStatus?: string | null;
  readonly legacyStatus?: string | null;
  readonly health?: string | null;
  readonly correlationId?: string | null;
  readonly causationId?: string | null;
  readonly idempotencyKey?: string | null;
  readonly simulationMode?: string | null;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
}

export interface MemoryExecutionLineageSummary {
  readonly source: "execution-session";
  readonly execution?: ExecutionNodeShadowSummary;
  readonly command?: ExecutionNodeShadowSummary;
  readonly workflow?: ExecutionNodeShadowSummary;
  readonly task?: ExecutionNodeShadowSummary;
  readonly plan?: ExecutionNodeShadowSummary;
  readonly goal?: ExecutionNodeShadowSummary;
  readonly mission?: ExecutionNodeShadowSummary;
  readonly completeness: "complete" | "partial" | "missing-root";
  readonly warnings: readonly string[];
}

export interface PostgresExecutionLineageSummary {
  readonly execution?: ExecutionNodeShadowSummary;
  readonly command?: ExecutionNodeShadowSummary;
  readonly workflow?: ExecutionNodeShadowSummary;
  readonly task?: ExecutionNodeShadowSummary;
  readonly plan?: ExecutionNodeShadowSummary;
  readonly goal?: ExecutionNodeShadowSummary;
  readonly mission?: ExecutionNodeShadowSummary;
  readonly completeness: "complete" | "partial" | "missing-root";
  readonly warnings: readonly string[];
}

export interface ExecutionFieldComparison {
  readonly node:
    | "execution"
    | "command"
    | "workflow"
    | "task"
    | "plan"
    | "goal"
    | "mission";
  readonly field:
    | "id"
    | "label"
    | "version"
    | "lifecycleStatus"
    | "legacyStatus"
    | "health"
    | "correlationId"
    | "causationId"
    | "idempotencyKey"
    | "simulationMode"
    | "startedAt"
    | "completedAt";
  readonly status: ExecutionFieldComparisonStatus;
  readonly memoryValue?: string | number | null;
  readonly postgresValue?: string | number | null;
  readonly note?: string;
}

export interface ExecutionShadowReadDiff {
  readonly mismatches: readonly ExecutionFieldComparison[];
  readonly matchedFields: readonly ExecutionFieldComparison[];
  readonly nonComparableFields: readonly ExecutionFieldComparison[];
  readonly missingFields: readonly ExecutionFieldComparison[];
  readonly mismatchCategories: readonly ExecutionShadowMismatchCategory[];
}

export type ExecutionLineageComparison = ExecutionShadowReadDiff;

export interface ExecutionShadowReadResult {
  readonly kind: "execution-shadow-read";
  readonly input: ExecutionShadowReadInput;
  readonly status: ExecutionShadowReadStatus;
  readonly memory: {
    readonly found: boolean;
    readonly summary?: MemoryExecutionLineageSummary;
  };
  readonly postgres: {
    readonly found: boolean;
    readonly availability: CanonicalReadAvailability;
    readonly summary?: PostgresExecutionLineageSummary;
    readonly reason?: string;
  };
  readonly sourceAvailability: ReadSourceAvailability;
  readonly diff: ExecutionShadowReadDiff;
  readonly warnings: readonly string[];
  readonly comparedAt: string;
}
