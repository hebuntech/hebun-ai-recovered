import { Shield } from "lucide-react";
import { PolicyPanel } from "@/components/policy/policy-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { policyMetrics } from "@/features/policy";

export default function PolicyPage() {
  return (
    <>
      <PageHeader
        title="Policy & Governance Engine"
        context="The deterministic governance layer that decides whether a reasoning result is allowed, compliant, safe, and properly authorized before planning."
        action={<Badge variant={policyMetrics.healthBadge}>Policy Health {policyMetrics.policyHealth}</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <Shield className="size-4 text-primary" />
        Deterministic, explainable, auditable, and traceable. No LLMs, no planning, no execution.
      </div>

      <PolicyPanel />
    </>
  );
}
