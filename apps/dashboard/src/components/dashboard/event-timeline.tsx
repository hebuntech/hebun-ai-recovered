import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SystemEvent, EventSeverity } from "@/types";

const severityDot: Record<EventSeverity, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

interface EventTimelineProps {
  events: SystemEvent[];
  title?: string;
}

export function EventTimeline({ events, title = "Today's Events" }: EventTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Live
        </span>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {events.map((event, i) => (
            <li key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
              {i < events.length - 1 && (
                <span className="absolute top-4 left-1 -ml-px h-full w-px bg-border" />
              )}
              <span
                className={cn(
                  "relative mt-1.5 size-2 shrink-0 rounded-full",
                  severityDot[event.severity]
                )}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="truncate text-sm font-medium text-fg">
                    {event.source}
                    <span className="ml-2 font-mono text-xs font-normal text-fg-muted">
                      {event.type}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-fg-muted">{event.timestamp}</span>
                </div>
                <p className="truncate text-sm text-fg-secondary">{event.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
