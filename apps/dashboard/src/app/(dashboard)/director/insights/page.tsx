import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InsightCard } from "@/components/director/insight-card";
import { insights, executiveSummary } from "@/features/director/mock";

export default function ExecutiveInsightsPage() {
  return (
    <>
      <PageHeader
        title="Executive Insights"
        context="Organizational Intelligence — opportunities, risks and where to look."
        action={<Badge variant="info">Org Intelligence</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <Card>
            <CardContent className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-fg">Weekly Executive Summary</h3>
                <p className="mt-1 text-sm text-fg-secondary">{executiveSummary}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {insights.map((i) => (
          <div key={i.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <InsightCard insight={i} />
          </div>
        ))}
      </div>
    </>
  );
}
