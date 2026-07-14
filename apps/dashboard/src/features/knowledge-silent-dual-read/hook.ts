import type { CanonicalReadServices } from "@/features/canonical-read";
import { runKnowledgeShadowRead } from "@/features/knowledge-shadow-read";
import type { KnowledgeNodeRecord } from "@/features/knowledge-crud/types";
import type { KnowledgeReadResult } from "@/features/knowledge-read-facade";
import { readCanonicalReadConfigFromEnv } from "@/features/canonical-read/config";
import { createCanonicalReadServices } from "@/features/canonical-read";
import { createKnowledgeSilentDualReadMetricsSink } from "./metrics";
import { categorizeKnowledgeSilentDualReadError } from "./redaction";
import { evaluateKnowledgeSilentDualReadRollout } from "./rollout";
import { readKnowledgeSilentDualReadConfigFromEnv } from "./config";
import {
  KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
  type KnowledgeSilentDualReadHookObservation,
  type KnowledgeSilentDualReadMetricsSink,
} from "./types";

function now(): number {
  const perf = (globalThis as { performance?: { now(): number } }).performance;
  return perf ? perf.now() : Date.now();
}

function sampleKeyForKnowledgeRequest(result: KnowledgeReadResult): string {
  return [
    "knowledge-shadow",
    result.request.tenantId,
    result.request.factKey,
    result.request.domainKey ?? result.node?.logicalIdentity.domainKey ?? "",
    result.request.knowledgeScope ?? result.node?.logicalIdentity.knowledgeScope ?? "",
  ].join(":");
}

function metricTags(
  env: NodeJS.ProcessEnv,
  extras: {
    readonly status?: string;
    readonly errorCategory?: string;
  } = {},
) {
  return {
    environment: env.NODE_ENV ?? "development",
    experimentVersion: KNOWLEDGE_SILENT_DUAL_READ_EXPERIMENT_VERSION,
    status: extras.status,
    errorCategory: extras.errorCategory,
  };
}

function toShadowInput(result: KnowledgeReadResult):
  | {
      readonly tenantId: string;
      readonly factKey: string;
      readonly domainKey: string;
      readonly knowledgeScope: "company-wide" | "department" | "domain";
    }
  | undefined {
  const domainKey =
    result.request.domainKey ?? result.node?.logicalIdentity.domainKey;
  const knowledgeScope =
    result.request.knowledgeScope ?? result.node?.logicalIdentity.knowledgeScope;

  if (!domainKey || !knowledgeScope) {
    return undefined;
  }

  return {
    tenantId: result.request.tenantId,
    factKey: result.request.factKey,
    domainKey,
    knowledgeScope,
  };
}

function timeoutAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("knowledge-silent-dual-read-timeout")), ms);
  });
}

let sharedMetricsSink: KnowledgeSilentDualReadMetricsSink | undefined;

export function getKnowledgeSilentDualReadMetricsSink(
  env: NodeJS.ProcessEnv = process.env,
): KnowledgeSilentDualReadMetricsSink {
  if (!sharedMetricsSink) {
    sharedMetricsSink = createKnowledgeSilentDualReadMetricsSink(env);
  }
  return sharedMetricsSink;
}

export interface KnowledgeSilentDualReadHookOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly memoryNodes?: readonly KnowledgeNodeRecord[];
  readonly metricsSink?: KnowledgeSilentDualReadMetricsSink;
  readonly canonicalReadServices?: CanonicalReadServices;
}

export async function runKnowledgeSilentDualReadHookForFacade(
  result: KnowledgeReadResult,
  options: KnowledgeSilentDualReadHookOptions = {},
): Promise<KnowledgeSilentDualReadHookObservation> {
  if (result.status !== "found" || !result.node) {
    return {
      executed: false,
      timedOut: false,
    };
  }

  const env = options.env ?? process.env;
  const metricsSink =
    options.metricsSink ?? getKnowledgeSilentDualReadMetricsSink(env);
  const config = readKnowledgeSilentDualReadConfigFromEnv(env);
  const ownServices = !options.canonicalReadServices;
  const services =
    options.canonicalReadServices ??
    createCanonicalReadServices(readCanonicalReadConfigFromEnv(env));

  const shadowInput = toShadowInput(result);
  if (!shadowInput) {
    if (ownServices) {
      await services.dispose();
    }
    return {
      executed: false,
      timedOut: false,
    };
  }

  try {
    const rollout = evaluateKnowledgeSilentDualReadRollout({
      config,
      tenantId: result.request.tenantId,
      requestSampleKey: sampleKeyForKnowledgeRequest(result),
    });

    if (rollout.reason === "kill-switch-active") {
      metricsSink.increment("shadow_rollout_killswitch_count", metricTags(env));
    }
    metricsSink.increment(
      rollout.shouldRun
        ? "shadow_rollout_enabled_count"
        : "shadow_rollout_disabled_count",
      metricTags(env, { status: rollout.reason }),
    );
    metricsSink.increment(
      rollout.shouldRun
        ? "shadow_rollout_sampled_count"
        : "shadow_rollout_skipped_count",
      metricTags(env, { status: rollout.reason }),
    );

    if (!rollout.shouldRun) {
      return {
        executed: false,
        timedOut: false,
      };
    }

    const availability = await services.availability();
    if (!availability.available) {
      metricsSink.increment(
        "shadow_knowledge_unavailable_count",
        metricTags(env, {
          status: "unavailable",
          errorCategory: "unavailable",
        }),
      );
      return {
        executed: false,
        timedOut: false,
        errorCategory: "unavailable",
      };
    }

    metricsSink.increment(
      "shadow_knowledge_eligible_count",
      metricTags(env),
    );
    metricsSink.increment(
      "shadow_knowledge_executed_count",
      metricTags(env),
    );

    const startedAt = now();
    const shadowResult = await Promise.race([
      runKnowledgeShadowRead(shadowInput, {
        env,
        canonicalReadServices: services,
        memoryNodes: options.memoryNodes,
      }),
      timeoutAfter(config.timeoutMs),
    ]);

    const durationMs = now() - startedAt;
    metricsSink.observeLatency(
      durationMs,
      metricTags(env, { status: shadowResult.status }),
    );

    switch (shadowResult.status) {
      case "matched":
        metricsSink.increment(
          "shadow_knowledge_matched_count",
          metricTags(env, { status: shadowResult.status }),
        );
        break;
      case "partial-match":
        metricsSink.increment(
          "shadow_knowledge_partial_match_count",
          metricTags(env, { status: shadowResult.status }),
        );
        break;
      case "mismatch":
        metricsSink.increment(
          "shadow_knowledge_mismatch_count",
          metricTags(env, { status: shadowResult.status }),
        );
        break;
      case "memory-only":
        metricsSink.increment(
          "shadow_knowledge_memory_only_count",
          metricTags(env, { status: shadowResult.status }),
        );
        break;
      case "postgres-only":
        metricsSink.increment(
          "shadow_knowledge_postgres_only_count",
          metricTags(env, { status: shadowResult.status }),
        );
        break;
      case "not-found":
        metricsSink.increment(
          "shadow_knowledge_not_found_count",
          metricTags(env, { status: shadowResult.status }),
        );
        break;
      case "unavailable":
        metricsSink.increment(
          "shadow_knowledge_unavailable_count",
          metricTags(env, {
            status: shadowResult.status,
            errorCategory: "unavailable",
          }),
        );
        break;
      case "invalid-input":
        metricsSink.increment(
          "shadow_knowledge_invalid_input_count",
          metricTags(env, { status: shadowResult.status }),
        );
        break;
      case "tenant-mismatch":
        metricsSink.increment(
          "shadow_knowledge_tenant_mismatch_count",
          metricTags(env, { status: shadowResult.status }),
        );
        break;
    }

    return {
      executed: true,
      status: shadowResult.status,
      timedOut: false,
    };
  } catch (error) {
    const errorCategory = categorizeKnowledgeSilentDualReadError(error);

    if (errorCategory === "timeout") {
      metricsSink.increment(
        "shadow_knowledge_timeout_count",
        metricTags(env, { errorCategory }),
      );
      return {
        executed: true,
        timedOut: true,
        errorCategory,
      };
    }

    metricsSink.increment(
      "shadow_knowledge_error_count",
      metricTags(env, { errorCategory }),
    );
    return {
      executed: true,
      timedOut: false,
      errorCategory,
    };
  } finally {
    if (ownServices) {
      await services.dispose();
    }
  }
}

export function scheduleKnowledgeSilentDualReadHookForFacade(
  result: KnowledgeReadResult,
  options: KnowledgeSilentDualReadHookOptions = {},
): void {
  void runKnowledgeSilentDualReadHookForFacade(result, options).catch(() => {
    // Shadow execution is fully failure-isolated from the runtime return path.
  });
}
