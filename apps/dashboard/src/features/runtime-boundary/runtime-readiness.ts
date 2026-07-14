/*
 * runtime-readiness.ts — deterministic provider + runtime readiness. Offline:
 * providers are loaded/initialized/simulation-ready; live runtime is NOT
 * supported yet, so "runtime supported" is intentionally false.
 */

import { getCatalogEntry } from "@/features/provider-matrix";
import type { Invocation } from "@/features/provider-invocation";
import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type { ReadinessAssessment, ReadinessCheck } from "@/features/runtime-boundary/types";

export function assessReadiness(inv: Invocation, context: RuntimeContext): ReadinessAssessment {
  const entry = context.providerId ? getCatalogEntry(context.providerId) : undefined;
  const healthy = entry?.health.status === "Healthy" || entry?.health.status === "Degraded";
  const contractValid = inv.status === "Ready";

  const checks: ReadinessCheck[] = [
    { label: "Provider loaded", ready: Boolean(entry), note: entry ? "Catalog entry present." : "No provider." },
    { label: "Provider initialized", ready: Boolean(entry), note: "Deterministic offline initialization." },
    { label: "Provider healthy", ready: healthy, note: entry?.health.status ?? "Unknown" },
    { label: "Simulation available", ready: entry?.simulationSupport ?? false, note: "Simulation adapter present." },
    { label: "Configuration valid", ready: Boolean(entry), note: "Offline config schema satisfied." },
    { label: "Contract valid", ready: contractValid, note: contractValid ? "Invocation is Ready." : "Invocation not prepared." },
    { label: "Runtime supported", ready: false, note: "Live runtime disabled in this phase." },
  ];

  const readyCount = checks.filter((c) => c.ready).length;
  const score = Math.round((readyCount / checks.length) * 100);
  // "ready" for the boundary means everything except live-runtime support.
  const ready = checks.filter((c) => c.label !== "Runtime supported").every((c) => c.ready);

  return { checks, ready, score };
}
