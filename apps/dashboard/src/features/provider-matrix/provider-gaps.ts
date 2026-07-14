/*
 * provider-gaps.ts — deterministic gap analysis. Two kinds of gap:
 *  1. In-matrix gaps: capability columns with no primary owner (partial) or no
 *     provider at all (missing).
 *  2. Future-domain gaps: business domains with no provider yet — flagged as
 *     "Future Provider Required".
 */

import {
  MATRIX_CAPABILITIES,
  PROVIDER_NAMES,
  providersFor,
} from "@/features/provider-matrix/capability-matrix";
import type { CapabilityGap, FutureProviderGap } from "@/features/provider-matrix/types";

export const capabilityGaps: CapabilityGap[] = MATRIX_CAPABILITIES.map((capability) => {
  const primary = providersFor(capability, "primary");
  const secondary = providersFor(capability, "secondary");
  const providerCount = primary.length + secondary.length;

  if (primary.length > 0) {
    return {
      capability,
      status: "covered",
      providerCount,
      note: `Primary: ${primary.map((p) => PROVIDER_NAMES[p]).join(", ")}.`,
    };
  }
  if (secondary.length > 0) {
    return {
      capability,
      status: "partial",
      providerCount,
      note: `No primary owner. Secondary only: ${secondary.map((p) => PROVIDER_NAMES[p]).join(", ")}.`,
    };
  }
  return {
    capability,
    status: "missing",
    providerCount: 0,
    note: `No provider supports ${capability}.`,
  };
});

/** Business domains that currently have no provider — future providers required. */
const futureDomains = [
  "Payments",
  "CRM",
  "ERP",
  "Storage",
  "Analytics",
  "Monitoring",
  "Identity",
  "Billing",
  "Maps",
  "Video",
  "Voice",
  "Document AI",
  "OCR",
  "Database",
];

export const futureProviders: FutureProviderGap[] = futureDomains.map((domain) => ({
  domain,
  status: "Future Provider Required",
  note: `${domain} has no provider in the network yet.`,
}));

export const missingCapabilityCount = capabilityGaps.filter((g) => g.status === "missing").length;
export const partialCapabilityCount = capabilityGaps.filter((g) => g.status === "partial").length;
