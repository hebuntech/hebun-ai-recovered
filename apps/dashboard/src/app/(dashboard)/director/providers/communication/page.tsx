import { MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CommunicationPanel } from "@/components/providers/communication/communication-panel";
import { Badge } from "@/components/ui/badge";
import { communicationMetrics } from "@/features/providers/communication";

export default function CommunicationProviderPage() {
  return (
    <>
      <PageHeader
        title="Communication Provider Foundation"
        context="The deterministic, offline Communication provider foundation that defines provider metadata, capability mapping, configuration placeholders, normalization behavior, simulation profiles, safety model, health, telemetry, and collaboration-planning boundaries for future communication integrations."
        action={<Badge variant={communicationMetrics.healthBadge}>Conformance {communicationMetrics.conformanceScore}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <MessagesSquare className="size-4 text-primary" />
        Simulation only. No Gmail, Calendar, Outlook, Slack, Teams, OAuth, credentials, or network access.
      </div>

      <CommunicationPanel />
    </>
  );
}
