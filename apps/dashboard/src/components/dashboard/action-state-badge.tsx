import { Badge, type BadgeVariant } from "@/components/ui/badge";

export type ActionState = "simulation" | "comingSoon" | "opensPage" | "disabled";

const stateConfig: Record<ActionState, { label: string; variant: BadgeVariant }> = {
  simulation: { label: "Simulation", variant: "warning" },
  comingSoon: { label: "Coming Soon", variant: "neutral" },
  opensPage: { label: "Opens Page", variant: "info" },
  disabled: { label: "Disabled", variant: "neutral" },
};

export function ActionStateBadge({ state }: { state: ActionState }) {
  const config = stateConfig[state];

  return (
    <Badge variant={config.variant} className="shrink-0">
      {config.label}
    </Badge>
  );
}
