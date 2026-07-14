import type { BadgeVariant } from "@/components/ui/badge";
import { buildClaudeLiveAudit } from "@/features/providers/claude-live/claude-live-audit";
import { buildClaudeLiveDryRun } from "@/features/providers/claude-live/claude-live-dry-run";
import { evaluateClaudeLiveEligibility, getClaudeLiveReferenceChain } from "@/features/providers/claude-live/claude-live-eligibility";
import { normalizeClaudeLiveRequest, normalizeClaudeLiveResponse } from "@/features/providers/claude-live/claude-live-normalization";
import { buildClaudeLiveRequest } from "@/features/providers/claude-live/claude-live-request";
import { buildClaudeLiveResponse } from "@/features/providers/claude-live/claude-live-response";
import { buildClaudeLiveSimulationFallback } from "@/features/providers/claude-live/claude-live-simulation-fallback";
import type { ClaudeLiveRecord } from "@/features/providers/claude-live/types";

function badgeFor(status: ClaudeLiveRecord["response"]["status"]): BadgeVariant {
  return status === "dry-run" ? "warning" : "error";
}

export function buildClaudeLiveRecord(): ClaudeLiveRecord {
  const chain = getClaudeLiveReferenceChain();
  const request = normalizeClaudeLiveRequest(buildClaudeLiveRequest(chain));
  const eligibility = evaluateClaudeLiveEligibility();
  const dryRun = buildClaudeLiveDryRun(request, eligibility);
  const simulationFallback = buildClaudeLiveSimulationFallback(request);
  const audit = buildClaudeLiveAudit(request, eligibility);
  const response = normalizeClaudeLiveResponse(
    buildClaudeLiveResponse({
      id: `claude-live-response-${chain.requestId ?? "summarization"}`,
      eligibility,
      dryRun,
      simulationFallback,
      audit,
    })
  );

  return {
    id: `claude-live-${chain.requestId ?? "summarization"}`,
    capability: "summarization",
    chain,
    request,
    eligibility,
    dryRun,
    simulationFallback,
    response,
    warnings: response.warnings,
    badge: badgeFor(response.status),
  };
}

export const claudeLiveRecord = buildClaudeLiveRecord();
