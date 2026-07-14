import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaudeCapabilities } from "@/components/providers/claude/claude-capabilities";
import { ClaudeEvents } from "@/components/providers/claude/claude-events";
import { ClaudeHealth } from "@/components/providers/claude/claude-health";
import { ClaudeSimulation } from "@/components/providers/claude/claude-simulation";
import { ClaudeSummary } from "@/components/providers/claude/claude-summary";
import { ClaudeTelemetry } from "@/components/providers/claude/claude-telemetry";
import { claudeConfig, claudeProvider, claudeSimulationProfile } from "@/features/providers/claude";

export function ClaudePanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <ClaudeSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Claude Provider Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Claude provider foundation defines how a future Claude integration will fit into the Provider Framework and Execution Adapter SDK. This phase is fully offline and deterministic: no Claude API, no credentials, no SDK, no network, and no real model execution.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <ClaudeCapabilities />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <ClaudeHealth />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ClaudeTelemetry />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ClaudeEvents />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <ClaudeSimulation />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Provider Contract</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="font-semibold text-fg">{claudeProvider.metadata.name}</p>
              <p className="mt-1">{claudeProvider.metadata.description}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Supported Modes
              </p>
              <p className="mt-1">{claudeProvider.supportedExecutionModes.join(", ")}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Configuration Posture
              </p>
              <p className="mt-1">Model: {claudeConfig.defaultModel}</p>
              <p className="mt-1">Credentials: {claudeConfig.credentialsPlaceholder}</p>
              <p className="mt-1">Sample normalized request: {claudeSimulationProfile.normalizedRequest.payloadSummary}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
