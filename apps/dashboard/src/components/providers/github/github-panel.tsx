import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubCapabilities } from "@/components/providers/github/github-capabilities";
import { GitHubEvents } from "@/components/providers/github/github-events";
import { GitHubHealth } from "@/components/providers/github/github-health";
import { GitHubSimulation } from "@/components/providers/github/github-simulation";
import { GitHubSummary } from "@/components/providers/github/github-summary";
import { GitHubTelemetry } from "@/components/providers/github/github-telemetry";
import {
  githubConfig,
  githubPrimarySimulationProfile,
  githubProvider,
  githubSimulationProfiles,
} from "@/features/providers/github";

export function GitHubPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <GitHubSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Provider Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The GitHub provider foundation defines how a future repository workflow provider fits into the Provider Framework. This phase is fully offline and deterministic: no GitHub API, no Octokit, no credentials, no env access, no Git commands, and no repository mutation.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <GitHubCapabilities />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <GitHubHealth />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <GitHubTelemetry />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Configuration Schema</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="font-semibold text-fg">{githubProvider.metadata.name}</p>
              <p className="mt-1">{githubProvider.metadata.description}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>Provider type: {githubConfig.providerType}</p>
              <p className="mt-1">Default repository: {githubConfig.defaultRepository}</p>
              <p className="mt-1">Credentials: {githubConfig.credentialsPlaceholder}</p>
              <p className="mt-1">Feature flags: {githubConfig.featureFlags.join(", ")}</p>
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
              <p className="mt-1">{githubPrimarySimulationProfile.normalizedRequest.payloadSummary}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {githubPrimarySimulationProfile.normalizedRequest.constraints.join(" · ")}
              </p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Response Normalization
              </p>
              <p className="mt-1">{githubPrimarySimulationProfile.normalizedResponse.resultSummary}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Error Normalization
              </p>
              <p className="mt-1">{githubPrimarySimulationProfile.sampleFailure.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <GitHubSimulation />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Safety Boundaries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>No real GitHub API or Octokit usage</p>
              <p className="mt-1">No credentials, env access, or secrets</p>
              <p className="mt-1">No Git commands or workflow dispatch</p>
              <p className="mt-1">No repository mutation, PR creation, or issue creation</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>
                {githubSimulationProfiles.length} simulation profiles provide deterministic fixtures for future repository provider integration phases.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <GitHubEvents />
      </div>
    </div>
  );
}
