import type { GovernanceRisk } from "@/features/governance/types";

export const governanceRisks: GovernanceRisk[] = [
  { id: "risk-1", title: "Approval backlog delays enterprise deals", category: "business", severity: "critical", likelihood: 4, impact: 5, owner: "Director", mitigation: "Add one more executive approval slot and tighten routing.", trend: "down", status: "mitigating" },
  { id: "risk-2", title: "Role provisioning exception weakens separation of duties", category: "compliance", severity: "high", likelihood: 4, impact: 4, owner: "Security Agent", mitigation: "Require second reviewer for high-privilege HR roles.", trend: "flat", status: "open" },
  { id: "risk-3", title: "Explainability coverage below target in HR workflows", category: "ai", severity: "medium", likelihood: 3, impact: 4, owner: "AI Governance Board", mitigation: "Link every screening decision to evidence bundle.", trend: "up", status: "mitigating" },
  { id: "risk-4", title: "Emergency rollback authority may be too broad", category: "operational", severity: "high", likelihood: 3, impact: 4, owner: "Operations Agent", mitigation: "Reduce emergency privilege window to one hour.", trend: "flat", status: "watching" },
  { id: "risk-5", title: "Temporary tool access exceptions may linger", category: "security", severity: "medium", likelihood: 3, impact: 3, owner: "Security Agent", mitigation: "Automate recertification and sunset checks.", trend: "down", status: "mitigating" },
];
