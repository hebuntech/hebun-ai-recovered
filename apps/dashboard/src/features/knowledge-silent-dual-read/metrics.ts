import {
  createReadMetricsSink,
} from "@/features/canonical-read-platform";
import {
  KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
  type KnowledgeSilentDualReadCounterName,
  type KnowledgeSilentDualReadMetricTags,
  type KnowledgeSilentDualReadMetricsSink,
} from "./types";

const COUNTERS: readonly KnowledgeSilentDualReadCounterName[] = [
  "shadow_rollout_enabled_count",
  "shadow_rollout_disabled_count",
  "shadow_rollout_sampled_count",
  "shadow_rollout_skipped_count",
  "shadow_rollout_killswitch_count",
  "shadow_knowledge_eligible_count",
  "shadow_knowledge_executed_count",
  "shadow_knowledge_matched_count",
  "shadow_knowledge_partial_match_count",
  "shadow_knowledge_mismatch_count",
  "shadow_knowledge_memory_only_count",
  "shadow_knowledge_postgres_only_count",
  "shadow_knowledge_not_found_count",
  "shadow_knowledge_unavailable_count",
  "shadow_knowledge_invalid_input_count",
  "shadow_knowledge_tenant_mismatch_count",
  "shadow_knowledge_timeout_count",
  "shadow_knowledge_error_count",
] as const;

function sanitizeTags(tags: KnowledgeSilentDualReadMetricTags): void {
  void tags.environment;
  void tags.status;
  void tags.errorCategory;
  void tags.tenantCohort;
  if (tags.experimentVersion !== KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION) {
    return;
  }
}

export function createKnowledgeSilentDualReadMetricsSink(
  env: NodeJS.ProcessEnv = process.env,
): KnowledgeSilentDualReadMetricsSink {
  return createReadMetricsSink({
    counters: COUNTERS,
    env,
    sanitizeTags,
  });
}
