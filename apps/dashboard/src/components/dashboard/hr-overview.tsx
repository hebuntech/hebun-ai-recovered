import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { hrOverview as h } from "@/features/hr/mock";

export function HrOverview() {
  const metrics = [
    { label: "Open Positions", value: `${h.openPositions}`, intent: "flat" },
    { label: "Candidates", value: `${h.candidates}`, intent: "flat" },
    { label: "Active Interviews", value: `${h.activeInterviews}`, intent: "flat" },
    { label: "Onboarding Progress", value: `${h.onboardingProgress}%`, intent: "up" },
    { label: "Employee Satisfaction", value: `${h.employeeSatisfaction}%`, intent: "up" },
    { label: "Reviews Due", value: `${h.reviewsDue}`, intent: "flat" },
    { label: "Learning Progress", value: `${h.learningProgress}%`, intent: "up" },
    { label: "Retention Risk", value: `${h.retentionRisk}`, intent: "bad" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>HR Overview</CardTitle>
        <span className="text-xs text-fg-muted">HR Department</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              {m.label}
            </p>
            <p
              className={cn(
                "mt-1 text-xl font-bold tabular-nums",
                m.intent === "bad" && "text-error"
              )}
            >
              {m.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
