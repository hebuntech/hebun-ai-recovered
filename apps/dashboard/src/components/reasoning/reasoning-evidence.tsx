import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReasoningResult } from "@/features/reasoning";

export function ReasoningEvidence({ result }: { result: ReasoningResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collected Evidence</CardTitle>
        <span className="text-xs text-fg-muted">
          registry, intelligence, memory, and graph evidence used by the engine
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {result.evidence.map((item) => (
          <div key={item.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{item.title}</p>
              <p className="text-sm text-fg-secondary">weight {item.weight}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{item.detail}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {item.sourceType} · {item.registryIds.length} registries · {item.memoryIds.length} memories
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
