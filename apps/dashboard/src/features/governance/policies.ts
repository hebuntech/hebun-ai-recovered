import type { GovernancePolicy } from "@/features/governance/types";

export const governancePolicies: GovernancePolicy[] = [
  { id: "pol-01", name: "Executive Approval Thresholds", domain: "business", version: "v3.1", status: "active", owner: "Director Ops", impact: "Controls pricing, contract and spend overrides.", updated: "2d ago" },
  { id: "pol-02", name: "AI Explainability Standard", domain: "ai", version: "v1.4", status: "review", owner: "AI Governance Board", impact: "Requires evidence and business explanation for high-impact decisions.", updated: "4h ago" },
  { id: "pol-03", name: "Tool Permission Policy", domain: "security", version: "v2.0", status: "active", owner: "Security Agent", impact: "Defines who can call high-trust tools and under what conditions.", updated: "1w ago" },
  { id: "pol-04", name: "Operational Rollback Policy", domain: "operational", version: "v1.8", status: "active", owner: "Operations Agent", impact: "Standardizes rollback authority and emergency exceptions.", updated: "3d ago" },
  { id: "pol-05", name: "Legal Review Escalation", domain: "department", version: "v1.2", status: "draft", owner: "Legal Agent", impact: "Aligns SLA and ownership for high-value contract approvals.", updated: "8h ago" },
  { id: "pol-06", name: "Legacy Access Exceptions", domain: "security", version: "v0.9", status: "deprecated", owner: "Security Agent", impact: "Scheduled for retirement after permission cleanup.", updated: "3w ago" },
];
