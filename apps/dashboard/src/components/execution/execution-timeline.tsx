"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { timelineEvents, type ExecTimelineEvent } from "@/features/execution/mock";
import type { EventSeverity } from "@/types";

type GroupBy = "execution" | "department" | "status" | "severity";

const groups: { id: GroupBy; label: string }[] = [
  { id: "execution", label: "Execution" },
  { id: "department", label: "Department" },
  { id: "status", label: "Status" },
  { id: "severity", label: "Severity" },
];

const severityDot: Record<EventSeverity, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

function keyFor(e: ExecTimelineEvent, by: GroupBy): string {
  if (by === "execution") return e.execution;
  if (by === "department") return e.department;
  if (by === "status") return e.status;
  return e.severity;
}

export function ExecutionTimeline() {
  const [by, setBy] = useState<GroupBy>("execution");

  const grouped = timelineEvents.reduce<Record<string, ExecTimelineEvent[]>>((acc, e) => {
    const k = keyFor(e, by);
    (acc[k] ??= []).push(e);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Timeline</CardTitle>
        <div className="flex flex-wrap gap-1">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setBy(g.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-(--dur-fast)",
                by === g.id ? "bg-primary-subtle text-primary" : "text-fg-secondary hover:bg-surface-raised"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {Object.entries(grouped).map(([group, events]) => (
          <div key={group}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">{group}</h3>
            <ul className="flex flex-col">
              {events.map((e, i) => (
                <li key={e.id} className="relative flex gap-4 pb-4 last:pb-0">
                  {i < events.length - 1 && <span className="absolute top-4 left-1 -ml-px h-full w-px bg-border" />}
                  <span className={cn("relative mt-1.5 size-2 shrink-0 rounded-full", severityDot[e.severity])} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="truncate text-sm font-medium text-fg">
                        {e.source}
                        <span className="ml-2 font-mono text-xs font-normal text-fg-muted">{e.type}</span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-fg-muted">{e.timestamp}</span>
                    </div>
                    <p className="truncate text-sm text-fg-secondary">{e.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
