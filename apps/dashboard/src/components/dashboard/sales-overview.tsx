import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const metrics = [
  { label: "Qualified Leads", value: "34", note: "+12% this week", intent: "up" },
  { label: "Active Deals", value: "12", note: "3 in negotiation", intent: "flat" },
  { label: "Renewal Pipeline", value: "$48.2K", note: "5 due in 30 days", intent: "flat" },
  { label: "Customer Health", value: "92%", note: "2 accounts at risk", intent: "up" },
] as const;

export function SalesOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <span className="text-xs text-fg-muted">Sales Department</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              {m.label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{m.value}</p>
            <p
              className={cn(
                "mt-0.5 text-xs",
                m.intent === "up" ? "text-success" : "text-fg-muted"
              )}
            >
              {m.note}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
