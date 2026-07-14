import { Power } from "lucide-react";
import { ActivationPanel } from "@/components/runtime-activation/activation-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { activationMetrics } from "@/features/runtime-activation";

export default function RuntimeActivationPage() {
  return (
    <>
      <PageHeader
        title="Live Runtime Activation Framework"
        context="The activation control layer that determines whether a provider runtime may remain in Simulation, Dry Run, Read Only, or become structurally ready for future live promotion. Deterministic, explainable, provider-independent and offline."
        action={<Badge variant={activationMetrics.badge}>Health {activationMetrics.activationHealth}%</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Power className="size-4 text-primary" />
        No provider integrations, no credentials, no secret access, no network, no live execution. Activation
        decisions are computed from existing runtime-boundary and provider metadata only.
      </div>

      <ActivationPanel />
    </>
  );
}
