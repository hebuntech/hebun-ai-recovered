import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reasoningResults } from "@/features/reasoning";

export function ReasoningHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reasoning History</CardTitle>
        <span className="text-xs text-fg-muted">
          previous deterministic reasoning sessions
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {reasoningResults.map((result) => (
          <div key={result.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{result.context.title}</p>
              <p className="text-sm text-fg-secondary">{result.confidenceScore}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">
              {result.recommendation.summary}
            </p>
            <p className="mt-2 text-xs text-fg-muted">
              {result.timestamp.slice(0, 10)} · {result.riskLevel} risk
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
