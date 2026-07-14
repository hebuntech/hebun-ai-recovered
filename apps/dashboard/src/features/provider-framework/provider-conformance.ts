import { validateProvider } from "@/features/provider-framework/provider-validator";
import { simulationProfileFor } from "@/features/provider-framework/provider-simulation";
import { defaultConfigFor } from "@/features/provider-framework/provider-config";
import type { BadgeVariant } from "@/components/ui/badge";
import type {
  ConformanceCheck,
  ConformanceResult,
  ProviderAdapter,
} from "@/features/provider-framework/types";

/*
 * provider-conformance.ts — deterministic conformance suite. Confirms a
 * ProviderAdapter fully implements the framework: contract, metadata,
 * capabilities, config schema, normalization, simulation and health.
 */
export function runConformance(provider: ProviderAdapter): ConformanceResult {
  const validation = validateProvider(provider);
  const config = defaultConfigFor(provider.providerType, provider.metadata.id, provider.supportedCapabilities);
  const profile = simulationProfileFor(provider.providerType);
  const health = provider.health();
  const configValidation = provider.validate(config);
  const req = provider.normalizeRequest(profile.sampleRequest);
  const res = provider.normalizeResponse(profile.sampleResponse);
  const err = provider.normalizeError(profile.sampleFailure);

  const checks: ConformanceCheck[] = [
    { id: "contract", label: "Contract completeness", passed: validation.valid, detail: validation.summary },
    { id: "metadata", label: "Metadata present", passed: Boolean(provider.metadata.id && provider.metadata.version), detail: provider.metadata.name },
    { id: "capabilities", label: "Capabilities declared", passed: provider.supportedCapabilities.length > 0, detail: `${provider.supportedCapabilities.length} capabilities` },
    { id: "config", label: "Configuration schema valid", passed: provider.configurationSchema.length > 0 && configValidation.valid, detail: configValidation.summary },
    { id: "normalize-request", label: "Request normalization", passed: req.requestId === profile.sampleRequest.requestId, detail: "request shape preserved" },
    { id: "normalize-response", label: "Response normalization", passed: res.status === profile.sampleResponse.status, detail: "response shape preserved" },
    { id: "normalize-error", label: "Error normalization", passed: err.code === profile.sampleFailure.code, detail: "error mapped to SDK code" },
    { id: "simulation", label: "Simulation support", passed: provider.simulationSupport && profile.deterministic, detail: "deterministic simulation" },
    { id: "health", label: "Health reporting", passed: health.status === "Healthy" || health.status === "Degraded", detail: health.note },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const score = Math.round((passed / total) * 100);
  const verdict = score === 100 ? "pass" : score >= 80 ? "attention" : "fail";
  const verdictBadge: BadgeVariant = verdict === "pass" ? "success" : verdict === "attention" ? "warning" : "error";

  return { providerId: provider.metadata.id, checks, passed, total, score, verdict, verdictBadge };
}
