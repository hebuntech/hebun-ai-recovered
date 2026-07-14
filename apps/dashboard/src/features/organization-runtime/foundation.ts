import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import type { OrganizationRuntimeSnapshot } from "./types";

export function getOrganizationRuntimeSnapshot(): OrganizationRuntimeSnapshot {
  ensureRuntimeProjectionRegistry();
  return runtimeProjectionRegistry.ensure<OrganizationRuntimeSnapshot>(
    "organization-runtime",
  ).data;
}
