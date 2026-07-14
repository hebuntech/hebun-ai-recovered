/*
 * capability-matcher.ts — deterministic capability matching using ONLY the
 * Provider Capability Matrix. No provider-specific logic. A provider matches a
 * request when it supports each required capability at primary or secondary
 * level; primary support weighs double.
 */

import { supportOf, PROVIDER_NAMES } from "@/features/provider-matrix";
import type { MatrixCapability, ProviderId } from "@/features/provider-matrix";

export interface CapabilityMatch {
  providerId: ProviderId;
  name: string;
  matched: MatrixCapability[];
  missing: MatrixCapability[];
  score: number;
  fullMatch: boolean;
}

/** capability score 0–100; primary=2, secondary=1, unsupported=0, over max. */
export function matchCapabilities(
  providerId: ProviderId,
  required: MatrixCapability[]
): CapabilityMatch {
  const matched: MatrixCapability[] = [];
  const missing: MatrixCapability[] = [];
  let points = 0;

  for (const cap of required) {
    const support = supportOf(providerId, cap);
    if (support === "primary") {
      points += 2;
      matched.push(cap);
    } else if (support === "secondary") {
      points += 1;
      matched.push(cap);
    } else {
      missing.push(cap);
    }
  }

  const max = required.length * 2;
  const score = max === 0 ? 0 : Math.round((points / max) * 100);

  return {
    providerId,
    name: PROVIDER_NAMES[providerId],
    matched,
    missing,
    score,
    fullMatch: missing.length === 0 && required.length > 0,
  };
}
