import { ShieldAlert } from "lucide-react";
import { RuntimePanel } from "@/components/runtime-boundary/runtime-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { runtimeMetrics } from "@/features/runtime-boundary";

export default function RuntimeBoundaryPage() {
  return (
    <>
      <PageHeader
        title="Live Provider Runtime Boundary"
        context="The final safety boundary before real provider execution. It does not execute providers — it decides whether an invocation may cross from the deterministic offline world into a future live runtime. In this phase live runtime is disabled and every invocation is held on the offline side. Deterministic, explainable, auditable and offline."
        action={<Badge variant={runtimeMetrics.badge}>Runtime {runtimeMetrics.runtimeHealth}%</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <ShieldAlert className="size-4 text-primary" />
        No real execution, no API calls, no credentials, no env access, no secret managers, no
        network. Live crossing is blocked by design; simulation fallback always available.
      </div>

      <RuntimePanel />
    </>
  );
}
