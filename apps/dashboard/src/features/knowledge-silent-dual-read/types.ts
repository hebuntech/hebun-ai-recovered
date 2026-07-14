import type { CanonicalReadAvailability } from "@/features/canonical-read";

export const KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION = "v1";
export const KNOWLEDGE_SILENT_DUAL_READ_MAX_TIMEOUT_MS = 500;

export type KnowledgeSilentDualReadIneligibleReason =
  | "feature-disabled"
  | "kill-switch-active"
  | "tenant-not-allowed"
  | "sample-excluded"
  | "canonical-read-unavailable"
  | "invalid-config"
  | "missing-tenant"
  | "missing-sample-key";

export interface KnowledgeSilentDualReadConfig {
  readonly requestedEnabled: boolean;
  readonly enabled: boolean;
  readonly killSwitchActive: boolean;
  readonly allowlistCount: number;
  readonly sampleRate: number;
  readonly timeoutMs: number;
  readonly metricsSink: "noop" | "in-memory";
  readonly valid: boolean;
  readonly reasons: readonly string[];
  readonly allowlistedTenants: ReadonlySet<string>;
}

export interface KnowledgeSilentDualReadEligibilityInput {
  readonly config: KnowledgeSilentDualReadConfig;
  readonly tenantId?: string | null;
  readonly requestSampleKey?: string | null;
  readonly canonicalAvailability: CanonicalReadAvailability;
}

export interface KnowledgeSilentDualReadEligibilityResult {
  readonly eligible: boolean;
  readonly reason?: KnowledgeSilentDualReadIneligibleReason;
}

export interface KnowledgeSilentDualReadRolloutEvaluationInput {
  readonly config: KnowledgeSilentDualReadConfig;
  readonly tenantId?: string | null;
  readonly requestSampleKey?: string | null;
}

export interface KnowledgeSilentDualReadRolloutEvaluation {
  readonly enabled: boolean;
  readonly sampled: boolean;
  readonly tenantEligible: boolean;
  readonly shouldRun: boolean;
  readonly reason?: Exclude<
    KnowledgeSilentDualReadIneligibleReason,
    "canonical-read-unavailable"
  >;
}

export type KnowledgeSilentDualReadCounterName =
  | "shadow_rollout_enabled_count"
  | "shadow_rollout_disabled_count"
  | "shadow_rollout_sampled_count"
  | "shadow_rollout_skipped_count"
  | "shadow_rollout_killswitch_count"
  | "shadow_knowledge_eligible_count"
  | "shadow_knowledge_executed_count"
  | "shadow_knowledge_matched_count"
  | "shadow_knowledge_partial_match_count"
  | "shadow_knowledge_mismatch_count"
  | "shadow_knowledge_memory_only_count"
  | "shadow_knowledge_postgres_only_count"
  | "shadow_knowledge_not_found_count"
  | "shadow_knowledge_unavailable_count"
  | "shadow_knowledge_invalid_input_count"
  | "shadow_knowledge_tenant_mismatch_count"
  | "shadow_knowledge_timeout_count"
  | "shadow_knowledge_error_count";

export interface KnowledgeSilentDualReadMetricTags {
  readonly environment: string;
  readonly experimentVersion: string;
  readonly status?: string;
  readonly errorCategory?: string;
  readonly tenantCohort?: string;
}

export interface KnowledgeSilentDualReadMetricsSnapshot {
  readonly sinkType: "noop" | "in-memory";
  readonly counters: Readonly<Record<KnowledgeSilentDualReadCounterName, number>>;
  readonly latencySamples: readonly number[];
}

export interface KnowledgeSilentDualReadMetricsSink {
  readonly sinkType: "noop" | "in-memory";
  increment(
    counter: KnowledgeSilentDualReadCounterName,
    tags: KnowledgeSilentDualReadMetricTags,
  ): void;
  observeLatency(
    valueMs: number,
    tags: KnowledgeSilentDualReadMetricTags,
  ): void;
  snapshot(): KnowledgeSilentDualReadMetricsSnapshot;
}

export type KnowledgeSilentDualReadErrorCategory =
  | "timeout"
  | "unavailable"
  | "query-failed"
  | "invalid-config"
  | "unknown";

export interface KnowledgeSilentDualReadHookObservation {
  readonly executed: boolean;
  readonly status?: string;
  readonly timedOut: boolean;
  readonly errorCategory?: KnowledgeSilentDualReadErrorCategory;
}

export interface KnowledgeSilentDualReadRolloutDiagnosticsView {
  readonly enabled: boolean;
  readonly disabled: boolean;
  readonly samplePercentage: number;
  readonly tenantEligible: boolean | null;
  readonly killSwitchActive: boolean;
  readonly reason?: string;
}
