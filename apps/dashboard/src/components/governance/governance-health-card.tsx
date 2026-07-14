import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GovernanceHealthCard({ health }: { health: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          Governance Health
        </CardTitle>
        <span className="text-xs text-fg-muted">trust, compliance and control</span>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-bold tabular-nums">{health}</p>
          <p className="text-sm text-fg-secondary">Healthy governance posture with active oversight.</p>
        </div>
      </CardContent>
    </Card>
  );
}
