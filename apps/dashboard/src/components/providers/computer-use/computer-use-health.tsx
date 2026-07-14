import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computerUseProviderHealth } from "@/features/providers/computer-use";

export function ComputerUseHealth() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Provider Health</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="font-semibold text-fg">{computerUseProviderHealth.status}</p>
          <p className="mt-1">{computerUseProviderHealth.note}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs uppercase tracking-wider">Availability</p>
            <p className="mt-1 text-lg font-semibold text-fg">
              {computerUseProviderHealth.availability}%
            </p>
          </div>
          <div className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs uppercase tracking-wider">Latency</p>
            <p className="mt-1 text-lg font-semibold text-fg">
              {computerUseProviderHealth.latencyMs} ms
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
