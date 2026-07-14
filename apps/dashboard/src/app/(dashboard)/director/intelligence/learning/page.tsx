import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningPipeline } from "@/components/intelligence/learning-pipeline";
import { improvementVariant } from "@/components/intelligence/intelligence-tokens";
import {
  experienceSummary,
  learningSummary,
  improvementHistory,
} from "@/features/intelligence/mock";

export default function LearningCenterPage() {
  return (
    <>
      <PageHeader
        title="Learning Center"
        context="Experience, lessons, experiments and continuous improvement."
        action={<Badge variant="primary">{learningSummary.adopted} adopted</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Summaries */}
        <div className="col-span-6 sm:col-span-3"><StatCard label="Experiences" value={`${experienceSummary.total}`} caption={`+${experienceSummary.thisWeek} this week`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Lessons" value={`${experienceSummary.lessons}`} caption="captured" /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Experiments" value={`${learningSummary.experiments}`} caption={`${learningSummary.abTests} A/B tests`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Adopted / Rejected" value={`${learningSummary.adopted}/${learningSummary.rejected}`} caption={`${learningSummary.rolledBack} rolled back`} /></div>

        {/* Pipeline */}
        <div className="col-span-12 xl:col-span-6">
          <LearningPipeline />
        </div>

        {/* Improvement history */}
        <div className="col-span-12 xl:col-span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Improvement History</CardTitle>
              <span className="text-xs text-fg-muted tabular-nums">{improvementHistory.length}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {improvementHistory.map((im) => (
                <div key={im.id} className="flex items-start justify-between gap-3 rounded-md border bg-surface-sunken p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">{im.title}</p>
                    <p className="text-xs text-fg-secondary">{im.impact}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={improvementVariant[im.status]}>{im.status.replace("_", " ")}</Badge>
                    <span className="text-xs text-fg-muted tabular-nums">{im.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
