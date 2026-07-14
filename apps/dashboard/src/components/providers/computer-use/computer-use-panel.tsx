import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComputerUseCapabilities } from "@/components/providers/computer-use/computer-use-capabilities";
import { ComputerUseEvents } from "@/components/providers/computer-use/computer-use-events";
import { ComputerUseHealth } from "@/components/providers/computer-use/computer-use-health";
import { ComputerUseSafety } from "@/components/providers/computer-use/computer-use-safety";
import { ComputerUseSimulation } from "@/components/providers/computer-use/computer-use-simulation";
import { ComputerUseSummary } from "@/components/providers/computer-use/computer-use-summary";
import { ComputerUseTelemetry } from "@/components/providers/computer-use/computer-use-telemetry";
import {
  computerUseConfig,
  computerUsePrimarySimulationProfile,
  computerUseProvider,
  computerUseSimulationProfiles,
} from "@/features/providers/computer-use";

export function ComputerUsePanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <ComputerUseSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Computer Use Provider Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Computer Use provider foundation defines how a future desktop-interaction provider fits into the Provider Framework. This phase is fully offline and deterministic: no OS control, no keyboard or mouse input, no shell execution, no screenshots, no filesystem access, and no network access.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <ComputerUseCapabilities />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ComputerUseHealth />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ComputerUseTelemetry />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Configuration Schema</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="font-semibold text-fg">{computerUseProvider.metadata.name}</p>
              <p className="mt-1">{computerUseProvider.metadata.description}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>Provider type: {computerUseConfig.providerType}</p>
              <p className="mt-1">Default environment: {computerUseConfig.defaultEnvironment}</p>
              <p className="mt-1">Credentials: {computerUseConfig.credentialsPlaceholder}</p>
              <p className="mt-1">Feature flags: {computerUseConfig.featureFlags.join(", ")}</p>
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
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Request Normalization
              </p>
              <p className="mt-1">{computerUsePrimarySimulationProfile.normalizedRequest.payloadSummary}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {computerUsePrimarySimulationProfile.normalizedRequest.constraints.join(" · ")}
              </p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Response Normalization
              </p>
              <p className="mt-1">{computerUsePrimarySimulationProfile.normalizedResponse.resultSummary}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Error Normalization
              </p>
              <p className="mt-1">{computerUsePrimarySimulationProfile.sampleFailure.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <ComputerUseSimulation />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <ComputerUseSafety />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Safety Boundaries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>No OS control, mouse movement, or keyboard input</p>
              <p className="mt-1">No application launch, shell commands, or tool execution</p>
              <p className="mt-1">No screenshots, clipboard access, or filesystem access</p>
              <p className="mt-1">No MCP, external APIs, or network communication</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>
                {computerUseSimulationProfiles.length} simulation profiles provide deterministic fixtures for future computer-use provider integration phases.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <ComputerUseEvents />
      </div>
    </div>
  );
}
