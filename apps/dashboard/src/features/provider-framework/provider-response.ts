import type { AdapterError, AdapterEvent, ExecutionArtifact, ExecutionTelemetry } from "@/features/adapters";
import type {
  NormalizedMetrics,
  NormalizedResponse,
  NormalizedStatus,
} from "@/features/provider-framework/types";

/*
 * provider-response.ts — builds normalized responses. Every provider returns
 * the same response shape; the Execution Engine never special-cases a provider.
 */
export function buildNormalizedResponse(params: {
  requestId: string;
  status: NormalizedStatus;
  resultSummary: string;
  metrics: NormalizedMetrics;
  telemetry: ExecutionTelemetry;
  artifacts?: ExecutionArtifact[];
  warnings?: string[];
  errors?: AdapterError[];
  events?: AdapterEvent[];
}): NormalizedResponse {
  return {
    requestId: params.requestId,
    status: params.status,
    resultSummary: params.resultSummary,
    artifacts: params.artifacts ?? [],
    metrics: params.metrics,
    telemetry: params.telemetry,
    warnings: params.warnings ?? [],
    errors: params.errors ?? [],
    events: params.events ?? [],
  };
}
