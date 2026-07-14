import type { BadgeVariant } from "@/components/ui/badge";
import type {
  RegistryDefinition,
  RegistryRecordStatus,
  RegistryTrend,
} from "@/features/registries/types";

export const recordStatusVariant: Record<RegistryRecordStatus, BadgeVariant> = {
  active: "success",
  archived: "neutral",
  deprecated: "warning",
};

export function registryStatusVariant(
  status: RegistryDefinition["status"]
): BadgeVariant {
  if (status === "healthy") return "success";
  if (status === "attention") return "warning";
  return "error";
}

export function trendTone(trend: RegistryTrend): string {
  if (trend === "up") return "text-success";
  if (trend === "down") return "text-error";
  return "text-fg-muted";
}
