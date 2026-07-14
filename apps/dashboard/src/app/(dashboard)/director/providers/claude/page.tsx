import { Brain } from "lucide-react";
import { ClaudePanel } from "@/components/providers/claude/claude-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { claudeMetrics } from "@/features/providers/claude";

export default function ClaudeProviderPage() {
  return (
    <>
      <PageHeader
        title="Claude Provider Adapter Foundation"
        context="The deterministic, offline Claude provider foundation that defines provider contracts, capability mapping, health, telemetry, and simulation behavior for future Claude integration phases without using any API, credentials, SDK, network, or real model execution."
        action={<Badge variant={claudeMetrics.healthBadge}>Conformance {claudeMetrics.conformanceScore}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Brain className="size-4 text-primary" />
        Simulation only. No real Claude API, no Anthropic SDK, no network, no credentials, and no live inference.
      </div>

      <ClaudePanel />
    </>
  );
}
