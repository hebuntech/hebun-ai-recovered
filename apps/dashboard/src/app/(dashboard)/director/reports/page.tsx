import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BadgeVariant } from "@/components/ui/badge";
import { reports, type ExecutiveReport } from "@/features/director/mock";

const statusVariant: Record<ExecutiveReport["status"], BadgeVariant> = {
  ready: "success",
  generating: "warning",
  scheduled: "info",
};

export default function ExecutiveReportsPage() {
  return (
    <>
      <PageHeader
        title="Executive Reports"
        context="Daily to annual, board and investor summaries. Export is mock."
        action={<Badge variant="primary">{reports.length} reports</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        {reports.map((r) => (
          <div key={r.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <FileText className="size-5" />
                  </span>
                  <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-fg">{r.name}</h3>
                  <p className="text-xs text-fg-muted">{r.period}</p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-fg-muted">Generated {r.generated}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    title="Report export is mock — dispatches a report.export command once the Command Bus is live"
                  >
                    <Download className="size-3.5" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
