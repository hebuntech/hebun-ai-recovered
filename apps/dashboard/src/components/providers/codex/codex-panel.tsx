import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodexCapabilities } from "@/components/providers/codex/codex-capabilities";
import { CodexEvents } from "@/components/providers/codex/codex-events";
import { CodexHealth } from "@/components/providers/codex/codex-health";
import { CodexSimulation } from "@/components/providers/codex/codex-simulation";
import { CodexSummary } from "@/components/providers/codex/codex-summary";
import { CodexTelemetry } from "@/components/providers/codex/codex-telemetry";
import {
  codexConfig,
  codexProvider,
  codexPrimarySimulationProfile,
  codexSimulationProfiles,
} from "@/features/providers/codex";

export function CodexPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <CodexSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Codex Provider Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Codex provider foundation defines how a future developer-workflow provider fits into the Provider Framework. This phase is fully offline and deterministic: no Codex calls, no OpenAI SDK, no credentials, no shell execution, no repository mutation, and no real code execution.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <CodexCapabilities />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <CodexHealth />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <CodexTelemetry />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Configuration Schema</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="font-semibold text-fg">{codexProvider.metadata.name}</p>
              <p className="mt-1">{codexProvider.metadata.description}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>Provider type: {codexConfig.providerType}</p>
              <p className="mt-1">Default model: {codexConfig.defaultModel}</p>
              <p className="mt-1">Credentials: {codexConfig.credentialsPlaceholder}</p>
              <p className="mt-1">Feature flags: {codexConfig.featureFlags.join(", ")}</p>
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
              <p className="mt-1">{codexPrimarySimulationProfile.normalizedRequest.payloadSummary}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {codexPrimarySimulationProfile.normalizedRequest.constraints.join(" · ")}
              </p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">Response Normalization</p>
              <p className="mt-1">{codexPrimarySimulationProfile.normalizedResponse.resultSummary}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">Error Normalization</p>
              <p className="mt-1">{codexPrimarySimulationProfile.sampleFailure.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <CodexSimulation />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Safety Boundaries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>No real Codex or OpenAI API calls</p>
              <p className="mt-1">No credentials, env access, or secrets</p>
              <p className="mt-1">No shell execution from the provider</p>
              <p className="mt-1">No repository mutation or live code execution</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>{codexSimulationProfiles.length} simulation profiles provide deterministic fixtures for future provider integration phases.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <CodexEvents />
      </div>
    </div>
  );
}
