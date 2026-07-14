/*
 * runtime-credentials.ts — deterministic credential assessment. PLACEHOLDERS
 * ONLY. Never loads credentials, never reads env, never calls secret managers.
 * Offline modes need no credentials; live modes would need real ones, which are
 * absent by design — so live is never permitted here.
 */

import { getCatalogEntry } from "@/features/provider-matrix";
import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type { CredentialAssessment } from "@/features/runtime-boundary/types";

export function assessCredentials(context: RuntimeContext): CredentialAssessment {
  // Simulation / Dry Run / Read Only / Planning require no real credentials.
  if (context.runtimeMode === "Simulation" || context.runtimeMode === "Read Only" || context.runtimeMode === "Dry Run") {
    return { state: "Not Required", required: false, note: "Offline mode needs no credentials." };
  }

  if (context.runtimeMode === "Blocked") {
    return { state: "Not Required", required: false, note: "Blocked invocation; no credentials evaluated." };
  }

  // Approval Required / Future Live would need credentials; only placeholders exist.
  const entry = context.providerId ? getCatalogEntry(context.providerId) : undefined;
  const placeholder = entry?.credentialStatus === "placeholder";
  return {
    state: placeholder ? "Placeholder" : "Missing",
    required: true,
    note: placeholder
      ? "Provider declares a credential placeholder only. No real key is stored or loaded."
      : "No credentials configured. Live runtime not permitted.",
  };
}
