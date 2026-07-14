"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auditEvents } from "@/features/governance/audit";

export function AuditTimeline() {
  const [query, setQuery] = useState("");
  const filtered = auditEvents.filter((event) => {
    const haystack = `${event.scope} ${event.source} ${event.actor} ${event.message}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Timeline</CardTitle>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search audit history"
          className="h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong"
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {filtered.map((event) => (
          <div key={event.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-fg">{event.source}</p>
                <p className="text-sm text-fg-secondary">{event.message}</p>
              </div>
              <span className="text-xs text-fg-muted">{event.timestamp}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-fg-muted">
              <span>{event.scope}</span>
              <span>·</span>
              <span>{event.actor}</span>
              <span>·</span>
              <span>{event.type}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
