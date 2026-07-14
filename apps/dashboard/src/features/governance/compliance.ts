import type { ComplianceArea, ComplianceViolation } from "@/features/governance/types";

export const countryCompliance: ComplianceArea[] = [
  { id: "co-1", label: "EU", score: 95, trend: "up", note: "AI Act readiness and DPA coverage improving." },
  { id: "co-2", label: "US", score: 92, trend: "flat", note: "State privacy reviews scheduled next week." },
  { id: "co-3", label: "UK", score: 90, trend: "up", note: "Policy set aligned after latest audit cycle." },
  { id: "co-4", label: "TR", score: 94, trend: "flat", note: "KVKK obligations stable, one workflow under review." },
];

export const departmentCompliance: ComplianceArea[] = [
  { id: "dep-1", label: "Sales", score: 96, trend: "up", note: "Pricing approvals now consistently logged." },
  { id: "dep-2", label: "Operations", score: 91, trend: "flat", note: "One exception workflow awaiting owner sign-off." },
  { id: "dep-3", label: "Finance", score: 95, trend: "up", note: "Expense approvals and audit trails complete." },
  { id: "dep-4", label: "HR", score: 89, trend: "down", note: "Role provisioning reviews are slower than target." },
  { id: "dep-5", label: "Legal", score: 97, trend: "up", note: "Policy updates and evidence files current." },
];

export const workflowCompliance: ComplianceArea[] = [
  { id: "wf-1", label: "Contract Review", score: 94, trend: "up", note: "Approval metadata attached in every run." },
  { id: "wf-2", label: "Invoice Approval", score: 98, trend: "flat", note: "Fully compliant with sign-off policy." },
  { id: "wf-3", label: "Candidate Screening", score: 88, trend: "down", note: "Explainability coverage below target." },
  { id: "wf-4", label: "Renewal Outreach", score: 93, trend: "up", note: "Decision evidence improved this week." },
];

export const capabilityCompliance: ComplianceArea[] = [
  { id: "cap-1", label: "Approval Engine", score: 96, trend: "up", note: "SLA coverage and audit trace healthy." },
  { id: "cap-2", label: "Permission Control", score: 90, trend: "flat", note: "Four conflicts open, no critical breach." },
  { id: "cap-3", label: "Explainability", score: 89, trend: "up", note: "Coverage improved after recommendation linking." },
  { id: "cap-4", label: "Policy Registry", score: 95, trend: "flat", note: "All active policies versioned." },
];

export const complianceViolations: ComplianceViolation[] = [
  { id: "vio-01", area: "Explainability", severity: "warning", status: "remediating", owner: "AI Governance Board", due: "tomorrow" },
  { id: "vio-02", area: "Permission Control", severity: "error", status: "open", owner: "Security Agent", due: "today" },
  { id: "vio-03", area: "Workflow Review", severity: "warning", status: "scheduled", owner: "Operations Agent", due: "in 2d" },
];

export const upcomingComplianceReviews = [
  { id: "rev-1", area: "EU AI Act", owner: "Legal Agent", when: "tomorrow" },
  { id: "rev-2", area: "HR role provisioning", owner: "HR Agent", when: "in 2d" },
  { id: "rev-3", area: "Tool access recertification", owner: "Security Agent", when: "in 4d" },
];
