/*
 * invocation-artifacts.ts — deterministic artifact contracts. Maps matched
 * capabilities to the artifact kinds a provider is expected to produce. These
 * are contracts only — no real files are created.
 */

import type { MatrixCapability } from "@/features/provider-matrix";
import type { InvocationArtifact, InvocationArtifactKind } from "@/features/provider-invocation/types";

const artifactMeta: Record<InvocationArtifactKind, string> = {
  Text: "Free-form textual output.",
  "Structured Output": "Schema-shaped structured result.",
  Plan: "Ordered plan of steps.",
  Patch: "Proposed code change set.",
  Report: "Human-readable summary report.",
  Diff: "Before/after difference.",
  Metrics: "Numeric execution metrics.",
  Logs: "Ordered execution log lines.",
  Evidence: "Screenshots or captured evidence.",
  Attachments: "Auxiliary attached files.",
};

const capabilityArtifacts: Record<string, InvocationArtifactKind[]> = {
  Reasoning: ["Text", "Plan", "Report"],
  Planning: ["Plan", "Structured Output", "Report"],
  "Code Generation": ["Patch", "Diff", "Text"],
  Repository: ["Patch", "Diff", "Report"],
  Review: ["Report", "Structured Output"],
  Browser: ["Evidence", "Structured Output", "Logs"],
  Search: ["Structured Output", "Text"],
  Desktop: ["Evidence", "Logs"],
  Communication: ["Text", "Attachments", "Report"],
  Execution: ["Logs", "Metrics", "Report"],
  "Knowledge Retrieval": ["Structured Output", "Text"],
  "Human Approval": ["Report", "Evidence"],
  Simulation: ["Metrics", "Logs"],
  "Future Live": ["Metrics", "Logs"],
};

export function artifactsFor(capabilities: MatrixCapability[]): InvocationArtifact[] {
  const kinds = new Set<InvocationArtifactKind>();
  for (const cap of capabilities) {
    for (const kind of capabilityArtifacts[cap] ?? ["Text"]) kinds.add(kind);
  }
  // Every invocation always emits deterministic Metrics + Logs contracts.
  kinds.add("Metrics");
  kinds.add("Logs");

  return [...kinds].map((kind) => ({
    kind,
    label: kind,
    description: artifactMeta[kind],
    deterministic: true,
  }));
}
