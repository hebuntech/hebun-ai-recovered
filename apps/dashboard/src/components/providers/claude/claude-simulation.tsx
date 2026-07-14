import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claudeSimulationProfile } from "@/features/providers/claude";

export function ClaudeSimulation() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Simulation Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Sample Request
          </p>
          <p className="mt-1 text-sm font-semibold text-fg">{claudeSimulationProfile.sampleRequest.prompt}</p>
          <p className="mt-2 text-sm text-fg-secondary">
            Output format: {claudeSimulationProfile.sampleRequest.outputFormat} · Tools: {claudeSimulationProfile.sampleRequest.tools.join(", ")}
          </p>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Simulated Response
          </p>
          <p className="mt-1 text-sm text-fg-secondary">{claudeSimulationProfile.sampleResponse.content}</p>
          <p className="mt-2 text-xs text-fg-muted">
            Finish reason: {claudeSimulationProfile.sampleResponse.finishReason} · Tokens: {claudeSimulationProfile.sampleResponse.usage.totalTokens}
          </p>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Failure Sample
          </p>
          <p className="mt-1 text-sm text-fg-secondary">{claudeSimulationProfile.sampleFailure.message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
