import { BrainCircuit } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CodexPanel } from "@/components/providers/codex/codex-panel";
import { Badge } from "@/components/ui/badge";
import { codexMetrics } from "@/features/providers/codex";

export default function CodexProviderPage() {
  return (
    <>
      <PageHeader
        title="Codex Provider Adapter Foundation"
        context="The deterministic, offline Codex provider foundation that defines provider metadata, capability mapping, configuration placeholders, normalization behavior, simulation profiles, health, telemetry, and safety boundaries for future developer workflow integration phases."
        action={<Badge variant={codexMetrics.healthBadge}>Conformance {codexMetrics.conformanceScore}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <BrainCircuit className="size-4 text-primary" />
        Simulation only. No real Codex, no OpenAI SDK, no network, no credentials, no shell execution, and no repository mutation.
      </div>

      <CodexPanel />
    </>
  );
}
