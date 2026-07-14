import { Boxes } from "lucide-react";
import { AdapterPanel } from "@/components/adapters/adapter-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { adapterMetrics } from "@/features/adapters";

export default function AdaptersPage() {
  return (
    <>
      <PageHeader
        title="Execution Adapter SDK"
        context="The provider-independent adapter architecture that future execution providers will implement. Registration, discovery, capability matching, lifecycle, validation, health, telemetry, an event bridge, and a deterministic simulation mode — with no external services, no LLMs, and no provider-specific logic."
        action={<Badge variant={adapterMetrics.healthBadge}>{adapterMetrics.registered} registered</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Boxes className="size-4 text-primary" />
        Deterministic and provider-independent. Only the built-in Simulation Adapter exists — no Claude, Codex, GitHub, Browser, Slack, Gmail or Computer Use adapters.
      </div>

      <AdapterPanel />
    </>
  );
}
