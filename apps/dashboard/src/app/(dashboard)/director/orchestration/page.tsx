import { Network } from "lucide-react";
import { OrchestrationPanel } from "@/components/orchestration/orchestration-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { orchestrationMetrics } from "@/features/orchestration";

export default function OrchestrationPage() {
  return (
    <>
      <PageHeader
        title="Orchestration Engine"
        context="The deterministic coordination layer that converts execution-ready plans into explainable owner assignments, handoffs, approval gates, fallback paths, and orchestration blueprints before any future execution engine acts."
        action={<Badge variant={orchestrationMetrics.healthBadge}>Health {orchestrationMetrics.orchestrationHealth}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Network className="size-4 text-primary" />
        Deterministic, traceable, and auditable. No execution, no external calls, no LLMs.
      </div>

      <OrchestrationPanel />
    </>
  );
}
