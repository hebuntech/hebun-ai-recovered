import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrowserCapabilities } from "@/components/providers/browser/browser-capabilities";
import { BrowserEvents } from "@/components/providers/browser/browser-events";
import { BrowserHealth } from "@/components/providers/browser/browser-health";
import { BrowserSimulation } from "@/components/providers/browser/browser-simulation";
import { BrowserSummary } from "@/components/providers/browser/browser-summary";
import { BrowserTelemetry } from "@/components/providers/browser/browser-telemetry";
import {
  browserConfig,
  browserPrimarySimulationProfile,
  browserProvider,
  browserSimulationProfiles,
} from "@/features/providers/browser";

export function BrowserPanel() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <BrowserSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Browser Provider Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The Browser provider foundation defines how a future web-navigation provider fits into the Provider Framework. This phase is fully offline and deterministic: no Playwright, no Puppeteer, no Selenium, no Browser Use, no browser process, no JavaScript execution, and no network access.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <BrowserCapabilities />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <BrowserHealth />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <BrowserTelemetry />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Configuration Schema</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="font-semibold text-fg">{browserProvider.metadata.name}</p>
              <p className="mt-1">{browserProvider.metadata.description}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>Provider type: {browserConfig.providerType}</p>
              <p className="mt-1">Default viewport: {browserConfig.defaultViewport}</p>
              <p className="mt-1">Credentials: {browserConfig.credentialsPlaceholder}</p>
              <p className="mt-1">Feature flags: {browserConfig.featureFlags.join(", ")}</p>
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
              <p className="mt-1">{browserPrimarySimulationProfile.normalizedRequest.payloadSummary}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {browserPrimarySimulationProfile.normalizedRequest.constraints.join(" · ")}
              </p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Response Normalization
              </p>
              <p className="mt-1">{browserPrimarySimulationProfile.normalizedResponse.resultSummary}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Error Normalization
              </p>
              <p className="mt-1">{browserPrimarySimulationProfile.sampleFailure.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <BrowserSimulation />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Safety Boundaries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>No Playwright, Puppeteer, Selenium, or Browser Use</p>
              <p className="mt-1">No browser process, JavaScript execution, or screenshots</p>
              <p className="mt-1">No network, website automation, or page interaction</p>
              <p className="mt-1">No external APIs or live page extraction</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p>
                {browserSimulationProfiles.length} simulation profiles provide deterministic fixtures for future browser provider integration phases.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <BrowserEvents />
      </div>
    </div>
  );
}
