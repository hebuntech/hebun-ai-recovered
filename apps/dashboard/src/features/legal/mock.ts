import type {
  Contract,
  ContractStatus,
  Clause,
  ComplianceViolation,
  Risk,
  Policy,
  PolicyStatus,
  Regulation,
  IpAsset,
} from "@/types";

/* ── Legal Overview (Director widget) ─────────────────────── */

export const legalOverview = {
  openReviews: 11,
  contractsWaitingReview: 6,
  highRiskContracts: 3,
  complianceScore: 91, // %
  openPolicyUpdates: 4,
  regulatoryAlerts: 2,
  ipAssets: 38,
  trademarkRenewals: 3,
  approvalQueue: 5,
};

/* ── Contracts ────────────────────────────────────────────── */

export const contracts: Contract[] = [
  { id: "CTR-701", title: "Enterprise SaaS Agreement", counterparty: "Globex", type: "MSA", status: "review", risk: "high", value: 240000, updated: "2m ago" },
  { id: "CTR-702", title: "Reseller Partnership", counterparty: "Contoso Ltd", type: "Partnership", status: "draft", risk: "medium", value: 90000, updated: "1h ago" },
  { id: "CTR-703", title: "Data Processing Addendum", counterparty: "Acme GmbH", type: "DPA", status: "review", risk: "high", value: 0, updated: "3h ago" },
  { id: "CTR-704", title: "Vendor Services Agreement", counterparty: "Umbrella Co", type: "Vendor", status: "approved", risk: "low", value: 48000, updated: "yesterday" },
  { id: "CTR-705", title: "NDA — Wayne Corp", counterparty: "Wayne Corp", type: "NDA", status: "signed", risk: "low", value: 0, updated: "2d ago" },
  { id: "CTR-706", title: "Cloud Infra Renewal", counterparty: "Northwind", type: "Renewal", status: "review", risk: "critical", value: 310000, updated: "5h ago" },
  { id: "CTR-707", title: "Consulting SOW", counterparty: "Initech", type: "SOW", status: "rejected", risk: "medium", value: 26000, updated: "3d ago" },
];

export const contractStatuses: ContractStatus[] = [
  "draft",
  "review",
  "approved",
  "signed",
  "rejected",
];

export function contractCount(status: ContractStatus): number {
  return contracts.filter((c) => c.status === status).length;
}

export const clauses: Clause[] = [
  { id: "CL-1", name: "Limitation of Liability", coverage: 96, status: "present" },
  { id: "CL-2", name: "Indemnification", coverage: 88, status: "present" },
  { id: "CL-3", name: "Data Protection (GDPR)", coverage: 74, status: "review" },
  { id: "CL-4", name: "Termination for Convenience", coverage: 61, status: "review" },
  { id: "CL-5", name: "IP Ownership", coverage: 43, status: "missing" },
  { id: "CL-6", name: "Governing Law", coverage: 99, status: "present" },
];

/* ── Compliance ───────────────────────────────────────────── */

export const complianceSummary = {
  score: 91,
  openViolations: 4,
  criticalRisks: 1,
  remediationInProgress: 3,
  auditReadiness: 84, // %
  policyAdoption: 78, // %
};

export const violations: ComplianceViolation[] = [
  { id: "VIO-11", rule: "GDPR Art. 28 — DPA required", area: "Data Privacy", severity: "high", status: "remediating", detected: "1d ago" },
  { id: "VIO-12", rule: "SOC2 CC6.1 — access review", area: "Security", severity: "medium", status: "open", detected: "3d ago" },
  { id: "VIO-13", rule: "Retention policy overrun", area: "Data Governance", severity: "low", status: "open", detected: "5d ago" },
  { id: "VIO-14", rule: "Unapproved subprocessor", area: "Vendor", severity: "critical", status: "remediating", detected: "6h ago" },
];

/* ── Risk ─────────────────────────────────────────────────── */

export const enterpriseRiskScore = 62; // 0–100, lower is better

export const riskCategories = [
  { category: "Legal Risk", score: 58 },
  { category: "Financial Risk", score: 41 },
  { category: "Compliance Risk", score: 66 },
  { category: "Operational Risk", score: 39 },
  { category: "Security Risk", score: 72 },
  { category: "Vendor Risk", score: 54 },
];

export const risks: Risk[] = [
  { id: "RSK-31", category: "Security", title: "Unpatched dependency in prod", level: "high", status: "mitigating", owner: "Security Agent" },
  { id: "RSK-32", category: "Compliance", title: "Missing DPA with Acme GmbH", level: "high", status: "detected", owner: "Compliance Agent" },
  { id: "RSK-33", category: "Vendor", title: "Unapproved subprocessor", level: "critical", status: "escalated", owner: "Legal Agent" },
  { id: "RSK-34", category: "Financial", title: "Currency exposure on EU deals", level: "medium", status: "accepted", owner: "Finance Agent" },
  { id: "RSK-35", category: "Operational", title: "Single-region deployment", level: "medium", status: "mitigating", owner: "Ops Agent" },
];

/* ── Policies ─────────────────────────────────────────────── */

export const policies: Policy[] = [
  { id: "POL-1", name: "Data Retention Policy", version: "v3.2", status: "active", owner: "Policy Management Agent", updated: "1w ago" },
  { id: "POL-2", name: "Acceptable Use Policy", version: "v2.0", status: "active", owner: "Policy Management Agent", updated: "3w ago" },
  { id: "POL-3", name: "AI Governance Policy", version: "v1.0-draft", status: "pending-approval", owner: "Legal Agent", updated: "2d ago" },
  { id: "POL-4", name: "Vendor Onboarding Policy", version: "v1.4", status: "draft", owner: "Compliance Agent", updated: "4d ago" },
  { id: "POL-5", name: "Incident Response Policy", version: "v2.1", status: "active", owner: "Security Agent", updated: "1mo ago" },
  { id: "POL-6", name: "Legacy Access Policy", version: "v1.0", status: "deprecated", owner: "Policy Management Agent", updated: "6mo ago" },
];

export function policyCount(status: PolicyStatus): number {
  return policies.filter((p) => p.status === status).length;
}

/* ── Regulatory ───────────────────────────────────────────── */

export const regulatorySummary = {
  monitored: 42,
  highImpact: 3,
  pendingReviews: 5,
  policyUpdateRequired: 2,
  complianceUpdateRequired: 1,
};

export const regulations: Regulation[] = [
  { id: "REG-1", name: "EU AI Act — high-risk classification", region: "EU", impact: "high", action: "Policy update required", updated: "2d ago" },
  { id: "REG-2", name: "GDPR enforcement guidance update", region: "EU", impact: "medium", action: "Compliance review", updated: "5d ago" },
  { id: "REG-3", name: "US state privacy laws (CPRA)", region: "US", impact: "high", action: "Policy update required", updated: "1w ago" },
  { id: "REG-4", name: "Türkiye KVKK amendment", region: "TR", impact: "medium", action: "Under review", updated: "1w ago" },
  { id: "REG-5", name: "UK Online Safety Act", region: "UK", impact: "low", action: "Monitoring", updated: "2w ago" },
];

/* ── IP & Trademark ───────────────────────────────────────── */

export const ipSummary = {
  registeredTrademarks: 6,
  pendingTrademarks: 2,
  activeDomains: 14,
  expiringDomains: 2,
  licenseCoverage: 92, // %
  ipRiskScore: 28, // 0–100, lower better
};

export const ipAssets: IpAsset[] = [
  { id: "IP-1", name: "Hebun AI (wordmark)", kind: "trademark", status: "registered", detail: "TR · EU · US" },
  { id: "IP-2", name: "Hebun logo", kind: "trademark", status: "registered", detail: "TR · EU" },
  { id: "IP-3", name: "Mulify", kind: "trademark", status: "pending", detail: "EU filing" },
  { id: "IP-4", name: "hebun.ai", kind: "domain", status: "active", detail: "renews 2027" },
  { id: "IP-5", name: "hebun.com", kind: "domain", status: "expiring", detail: "renews in 21 days" },
  { id: "IP-6", name: "Agent orchestration method", kind: "patent", status: "filed", detail: "provisional" },
  { id: "IP-7", name: "OpenAI API", kind: "license", status: "active", detail: "enterprise seat" },
];
