import { Globe } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { BrowserPanel } from "@/components/providers/browser/browser-panel";
import { Badge } from "@/components/ui/badge";
import { browserMetrics } from "@/features/providers/browser";

export default function BrowserProviderPage() {
  return (
    <>
      <PageHeader
        title="Browser Provider Adapter Foundation"
        context="The deterministic, offline Browser provider foundation that defines provider metadata, capability mapping, configuration placeholders, normalization behavior, simulation profiles, health, telemetry, and safety boundaries for future web workflow integration phases."
        action={<Badge variant={browserMetrics.healthBadge}>Conformance {browserMetrics.conformanceScore}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Globe className="size-4 text-primary" />
        Simulation only. No Playwright, no Puppeteer, no Selenium, no Browser Use, no browser process, and no network access.
      </div>

      <BrowserPanel />
    </>
  );
}
