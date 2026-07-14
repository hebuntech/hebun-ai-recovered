import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunicationCapabilities } from "@/components/providers/communication/communication-capabilities";
import { CommunicationEvents } from "@/components/providers/communication/communication-events";
import { CommunicationHealth } from "@/components/providers/communication/communication-health";
import { CommunicationSafety } from "@/components/providers/communication/communication-safety";
import { CommunicationSimulation } from "@/components/providers/communication/communication-simulation";
import { CommunicationSummary } from "@/components/providers/communication/communication-summary";
import { CommunicationTelemetry } from "@/components/providers/communication/communication-telemetry";
import {
  communicationConfig,
  communicationPrimarySimulationProfile,
  communicationProvider,
} from "@/features/providers/communication";

export function CommunicationPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <CommunicationSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Communication Provider Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Communication provider foundation defines how future email, calendar, messaging, meetings, reminders, and collaboration workflows fit into the Provider Framework. This phase is fully offline and deterministic: no Gmail, Calendar, Outlook, Slack, Teams, OAuth, credentials, or network access.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <CommunicationCapabilities />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <CommunicationHealth />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <CommunicationTelemetry />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Configuration Schema</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="font-semibold text-fg">{communicationProvider.metadata.name}</p>
              <p className="mt-1">{communicationProvider.metadata.description}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>Provider type: {communicationConfig.providerType}</p>
              <p className="mt-1">Default channel: {communicationConfig.defaultChannel}</p>
              <p className="mt-1">Credentials: {communicationConfig.credentialsPlaceholder}</p>
              <p className="mt-1">Feature flags: {communicationConfig.featureFlags.join(", ")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Normalization</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">Request Normalization</p>
              <p className="mt-1">{communicationPrimarySimulationProfile.normalizedRequest.payloadSummary}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {communicationPrimarySimulationProfile.normalizedRequest.constraints.join(" · ")}
              </p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">Response Normalization</p>
              <p className="mt-1">{communicationPrimarySimulationProfile.normalizedResponse.resultSummary}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">Error Normalization</p>
              <p className="mt-1">{communicationPrimarySimulationProfile.sampleFailure.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <CommunicationSimulation />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <CommunicationSafety />
      </div>

      <div className="col-span-12">
        <CommunicationEvents />
      </div>
    </div>
  );
}
