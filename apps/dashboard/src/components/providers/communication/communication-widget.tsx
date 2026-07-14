import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { communicationMetrics } from "@/features/providers/communication";

export function CommunicationWidget() {
  const tiles = [
    { label: "Status", value: communicationMetrics.status },
    { label: "Simulation", value: communicationMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capabilities", value: `${communicationMetrics.capabilityCoverage}` },
    { label: "Health", value: communicationMetrics.healthStatus },
    { label: "Safety", value: communicationMetrics.safetyStatus },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="size-4 text-primary" />
          Communication Provider
        </CardTitle>
        <span className="text-xs text-fg-muted">offline communication provider foundation in simulation mode</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{tile.label}</p>
              <p className="mt-1 text-sm font-bold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/providers/communication"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Communication Provider
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
