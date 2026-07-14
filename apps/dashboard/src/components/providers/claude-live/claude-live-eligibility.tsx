import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { claudeLiveRecord } from "@/features/providers/claude-live";

export function ClaudeLiveEligibilityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Eligibility</CardTitle>
        <span className="text-xs text-fg-muted">strict runtime, activation, credential, policy, and audit gates</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={claudeLiveRecord.badge}>{claudeLiveRecord.eligibility.mode}</Badge>
          <Badge variant={claudeLiveRecord.eligibility.liveEligible ? "success" : "error"}>
            {claudeLiveRecord.eligibility.liveEligible ? "eligible" : "blocked"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {claudeLiveRecord.eligibility.checks.map((check) => (
            <div key={check.label} className="rounded-md border bg-surface-sunken p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-fg">
                {check.passed ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <X className="size-4 text-error" />
                )}
                {check.label}
              </div>
              <p className="mt-1 text-xs text-fg-secondary">{check.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
