import { PlugZap } from "lucide-react";
import { InvocationPanel } from "@/components/provider-invocation/invocation-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { invocationMetrics } from "@/features/provider-invocation";

export default function ProviderInvocationPage() {
  return (
    <>
      <PageHeader
        title="Provider Invocation Contract"
        context="Routing decides which provider is used; the invocation contract defines how every provider is invoked. The universal invocation model — lifecycle, request, expected response, artifacts, retry, timeout, rollback, cancellation, telemetry, audit and events. Deterministic, explainable and offline."
        action={<Badge variant={invocationMetrics.badge}>Invocation {invocationMetrics.invocationHealth}%</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <PlugZap className="size-4 text-primary" />
        No real execution, no API calls, no SDKs, no credentials, no network, no runtime invocation.
        Contracts are prepared up to Ready and deferred to a future live phase.
      </div>

      <InvocationPanel />
    </>
  );
}
