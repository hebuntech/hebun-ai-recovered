import assert from "node:assert/strict";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import type { OrganizationRuntimeSnapshot } from "@/features/organization-runtime/types";

async function main(): Promise<void> {
  ensureRuntimeProjectionRegistry();

  const organization =
    runtimeProjectionRegistry.getSnapshot<OrganizationRuntimeSnapshot>(
      "organization-runtime",
    );

  assert.ok(organization, "organization projection must be registered");
  assert.ok(organization?.availability.available, "organization projection must be available");
  assert.ok(organization?.data.departments.length, "organization projection must expose departments");

  const diagnostics = runtimeProjectionRegistry.listDiagnostics();
  assert.ok(
    diagnostics.some((entry) => entry.collection === "agent-runtime"),
    "agent projection must be present in diagnostics",
  );

  console.log("runtime-projection foundation checks passed");
}

void main();
