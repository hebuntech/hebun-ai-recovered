import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { communicationSimulationProfiles } from "@/features/providers/communication";

export function CommunicationSimulation() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Simulation Profiles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {communicationSimulationProfiles.map((profile) => (
          <div key={profile.capability} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-fg">{profile.capability}</p>
              <span className="text-xs text-fg-muted">{profile.expectedTelemetry.averageDurationMs} ms</span>
            </div>
            <p className="mt-2 text-sm text-fg-secondary">{profile.sampleResponse.deliveryPlan.summary}</p>
            <p className="mt-2 text-xs text-fg-muted">{profile.normalizedRequest.constraints.join(" · ")}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
