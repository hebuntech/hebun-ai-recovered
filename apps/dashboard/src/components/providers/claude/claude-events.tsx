import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claudeProviderEvents } from "@/features/providers/claude";

export function ClaudeEvents() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Provider Events</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {claudeProviderEvents.map((event) => (
          <div key={event.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{event.type}</p>
              <p className="text-xs text-fg-muted">{event.timestamp}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{event.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
