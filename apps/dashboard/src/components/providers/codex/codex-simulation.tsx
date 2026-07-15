import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { codexSimulationProfiles } from "@/features/providers/codex";

export function CodexSimulation() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Simulation Profiles</CardTitle><span className="text-xs text-fg-muted">{codexSimulationProfiles.length} deterministic fixtures</span></CardHeader>
      <CardContent className="space-y-2">
        {codexSimulationProfiles.map((profile) => (
          <div key={profile.capability} className="rounded-md border bg-surface-sunken p-3">
            <p className="text-sm font-medium text-fg">{profile.capability}</p>
            <p className="mt-1 text-xs text-fg-secondary">{profile.normalizedResponse.resultSummary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
