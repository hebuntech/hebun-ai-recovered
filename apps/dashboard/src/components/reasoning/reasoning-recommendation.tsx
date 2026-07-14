import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReasoningResult } from "@/features/reasoning";

export function ReasoningRecommendation({ result }: { result: ReasoningResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendation</CardTitle>
        <span className="text-xs text-fg-muted">
          selected option and next deterministic step
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-sm font-semibold text-fg">{result.recommendation.title}</p>
          <p className="mt-1 text-sm text-fg-secondary">{result.recommendation.summary}</p>
          <p className="mt-3 text-sm text-fg">
            <span className="font-medium">Next step: </span>
            {result.recommendation.nextStep}
          </p>
          <p className="mt-2 text-sm text-fg-secondary">{result.recommendation.whyNow}</p>
        </div>
      </CardContent>
    </Card>
  );
}
