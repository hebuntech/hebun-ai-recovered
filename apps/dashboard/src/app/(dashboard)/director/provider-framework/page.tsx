import { Layers } from "lucide-react";
import { ProviderFrameworkPanel } from "@/components/provider-framework/provider-framework-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { frameworkMetrics } from "@/features/provider-framework";

export default function ProviderFrameworkPage() {
  return (
    <>
      <PageHeader
        title="Provider Adapter Framework"
        context="The reusable framework every future provider adapter implements — provider contracts, capability mapping, configuration schema, request/response/error normalization, simulation and conformance testing. Deterministic and provider-independent."
        action={<Badge variant={frameworkMetrics.healthBadge}>Conformance {frameworkMetrics.conformanceScore}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Layers className="size-4 text-primary" />
        No real providers, no credentials, no network, no LLMs. Only the deterministic reference provider exists.
      </div>

      <ProviderFrameworkPanel />
    </>
  );
}
