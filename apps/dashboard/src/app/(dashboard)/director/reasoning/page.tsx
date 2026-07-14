import { Zap } from "lucide-react";
import { ReasoningPanel } from "@/components/reasoning/reasoning-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { reasoningMetrics } from "@/features/reasoning";

export default function ReasoningPage() {
  return (
    <>
      <PageHeader
        title="Reasoning Engine"
        context="The deterministic cognitive layer that evaluates evidence, constraints, goals, options, trade-offs, confidence, and explanation before any future execution system acts."
        action={<Badge variant={reasoningMetrics.healthBadge}>Health {reasoningMetrics.health}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Zap className="size-4 text-primary" />
        Deterministic, traceable, and explainable. No LLM calls, no execution, no orchestration.
      </div>

      <ReasoningPanel />
    </>
  );
}
