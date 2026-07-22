"use client";

import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionShell } from "@/components/director-dashboard/section-shell";
import type { RecordDetailView } from "@/features/director-dashboard-navigation";

export function RecordDetailPanel({ detail, onBackToList, onBackToDashboard }: {
  readonly detail: RecordDetailView;
  readonly onBackToList: () => void;
  readonly onBackToDashboard: () => void;
}) {
  return (
    <SectionShell
      title={detail.displayName}
      description={`${detail.category} record from the current dashboard snapshot.`}
      eyebrow="Record Detail"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBackToList}>
            <ArrowLeft className="size-4" /> Back to {detail.category}
          </Button>
          <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
            Back to dashboard
          </Button>
          <Badge variant="neutral">{detail.status}</Badge>
          <Badge variant={detail.snapshotFreshness === "fresh" ? "success" : "neutral"}>
            Snapshot {detail.snapshotFreshness}
          </Badge>
          <Badge variant="neutral">{detail.evidenceCount} evidence</Badge>
        </div>

        <dl className="grid gap-x-6 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-border py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-fg-muted">Record ID</dt>
            <dd className="min-w-0 truncate text-sm text-fg">{detail.recordId}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-border py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-fg-muted">Category</dt>
            <dd className="min-w-0 truncate text-sm text-fg">{detail.category}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-border py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-fg-muted">Description</dt>
            <dd className={`min-w-0 truncate text-sm ${detail.descriptionAvailable ? "text-fg" : "text-fg-muted"}`}>
              {detail.description}
            </dd>
          </div>
          {detail.fields.map((entry) => (
            <div key={entry.key} className="flex items-baseline justify-between gap-3 border-b border-border py-2">
              <dt className="text-xs uppercase tracking-[0.12em] text-fg-muted">{entry.label}</dt>
              <dd className={`min-w-0 truncate text-sm ${entry.available ? "text-fg" : "text-fg-muted"}`}>
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="text-xs text-fg-muted">
          This view is read-only and belongs to one immutable snapshot. Refresh the dashboard to read newer state.
        </p>
      </div>
    </SectionShell>
  );
}
