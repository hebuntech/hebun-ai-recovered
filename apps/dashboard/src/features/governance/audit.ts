import type { AuditEvent } from "@/features/governance/types";

export const auditEvents: AuditEvent[] = [
  { id: "aud-01", type: "approval.escalated", scope: "approval", source: "Approval Engine", actor: "Director", message: "Globex commercial override escalated after crossing executive threshold.", severity: "warning", timestamp: "12m ago" },
  { id: "aud-02", type: "policy.updated", scope: "policy", source: "Policy Registry", actor: "Policy Management Agent", message: "AI Explainability Standard advanced to review state with new evidence requirement.", severity: "info", timestamp: "43m ago" },
  { id: "aud-03", type: "permission.changed", scope: "permission", source: "Permission Control", actor: "Security Agent", message: "Revoked temporary export access from Support escalation workflow.", severity: "success", timestamp: "1h ago" },
  { id: "aud-04", type: "execution.reviewed", scope: "execution", source: "Execution Audit", actor: "Compliance Agent", message: "Contract Review execution EX-2050 cleared for trace completeness.", severity: "success", timestamp: "2h ago" },
  { id: "aud-05", type: "learning.logged", scope: "learning", source: "Learning Audit", actor: "Reflection Service", message: "Retention experiment linked to business explanation and approval lineage.", severity: "info", timestamp: "3h ago" },
  { id: "aud-06", type: "policy.exception", scope: "permission", source: "Governance Monitor", actor: "Security Agent", message: "High-privilege role request flagged for separation-of-duties review.", severity: "error", timestamp: "5h ago" },
];
