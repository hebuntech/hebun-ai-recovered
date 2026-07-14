import type { SystemEvent } from "@/types";

export const governanceTimeline: SystemEvent[] = [
  { id: "gov-t-1", type: "governance.health", source: "Governance Monitor", message: "Governance health rose to 92 after three approvals cleared and one conflict resolved.", severity: "success", timestamp: "just now" },
  { id: "gov-t-2", type: "approval.escalated", source: "Approval Engine", message: "Commercial override escalated to Director after SLA breach.", severity: "warning", timestamp: "22m ago" },
  { id: "gov-t-3", type: "policy.review", source: "Policy Registry", message: "AI Explainability Standard moved into executive review.", severity: "info", timestamp: "1h ago" },
  { id: "gov-t-4", type: "permission.conflict", source: "Permission Control", message: "Support export exception flagged for dual-review gap.", severity: "error", timestamp: "2h ago" },
  { id: "gov-t-5", type: "audit.logged", source: "Audit Engine", message: "Execution EX-2050 added full trace and evidence record.", severity: "success", timestamp: "3h ago" },
];
