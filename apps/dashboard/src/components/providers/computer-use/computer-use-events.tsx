import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computerUseProviderEvents } from "@/features/providers/computer-use";

export function ComputerUseEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {computerUseProviderEvents.map((event) => (
          <div key={event.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-fg">{event.type}</p>
              <span className="text-xs text-fg-muted">{event.timestamp}</span>
            </div>
            <p className="mt-2 text-sm text-fg-secondary">{event.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
