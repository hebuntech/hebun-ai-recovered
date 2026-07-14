import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { communicationSafetyRules } from "@/features/providers/communication/simulation";

export function CommunicationSafety() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Safety Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {communicationSafetyRules.map((rule) => (
          <div key={rule.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="font-semibold text-fg">{rule.label}</p>
            <p className="mt-2 text-sm text-fg-secondary">{rule.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
