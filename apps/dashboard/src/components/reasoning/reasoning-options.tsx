import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReasoningResult } from "@/features/reasoning";

export function ReasoningOptions({ result }: { result: ReasoningResult }) {
  const tradeoffById = new Map(result.tradeoffs.map((tradeoff) => [tradeoff.optionId, tradeoff]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Options</CardTitle>
        <span className="text-xs text-fg-muted">
          candidate paths ranked by trade-off scoring
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {result.candidateOptions.map((option) => {
          const tradeoff = tradeoffById.get(option.id);
          return (
            <div key={option.id} className="rounded-md border bg-surface-sunken p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-fg">{option.title}</p>
                <p className="text-sm text-fg-secondary">
                  total {tradeoff?.totalScore ?? "n/a"}
                </p>
              </div>
              <p className="mt-1 text-sm text-fg-secondary">{option.summary}</p>
              <p className="mt-2 text-xs text-fg-muted">{tradeoff?.summary}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
