import { validateAdapter } from "@/features/adapters/adapter-validator";
import type { ExecutionAdapter } from "@/features/adapters/types";

/*
 * adapter-inspector.ts — deep contract inspection for the audit.
 * Checks contract completeness, capability integrity and metadata quality.
 * Deterministic; no execution.
 */

const CONTRACT_METHODS = [
  "supports",
  "initialize",
  "validate",
  "prepare",
  "execute",
  "pause",
  "resume",
  "cancel",
  "rollback",
  "shutdown",
  "health",
  "telemetry",
] as const;

export interface ContractAuditResult {
  adapterId: string;
  complete: boolean;
  missingMethods: string[];
  missingMetadata: string[];
  duplicateCapabilities: string[];
  issues: string[];
  score: number; // 0–100
}

export function inspectAdapter(adapter: ExecutionAdapter): ContractAuditResult {
  const missingMethods = CONTRACT_METHODS.filter(
    (m) => typeof (adapter as unknown as Record<string, unknown>)[m] !== "function"
  );

  const missingMetadata: string[] = [];
  if (!adapter.metadata?.id) missingMetadata.push("id");
  if (!adapter.metadata?.name) missingMetadata.push("name");
  if (!adapter.metadata?.version) missingMetadata.push("version");
  if (!adapter.metadata?.vendor) missingMetadata.push("vendor");

  const seen = new Set<string>();
  const duplicateCapabilities: string[] = [];
  for (const cap of adapter.capabilities ?? []) {
    if (seen.has(cap.kind)) duplicateCapabilities.push(cap.kind);
    seen.add(cap.kind);
  }

  const validation = validateAdapter(adapter);
  const issues = [...validation.errors];
  if (!adapter.capabilities?.length) issues.push("No capabilities declared");

  const penalties =
    missingMethods.length * 8 +
    missingMetadata.length * 5 +
    duplicateCapabilities.length * 5 +
    issues.length * 4;
  const score = Math.max(0, 100 - penalties);

  return {
    adapterId: adapter.metadata?.id ?? "unknown",
    complete: missingMethods.length === 0 && missingMetadata.length === 0 && duplicateCapabilities.length === 0,
    missingMethods,
    missingMetadata,
    duplicateCapabilities,
    issues,
    score,
  };
}
