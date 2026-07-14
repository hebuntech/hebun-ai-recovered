import { Cpu } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ComputerUsePanel } from "@/components/providers/computer-use/computer-use-panel";
import { Badge } from "@/components/ui/badge";
import { computerUseMetrics } from "@/features/providers/computer-use";

export default function ComputerUseProviderPage() {
  return (
    <>
      <PageHeader
        title="Computer Use Provider Adapter Foundation"
        context="The deterministic, offline Computer Use provider foundation that defines provider metadata, capability mapping, configuration placeholders, normalization behavior, simulation profiles, safety model, health, telemetry, and safety boundaries for future desktop workflow integration phases."
        action={<Badge variant={computerUseMetrics.healthBadge}>Conformance {computerUseMetrics.conformanceScore}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Cpu className="size-4 text-primary" />
        Simulation only. No OS control, no keyboard or mouse input, no shell commands, no screenshots, and no network access.
      </div>

      <ComputerUsePanel />
    </>
  );
}
