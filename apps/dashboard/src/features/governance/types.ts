import type { EventSeverity, SystemEvent } from "@/types";

export type GovernancePriority = "critical" | "high" | "medium" | "low";
export type GovernanceStatus = "active" | "draft" | "review" | "deprecated";
export type GovernanceTrend = "up" | "down" | "flat";

export interface GovernanceMetrics {
  health: number;
  pendingApprovals: number;
  complianceScore: number;
  activePolicies: number;
  auditHealth: number;
  permissionIssues: number;
  criticalRisks: number;
  explainabilityCoverage: number;
}

export interface GovernanceApproval {
  id: string;
  title: string;
  department: string;
  type: string;
  priority: GovernancePriority;
  owner: string;
  approvalLayer: "department" | "executive" | "emergency";
  age: string;
  sla: string;
  status: "pending" | "escalated" | "approved";
  summary: string;
  history: string[];
}

export interface GovernancePolicy {
  id: string;
  name: string;
  domain: "business" | "ai" | "security" | "operational" | "department";
  version: string;
  status: GovernanceStatus;
  owner: string;
  impact: string;
  updated: string;
}

export interface ComplianceArea {
  id: string;
  label: string;
  score: number;
  trend: GovernanceTrend;
  note: string;
}

export interface ComplianceViolation {
  id: string;
  area: string;
  severity: EventSeverity;
  status: "open" | "remediating" | "scheduled";
  owner: string;
  due: string;
}

export interface AuditEvent extends SystemEvent {
  scope: "execution" | "approval" | "policy" | "permission" | "learning";
  actor: string;
}

export interface PermissionRole {
  id: string;
  role: string;
  department: string;
  privilege: "high" | "medium" | "baseline";
  seats: number;
}

export interface PermissionMatrixRow {
  capability: string;
  finance: "allow" | "review" | "deny";
  hr: "allow" | "review" | "deny";
  legal: "allow" | "review" | "deny";
  operations: "allow" | "review" | "deny";
  director: "allow" | "review" | "deny";
}

export interface PermissionChange {
  id: string;
  actor: string;
  change: string;
  when: string;
}

export interface PermissionConflict {
  id: string;
  title: string;
  severity: EventSeverity;
  detail: string;
}

export interface ExplainabilityRecord {
  id: string;
  title: string;
  decision: string;
  confidence: number;
  evidence: string[];
  reasoningSummary: string;
  businessExplanation: string;
  executionId: string;
  recommendationId: string;
  owner: string;
}

export interface GovernanceRisk {
  id: string;
  title: string;
  category: "business" | "operational" | "ai" | "security" | "compliance";
  severity: GovernancePriority;
  likelihood: number;
  impact: number;
  owner: string;
  mitigation: string;
  trend: GovernanceTrend;
  status: "open" | "mitigating" | "watching";
}
