import { GitBranch } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GitHubPanel } from "@/components/providers/github/github-panel";
import { Badge } from "@/components/ui/badge";
import { githubMetrics } from "@/features/providers/github";

export default function GitHubProviderPage() {
  return (
    <>
      <PageHeader
        title="GitHub Provider Adapter Foundation"
        context="The deterministic, offline GitHub provider foundation that defines provider metadata, capability mapping, configuration placeholders, normalization behavior, simulation profiles, health, telemetry, and safety boundaries for future repository workflow integration phases."
        action={<Badge variant={githubMetrics.healthBadge}>Conformance {githubMetrics.conformanceScore}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <GitBranch className="size-4 text-primary" />
        Simulation only. No real GitHub API, no Octokit, no network, no credentials, no Git commands, and no repository mutation.
      </div>

      <GitHubPanel />
    </>
  );
}
