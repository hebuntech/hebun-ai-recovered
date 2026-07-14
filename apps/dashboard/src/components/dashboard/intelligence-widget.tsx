import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { intelligenceScores as s, patterns } from "@/features/intelligence/mock";

export function IntelligenceWidget() {
  const tiles = [
    { label: "Org Intelligence", value: `${s.organizationIntelligence}` },
    { label: "Recommendations", value: `${s.recommendationQueue}` },
    { label: "Learning Score", value: `${s.learning}` },
    { label: "Patterns", value: `${patterns.length}` },
    { label: "Weekly Improvement", value: `+${s.weeklyImprovement}%` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="size-4 text-primary" />
          Intelligence
        </CardTitle>
        <span className="text-xs text-fg-muted">organizational learning</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/intelligence"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Intelligence Center
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
