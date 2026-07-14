import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExplainabilityRecord } from "@/features/governance/types";

export function ExplainabilityCard({ record }: { record: ExplainabilityRecord }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-fg">{record.title}</h3>
            <p className="text-sm text-fg-secondary">{record.decision}</p>
          </div>
          <Badge variant="info">{record.confidence}%</Badge>
        </div>
        <p className="text-sm text-fg-secondary">{record.reasoningSummary}</p>
        <p className="text-sm text-fg-secondary">{record.businessExplanation}</p>
        <div className="flex flex-wrap gap-2">
          {record.evidence.map((item) => (
            <Badge key={item} variant="neutral">{item}</Badge>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 text-xs text-fg-muted">
          <span>{record.owner}</span>
          <span>·</span>
          <span>{record.executionId}</span>
          <span>·</span>
          <span>{record.recommendationId}</span>
        </div>
      </CardContent>
    </Card>
  );
}
