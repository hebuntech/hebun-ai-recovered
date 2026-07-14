import { BrainCircuit } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ClaudeLivePanel } from "@/components/providers/claude-live/claude-live-panel";
import { Badge } from "@/components/ui/badge";
import { claudeLiveMetrics } from "@/features/providers/claude-live";

export default function ClaudeLiveProviderPage() {
  return (
    <>
      <PageHeader
        title="Claude Live Integration Foundation"
        context="The first gated dry-run-first live integration path for Claude. Provider Routing, Provider Invocation, Runtime Boundary, and Runtime Activation remain mandatory. Live execution stays blocked by default and simulation fallback remains required."
        action={<Badge variant={claudeLiveMetrics.healthBadge}>Health {claudeLiveMetrics.healthScore}%</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <BrainCircuit className="size-4 text-primary" />
        Dry Run is the default mode. No uncontrolled Claude API path exists, no credentials are stored, and no live invocation is performed unless every gate is explicitly satisfied.
      </div>

      <ClaudeLivePanel />
    </>
  );
}
