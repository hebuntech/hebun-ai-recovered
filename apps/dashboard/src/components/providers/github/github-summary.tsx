import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { githubMetrics } from "@/features/providers/github";

export function GitHubSummary() {
  const items = [
    { label: "Provider Status", value: githubMetrics.status },
    { label: "Simulation Mode", value: githubMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capability Coverage", value: `${githubMetrics.capabilityCoverage}` },
    { label: "Conformance Status", value: `${githubMetrics.conformanceScore}` },
    { label: "Credential Status", value: githubMetrics.credentialStatus },
  ];

  return (
    <div className="col-span-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-fg-secondary">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-fg">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
