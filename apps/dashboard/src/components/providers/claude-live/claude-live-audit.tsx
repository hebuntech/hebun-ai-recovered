import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claudeLiveRecord } from "@/features/providers/claude-live";

export function ClaudeLiveAudit() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        {claudeLiveRecord.response.audit.map((record) => (
          <div key={`${record.step}-${record.detail}`} className="rounded-md border bg-surface-sunken p-3 text-sm">
            <p className="font-medium text-fg">{record.step}</p>
            <p className="mt-1 text-fg-secondary">{record.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
