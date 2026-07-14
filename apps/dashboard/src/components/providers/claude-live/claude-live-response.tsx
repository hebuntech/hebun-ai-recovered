import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { claudeLiveRecord } from "@/features/providers/claude-live";

export function ClaudeLiveResponsePreview() {
  const response = claudeLiveRecord.response;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-fg-secondary">
        <div className="flex items-center gap-2">
          <Badge variant={claudeLiveRecord.badge}>{response.status}</Badge>
          <span>{response.mode}</span>
        </div>
        <p>{response.summary}</p>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs uppercase tracking-wider text-fg-secondary">Output</p>
          <p className="mt-2 text-fg">{response.output}</p>
        </div>
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs uppercase tracking-wider text-fg-secondary">Live Blocked Reasons</p>
          <div className="mt-2 flex flex-col gap-1">
            {response.liveBlockedReasons.map((reason) => (
              <p key={reason}>{reason}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
