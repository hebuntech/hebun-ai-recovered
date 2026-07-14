import { Badge, type BadgeVariant } from "@/components/ui/badge";

export type DataState = "LIVE" | "SIMULATION" | "MOCK" | "DERIVED" | "PLACEHOLDER" | "DRY RUN";

const stateVariant: Record<DataState, BadgeVariant> = {
  LIVE: "success",
  SIMULATION: "warning",
  MOCK: "neutral",
  DERIVED: "info",
  PLACEHOLDER: "error",
  "DRY RUN": "primary",
};

export function DataStateBadge({ state }: { state: DataState }) {
  return (
    <Badge variant={stateVariant[state]} className="shrink-0">
      {state}
    </Badge>
  );
}
