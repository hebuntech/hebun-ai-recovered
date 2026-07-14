import {
  getLatestReadRouterObservation,
  runReadRouter,
  type ReadRouterObservation,
  type ReadRouterShadowPlan,
} from "@/features/canonical-read-platform";
import type { CanonicalReadServices } from "@/features/canonical-read";
import {
  readKnowledgeSilentDualReadConfigFromEnv,
  evaluateKnowledgeSilentDualReadRollout,
  createKnowledgeSilentDualReadMetricsSink,
  runKnowledgeSilentDualReadHookForFacade,
  type KnowledgeSilentDualReadMetricsSink,
} from "@/features/knowledge-silent-dual-read";
import type { KnowledgeNodeRecord } from "@/features/knowledge-crud/types";
import type { KnowledgeReadRequest, KnowledgeReadResult } from "./types";

function sampleKeyForKnowledgeRequest(result: KnowledgeReadResult): string {
  return [
    "knowledge-shadow",
    result.request.tenantId,
    result.request.factKey,
    result.request.domainKey ?? result.node?.logicalIdentity.domainKey ?? "",
    result.request.knowledgeScope ?? result.node?.logicalIdentity.knowledgeScope ?? "",
  ].join(":");
}

function shouldAttemptShadow(result: KnowledgeReadResult): boolean {
  return result.status === "found" && Boolean(result.node);
}

function planKnowledgeShadow(
  result: KnowledgeReadResult,
  env: NodeJS.ProcessEnv,
): ReadRouterShadowPlan {
  if (!shouldAttemptShadow(result)) {
    return {
      routingDecision: "authoritative-only",
      rolloutDecision: "not-found",
      invokeShadowParticipant: false,
      shadowProvider: "postgres",
    };
  }

  const config = readKnowledgeSilentDualReadConfigFromEnv(env);
  const rollout = evaluateKnowledgeSilentDualReadRollout({
    config,
    tenantId: result.request.tenantId,
    requestSampleKey: sampleKeyForKnowledgeRequest(result),
  });

  return {
    routingDecision: rollout.shouldRun
      ? "authoritative-with-shadow"
      : "authoritative-only",
    rolloutDecision: rollout.reason ?? "shadow-enabled",
    invokeShadowParticipant: true,
    shadowProvider: "postgres",
  };
}

function describeShadowObservation(
  observation: Awaited<ReturnType<typeof runKnowledgeSilentDualReadHookForFacade>>,
): string {
  if (observation.timedOut) return "timeout";
  if (observation.status) return observation.status;
  if (observation.errorCategory) return observation.errorCategory;
  return observation.executed ? "shadow-complete" : "shadow-skipped";
}

export interface RouteKnowledgeReadOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly memoryNodes?: readonly KnowledgeNodeRecord[];
  readonly metricsSink?: KnowledgeSilentDualReadMetricsSink;
  readonly canonicalReadServices?: CanonicalReadServices;
  readonly executeAuthoritative: () => Promise<KnowledgeReadResult>;
}

export async function routeKnowledgeRead(
  options: RouteKnowledgeReadOptions,
): Promise<KnowledgeReadResult> {
  const env = options.env ?? process.env;
  const metricsSink =
    options.metricsSink ?? createKnowledgeSilentDualReadMetricsSink(env);

  return runReadRouter({
    domain: "knowledge",
    authoritativeProvider: "memory",
    executeAuthoritative: options.executeAuthoritative,
    planShadow: (result) => planKnowledgeShadow(result, env),
    invokeShadowParticipant: (result, handlers) => {
      if (!shouldAttemptShadow(result)) {
        return;
      }

      void runKnowledgeSilentDualReadHookForFacade(result, {
        env,
        memoryNodes: options.memoryNodes,
        metricsSink,
        canonicalReadServices: options.canonicalReadServices,
      })
        .then(handlers.complete)
        .catch(handlers.fail);
    },
    describeShadowObservation,
    describeShadowError: (error) =>
      error instanceof Error ? error.message.toLowerCase() : "shadow-error",
  });
}

export function getLatestKnowledgeReadRoutingObservation():
  | ReadRouterObservation
  | undefined {
  return getLatestReadRouterObservation("knowledge");
}

export function summarizePlannedKnowledgeReadRouting(input: {
  readonly request?: KnowledgeReadRequest;
  readonly env?: NodeJS.ProcessEnv;
}): {
  readonly authoritativeProvider: string;
  readonly shadowProvider: string;
  readonly routingDecision: "authoritative-only" | "authoritative-with-shadow";
  readonly rolloutDecision?: string;
} {
  const env = input.env ?? process.env;
  if (!input.request) {
    return {
      authoritativeProvider: "memory",
      shadowProvider: "postgres",
      routingDecision: "authoritative-only",
      rolloutDecision: "missing-request",
    };
  }

  const config = readKnowledgeSilentDualReadConfigFromEnv(env);
  const rollout = evaluateKnowledgeSilentDualReadRollout({
    config,
    tenantId: input.request.tenantId,
    requestSampleKey: [
      "knowledge-shadow",
      input.request.tenantId,
      input.request.factKey,
      input.request.domainKey ?? "",
      input.request.knowledgeScope ?? "",
    ].join(":"),
  });

  return {
    authoritativeProvider: "memory",
    shadowProvider: "postgres",
    routingDecision: rollout.shouldRun
      ? "authoritative-with-shadow"
      : "authoritative-only",
    rolloutDecision: rollout.reason ?? "shadow-enabled",
  };
}
