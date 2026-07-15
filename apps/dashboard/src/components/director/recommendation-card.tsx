import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/features/director/mock";

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const statusVariant = rec.approvalStatus === "approved" ? "success" : rec.approvalStatus === "rejected" ? "error" : "warning";
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{rec.title}</CardTitle>
        <Badge variant={statusVariant}>{rec.approvalStatus}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-fg-secondary">{rec.businessImpact}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Confidence</p>
            <p className="mt-1 font-semibold tabular-nums">{rec.confidence}%</p>
          </div>
          <div className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Priority</p>
            <p className="mt-1 font-semibold capitalize">{rec.priority}</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-fg-muted">Estimated impact</p>
          <p className="mt-1 text-sm font-medium text-fg">{rec.estimatedRoi}</p>
          <p className="mt-1 text-xs text-fg-muted">{rec.departments.join(" · ")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
