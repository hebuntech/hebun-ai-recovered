import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computerUseSafetyRules } from "@/features/providers/computer-use/simulation";

export function ComputerUseSafety() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Safety Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {computerUseSafetyRules.map((rule) => (
          <div key={rule.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="font-semibold text-fg">{rule.label}</p>
            <p className="mt-2 text-sm text-fg-secondary">{rule.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
