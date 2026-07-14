/*
 * director/mock.ts — mock data for the Director Command Center (Dashboard v3).
 * Executive Operating Console. Mock only — no backend, no APIs.
 * UI reads from here; keep UI components dumb.
 */

import type { SystemEvent } from "@/types";

/* ── Executive KPIs ────────────────────────────────────── */

export interface ExecutiveKpi {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  caption?: string;
}

export const companyHealth = 94; // 0–100

export const executiveKpis: ExecutiveKpi[] = [
  { id: "revenue", label: "MRR", value: "$184.2K", delta: "+8.4%", deltaDirection: "up", caption: "vs last month" },
  { id: "arr", label: "ARR", value: "$2.21M", delta: "+12%", deltaDirection: "up", caption: "annualized" },
  { id: "margin", label: "Gross Margin", value: "66.1%", delta: "+1.2%", deltaDirection: "up", caption: "healthy" },
  { id: "nrr", label: "Net Revenue Retention", value: "112%", delta: "+3%", deltaDirection: "up", caption: "expansion > churn" },
  { id: "cac", label: "CAC Payback", value: "7.2mo", delta: "-0.6mo", deltaDirection: "up", caption: "improving" },
  { id: "burn", label: "Net Burn", value: "$62.4K", delta: "-4%", deltaDirection: "up", caption: "runway 18mo" },
];

/* ── Strategic Goals ───────────────────────────────────── */

export type GoalStatus = "on-track" | "at-risk" | "blocked" | "achieved";
export type Priority = "critical" | "high" | "medium" | "low";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface StrategicGoal {
  id: string;
  title: string;
  businessImpact: string;
  owner: string;
  priority: Priority;
  progress: number; // 0–100
  status: GoalStatus;
  department: string;
  timeline: string;
  risk: RiskLevel;
}

export const strategicGoals: StrategicGoal[] = [
  { id: "g1", title: "Reduce Q3 churn below 8%", businessImpact: "$420K ARR protected", owner: "Sales Dept", priority: "critical", progress: 72, status: "on-track", department: "Sales", timeline: "Q3 2026", risk: "medium" },
  { id: "g2", title: "Launch enterprise tier", businessImpact: "$1.1M new ARR target", owner: "Director", priority: "high", progress: 45, status: "at-risk", department: "Sales", timeline: "Q4 2026", risk: "high" },
  { id: "g3", title: "Cut infra cost 15%", businessImpact: "$18K/mo savings", owner: "Finance Dept", priority: "high", progress: 61, status: "on-track", department: "Finance", timeline: "Q3 2026", risk: "low" },
  { id: "g4", title: "SOC2 Type II readiness", businessImpact: "Unblocks enterprise deals", owner: "Legal Dept", priority: "critical", progress: 38, status: "blocked", department: "Legal", timeline: "Q4 2026", risk: "high" },
  { id: "g5", title: "Automate 80% of L1 support", businessImpact: "3 FTE capacity freed", owner: "Operations Dept", priority: "medium", progress: 88, status: "on-track", department: "Operations", timeline: "Q3 2026", risk: "low" },
  { id: "g6", title: "Fill 4 engineering roles", businessImpact: "Unblocks roadmap velocity", owner: "HR Dept", priority: "medium", progress: 50, status: "at-risk", department: "HR", timeline: "Q3 2026", risk: "medium" },
];

/* ── Organization Health (per department) ──────────────── */

export type Trend = "up" | "down" | "flat";

export interface DepartmentHealth {
  id: string;
  name: string;
  health: number; // 0–100
  capacity: number; // % utilized
  efficiency: number; // 0–100
  workload: "low" | "balanced" | "high" | "overloaded";
  aiUtilization: number; // %
  humanApprovals: number; // pending
  learningScore: number; // 0–100
  riskScore: number; // 0–100 (lower better)
  trend: Trend;
}

export const departmentHealth: DepartmentHealth[] = [
  { id: "sales", name: "Sales", health: 96, capacity: 78, efficiency: 91, workload: "balanced", aiUtilization: 84, humanApprovals: 2, learningScore: 88, riskScore: 22, trend: "up" },
  { id: "operations", name: "Operations", health: 93, capacity: 71, efficiency: 88, workload: "balanced", aiUtilization: 90, humanApprovals: 1, learningScore: 82, riskScore: 18, trend: "up" },
  { id: "finance", name: "Finance", health: 95, capacity: 64, efficiency: 93, workload: "low", aiUtilization: 76, humanApprovals: 4, learningScore: 79, riskScore: 27, trend: "flat" },
  { id: "hr", name: "HR", health: 89, capacity: 82, efficiency: 84, workload: "high", aiUtilization: 68, humanApprovals: 3, learningScore: 74, riskScore: 31, trend: "up" },
  { id: "legal", name: "Legal", health: 84, capacity: 90, efficiency: 80, workload: "overloaded", aiUtilization: 72, humanApprovals: 6, learningScore: 71, riskScore: 44, trend: "down" },
];

/* ── Active Executions ─────────────────────────────────── */

export type ExecutionStatus = "running" | "waiting" | "completed" | "failed" | "blocked" | "retrying";

export interface ExecutionRun {
  id: string;
  name: string;
  status: ExecutionStatus;
  owner: string;
  priority: Priority;
  duration: string;
  nodesDone: number;
  nodesTotal: number;
}

export const executions: ExecutionRun[] = [
  { id: "EX-2051", name: "Globex renewal outreach", status: "running", owner: "Renewal Agent", priority: "high", duration: "3m 12s", nodesDone: 4, nodesTotal: 7 },
  { id: "EX-2052", name: "DE invoice VAT batch", status: "waiting", owner: "Tax Agent", priority: "medium", duration: "8m 40s", nodesDone: 5, nodesTotal: 9 },
  { id: "EX-2050", name: "Contract review — Acme MSA", status: "blocked", owner: "Contract Review Agent", priority: "critical", duration: "22m 03s", nodesDone: 3, nodesTotal: 6 },
  { id: "EX-2049", name: "Q3 budget reforecast", status: "completed", owner: "Budget Agent", priority: "medium", duration: "4m 55s", nodesDone: 8, nodesTotal: 8 },
  { id: "EX-2048", name: "Candidate screening batch", status: "running", owner: "Candidate Screening Agent", priority: "low", duration: "1m 30s", nodesDone: 2, nodesTotal: 5 },
  { id: "EX-2047", name: "Payment retry — Initech", status: "retrying", owner: "Payment Agent", priority: "high", duration: "12m 18s", nodesDone: 3, nodesTotal: 4 },
  { id: "EX-2046", name: "Compliance monitor sweep", status: "failed", owner: "Compliance Agent", priority: "high", duration: "6m 02s", nodesDone: 4, nodesTotal: 7 },
];

/* ── Executive Insights (Organizational Intelligence) ──── */

export type InsightKind = "opportunity" | "risk" | "attention" | "cost" | "learning";

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  detail: string;
  metric?: string;
}

export const insights: Insight[] = [
  { id: "i1", kind: "opportunity", title: "Enterprise segment converts 3.1×", detail: "Outreach to 200+ seat accounts converts far above average — shift SDR focus.", metric: "+3.1× conversion" },
  { id: "i2", kind: "risk", title: "Legal is the org bottleneck", detail: "Contract review queue growing; Legal at 90% capacity, health trending down.", metric: "90% capacity" },
  { id: "i3", kind: "attention", title: "HR hiring behind plan", detail: "4 open eng roles at 50% progress — roadmap velocity risk next quarter.", metric: "2/4 filled" },
  { id: "i4", kind: "cost", title: "Infra spend anomaly resolved", detail: "Retry-storm circuit breaker cut infra cost back to baseline.", metric: "-38% → baseline" },
  { id: "i5", kind: "learning", title: "Earlier renewal outreach wins", detail: "Health<75 + 2-day-earlier offer lifts retention 18% — rollout approved.", metric: "+18% retention" },
];

export const executiveSummary = "Company health strong at 94. Revenue and retention trending up; enterprise segment is the clearest growth lever. Two watch items: Legal capacity (bottleneck, SOC2 blocked) and HR hiring pace. AI utilization high across departments; learning loop shipped one adopted improvement this week.";

/* ── AI Recommendations (Recommendation Engine) ────────── */

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Recommendation {
  id: string;
  title: string;
  priority: Priority;
  confidence: number; // 0–100
  businessImpact: string;
  departments: string[];
  estimatedRoi: string;
  approvalStatus: ApprovalStatus;
}

export const recommendations: Recommendation[] = [
  { id: "r1", title: "Add 2nd Contract Review Agent", priority: "critical", confidence: 88, businessImpact: "Clears Legal bottleneck, unblocks SOC2", departments: ["Legal"], estimatedRoi: "Unblocks $1.1M enterprise pipeline", approvalStatus: "pending" },
  { id: "r2", title: "Shift SDR focus to enterprise", priority: "high", confidence: 82, businessImpact: "Higher conversion, larger deals", departments: ["Sales"], estimatedRoi: "+$180K ARR / quarter", approvalStatus: "pending" },
  { id: "r3", title: "Trigger renewal outreach at health<75", priority: "high", confidence: 91, businessImpact: "Earlier intervention lifts retention", departments: ["Sales"], estimatedRoi: "+18% retention", approvalStatus: "approved" },
  { id: "r4", title: "Auto-categorize L1 tickets by intent", priority: "medium", confidence: 76, businessImpact: "Faster routing, less manual triage", departments: ["Operations"], estimatedRoi: "~1 FTE capacity", approvalStatus: "pending" },
  { id: "r5", title: "Consolidate two infra vendors", priority: "low", confidence: 64, businessImpact: "Lower fixed cost", departments: ["Finance"], estimatedRoi: "$6K/mo", approvalStatus: "rejected" },
];

/* ── Critical Alerts ───────────────────────────────────── */

export type AlertCategory = "incident" | "risk" | "compliance" | "infrastructure" | "approval" | "workflow" | "security";
export type Escalation = "monitor" | "elevated" | "critical";

export interface CriticalAlert {
  id: string;
  category: AlertCategory;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning" | "error";
  escalation: Escalation;
  timestamp: string;
}

export const criticalAlerts: CriticalAlert[] = [
  { id: "a1", category: "compliance", title: "SOC2 evidence gap", detail: "3 controls missing evidence — blocks Type II audit window.", severity: "error", escalation: "critical", timestamp: "18m ago" },
  { id: "a2", category: "risk", title: "Legal capacity breach", detail: "Contract review queue > SLA; department at 90% capacity.", severity: "warning", escalation: "elevated", timestamp: "40m ago" },
  { id: "a3", category: "workflow", title: "Compliance sweep failed", detail: "EX-2046 failed after retries — needs manual review.", severity: "error", escalation: "elevated", timestamp: "1h ago" },
  { id: "a4", category: "approval", title: "Approval aging", detail: "Enterprise discount request pending 6h — past 4h target.", severity: "warning", escalation: "elevated", timestamp: "2h ago" },
  { id: "a5", category: "infrastructure", title: "Model provider latency", detail: "Primary reasoning model p95 latency elevated; fallback armed.", severity: "warning", escalation: "monitor", timestamp: "2h ago" },
  { id: "a6", category: "security", title: "Permission deny spike", detail: "Unusual deny rate on tool layer — investigating actor.", severity: "info", escalation: "monitor", timestamp: "3h ago" },
];

/* ── Executive Reports ─────────────────────────────────── */

export interface ExecutiveReport {
  id: string;
  name: string;
  period: string;
  status: "ready" | "generating" | "scheduled";
  generated: string;
}

export const reports: ExecutiveReport[] = [
  { id: "rep-d", name: "Daily Report", period: "2026-07-05", status: "ready", generated: "6h ago" },
  { id: "rep-w", name: "Weekly Report", period: "Week 27", status: "ready", generated: "yesterday" },
  { id: "rep-m", name: "Monthly Report", period: "June 2026", status: "ready", generated: "4d ago" },
  { id: "rep-q", name: "Quarterly Report", period: "Q2 2026", status: "generating", generated: "in progress" },
  { id: "rep-a", name: "Annual Report", period: "FY 2026", status: "scheduled", generated: "Dec 2026" },
  { id: "rep-b", name: "Board Report", period: "Q2 2026", status: "ready", generated: "2d ago" },
  { id: "rep-i", name: "Investor Summary", period: "Q2 2026", status: "ready", generated: "2d ago" },
];

/* ── Capacity metrics ──────────────────────────────────── */

export interface CapacityMetric {
  label: string;
  value: number; // %
}

export const capacity: CapacityMetric[] = [
  { label: "Agent Utilization", value: 79 },
  { label: "Human Approval Load", value: 34 },
  { label: "Workflow Throughput", value: 88 },
  { label: "Infra Headroom", value: 62 },
];

/* ── Execution status roll-up ──────────────────────────── */

export const executionStatusCounts = {
  running: executions.filter((e) => e.status === "running").length,
  waiting: executions.filter((e) => e.status === "waiting").length,
  completed: executions.filter((e) => e.status === "completed").length,
  failed: executions.filter((e) => e.status === "failed").length,
  blocked: executions.filter((e) => e.status === "blocked").length,
  retrying: executions.filter((e) => e.status === "retrying").length,
};

/* ── Executive timeline ────────────────────────────────── */

export const executiveTimeline: SystemEvent[] = [
  { id: "et1", type: "goal.at_risk", source: "Organizational Intelligence", message: "Enterprise tier goal slipped to at-risk — Legal dependency", severity: "warning", timestamp: "just now" },
  { id: "et2", type: "recommendation.submitted", source: "Recommendation Engine", message: "Add 2nd Contract Review Agent — awaiting Director approval", severity: "info", timestamp: "18m ago" },
  { id: "et3", type: "learning.adopted", source: "Continuous Improvement", message: "Earlier renewal outreach rolled out to 100% — retention +18%", severity: "success", timestamp: "40m ago" },
  { id: "et4", type: "alert.critical", source: "Compliance Engine", message: "SOC2 evidence gap detected — 3 controls", severity: "error", timestamp: "1h ago" },
  { id: "et5", type: "goal.achieved", source: "Budget Agent", message: "Q3 infra cost reduction on track — 61% complete", severity: "success", timestamp: "2h ago" },
  { id: "et6", type: "approval.escalated", source: "Approval Engine", message: "Enterprise discount escalated to Director — 6h aging", severity: "warning", timestamp: "2h ago" },
];

/* ── Governance + Learning roll-up (dashboard band) ────── */

export const governanceStatus = { pendingApprovals: 8, openRisks: 5, complianceScore: 94, auditCoverage: 100 };
export const learningStatus = { experiencesThisWeek: 946, patternsFound: 12, recommendationsOpen: 3, adoptedThisWeek: 1 };
