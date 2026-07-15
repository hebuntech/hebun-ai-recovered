import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adapterEvents } from "@/features/adapters";

export function AdapterEventsCard() {
  return (
    <Card>
      <CardHeader><CardTitle>Adapter Events</CardTitle><span className="text-xs text-fg-muted">{adapterEvents.length} events</span></CardHeader>
      <CardContent className="space-y-2">
        {adapterEvents.slice(0, 8).map((event, index) => (
          <div key={`${event.type}-${event.timestamp}-${index}`} className="rounded-md border bg-surface-sunken p-3">
            <p className="text-sm font-medium text-fg">{event.type}</p>
            <p className="mt-1 text-xs text-fg-secondary">{event.summary}</p>
            <p className="mt-1 text-xs text-fg-muted">{event.timestamp}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
