/*
 * runtime-context.ts — resolves the runtime mode for an invocation and snapshots
 * the boundary context. Provider metadata is referenced from the matrix catalog.
 */

import { getCatalogEntry } from "@/features/provider-matrix";
import type { Invocation } from "@/features/provider-invocation";
import type { ProviderId } from "@/features/provider-matrix";
import type { ProviderTypeKind } from "@/features/provider-framework";
import type { RuntimeMode } from "@/features/runtime-boundary/types";

export interface RuntimeContext {
  invocationId: string;
  requestId: string;
  providerId: ProviderId | null;
  providerType: ProviderTypeKind | null;
  runtimeMode: RuntimeMode;
  simulation: boolean;
  confidence: number;
}

/** map invocation execution mode → runtime boundary mode (offline-safe). */
export function resolveRuntimeMode(inv: Invocation): RuntimeMode {
  if (inv.status === "Failed" || !inv.providerId) return "Blocked";
  switch (inv.executionMode) {
    case "Simulation":
      return "Simulation";
    case "Dry Run":
      return "Dry Run";
    case "Read Only":
      return "Read Only";
    case "Planning":
      return "Simulation";
    case "Approval Required":
      return "Approval Required";
    case "Future Live":
      return "Future Live";
    default:
      return "Simulation";
  }
}

export function buildRuntimeContext(inv: Invocation): RuntimeContext {
  const entry = inv.providerId ? getCatalogEntry(inv.providerId) : undefined;
  return {
    invocationId: inv.id,
    requestId: inv.requestId,
    providerId: inv.providerId,
    providerType: entry?.providerType ?? null,
    runtimeMode: resolveRuntimeMode(inv),
    simulation: inv.simulation,
    confidence: inv.confidence,
  };
}
