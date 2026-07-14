import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { githubMetrics } from "@/features/providers/github";

export function GitHubWidget() {
  const tiles = [
    { label: "Status", value: githubMetrics.status },
    { label: "Simulation", value: githubMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capabilities", value: `${githubMetrics.capabilityCoverage}` },
    { label: "Conformance", value: `${githubMetrics.conformanceScore}` },
    { label: "Credentials", value: githubMetrics.credentialStatus },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="size-4 text-primary" />
          GitHub Provider
        </CardTitle>
        <span className="text-xs text-fg-muted">offline repository provider foundation in simulation mode</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {tile.label}
              </p>
              <p className="mt-1 text-sm font-bold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/providers/github"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open GitHub Provider
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
