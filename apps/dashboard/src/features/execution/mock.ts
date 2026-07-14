/*
 * execution/mock.ts — mock data for the Execution Center (Dashboard v5).
 * Operational control surface for running work. Mock only — no backend.
 */

import type { SystemEvent } from "@/types";
import type { Priority } from "@/features/director/mock";

export type NodeState =
  | "pending"
  | "running"
  | "waiting"
  | "blocked"
  | "failed"
  | "retrying"
  | "completed"
  | "cancelled";

export type ExecutionStatus = "running" | "waiting" | "failed" | "blocked" | "retrying" | "completed";

export type NodeType = "Goal" | "Plan" | "Workflow" | "Task" | "Agent" | "Tool" | "Event" | "Reflection";

export type FailureClass = "infrastructure" | "application" | "business" | "reasoning" | "human";

export type RecoveryKind =
  | "retry"
  | "fallback-model"
  | "alternative-tool"
  | "compensation"
  | "human-escalation"
  | "circuit-breaker";

/* ── Executions ────────────────────────────────────────── */

export interface ExecutionRecord {
  id: string;
  name: string;
  status: ExecutionStatus;
  owner: string;
  department: string;
  priority: Priority;
  duration: string;
  startedAt: string;
  retryCount: number;
  humanRequired: boolean;
  cost: string;
  nodesDone: number;
  nodesTotal: number;
}

export const executions: ExecutionRecord[] = [
  { id: "EX-2051", name: "Globex renewal outreach", status: "running", owner: "Renewal Agent", department: "Sales", priority: "high", duration: "3m 12s", startedAt: "14:02", retryCount: 0, humanRequired: false, cost: "$0.24", nodesDone: 4, nodesTotal: 8 },
  { id: "EX-2052", name: "DE invoice VAT batch", status: "waiting", owner: "Tax Agent", department: "Finance", priority: "medium", duration: "8m 40s", startedAt: "13:55", retryCount: 0, humanRequired: true, cost: "$0.31", nodesDone: 5, nodesTotal: 8 },
  { id: "EX-2050", name: "Contract review — Acme MSA", status: "blocked", owner: "Contract Review Agent", department: "Legal", priority: "critical", duration: "22m 03s", startedAt: "13:41", retryCount: 1, humanRequired: true, cost: "$0.88", nodesDone: 3, nodesTotal: 8 },
  { id: "EX-2047", name: "Payment retry — Initech", status: "retrying", owner: "Payment Agent", department: "Finance", priority: "high", duration: "12m 18s", startedAt: "13:50", retryCount: 3, humanRequired: false, cost: "$0.42", nodesDone: 5, nodesTotal: 8 },
  { id: "EX-2046", name: "Compliance monitor sweep", status: "failed", owner: "Compliance Agent", department: "Legal", priority: "high", duration: "6m 02s", startedAt: "13:10", retryCount: 2, humanRequired: true, cost: "$0.51", nodesDone: 4, nodesTotal: 8 },
  { id: "EX-2049", name: "Q3 budget reforecast", status: "completed", owner: "Budget Agent", department: "Finance", priority: "medium", duration: "4m 55s", startedAt: "12:30", retryCount: 0, humanRequired: false, cost: "$0.19", nodesDone: 8, nodesTotal: 8 },
];

/* ── Execution graphs (node chains) ────────────────────── */

export interface ExecutionNode {
  id: string;
  type: NodeType;
  label: string;
  owner: string;
  state: NodeState;
  startedAt: string;
  completedAt: string;
  duration: string;
  retryCount: number;
  cost: string;
  relatedEvent: string;
}

const chain: NodeType[] = ["Goal", "Plan", "Workflow", "Task", "Agent", "Tool", "Event", "Reflection"];

function buildGraph(
  exId: string,
  owner: string,
  states: NodeState[],
  labels: string[]
): ExecutionNode[] {
  return chain.map((type, i) => ({
    id: `${exId}-n${i}`,
    type,
    label: labels[i],
    owner: i >= 4 ? owner : "Cognitive Core",
    state: states[i],
    startedAt: states[i] === "pending" ? "—" : `14:0${i}`,
    completedAt: states[i] === "completed" ? `14:0${i + 1}` : "—",
    duration: states[i] === "pending" ? "—" : `${20 + i * 8}s`,
    retryCount: states[i] === "retrying" ? 2 : 0,
    cost: states[i] === "pending" ? "—" : `$0.0${i + 1}`,
    relatedEvent: `${type.toLowerCase()}.${states[i] === "completed" ? "completed" : states[i]}`,
  }));
}

export const executionGraphs: Record<string, ExecutionNode[]> = {
  "EX-2051": buildGraph("EX-2051", "Renewal Agent",
    ["completed", "completed", "completed", "completed", "running", "waiting", "pending", "pending"],
    ["Reduce Q3 churn", "Renewal plan", "Renewal workflow", "Outreach task", "Renewal Agent run", "Email tool", "renewal.sent", "Post-run analysis"]),
  "EX-2052": buildGraph("EX-2052", "Tax Agent",
    ["completed", "completed", "completed", "completed", "completed", "waiting", "pending", "pending"],
    ["VAT compliance", "Invoice plan", "Invoice workflow", "VAT validation task", "Tax Agent run", "ERP tool", "invoice.sent", "Post-run analysis"]),
  "EX-2050": buildGraph("EX-2050", "Contract Review Agent",
    ["completed", "completed", "blocked", "pending", "pending", "pending", "pending", "pending"],
    ["SOC2 readiness", "Review plan", "Review workflow (blocked)", "Clause check task", "Review Agent run", "Clause Library tool", "contract.reviewed", "Post-run analysis"]),
  "EX-2047": buildGraph("EX-2047", "Payment Agent",
    ["completed", "completed", "completed", "completed", "retrying", "retrying", "pending", "pending"],
    ["Verify payments", "Payment plan", "Payment workflow", "Verify task", "Payment Agent run", "Payment gateway tool", "payment.verified", "Post-run analysis"]),
  "EX-2046": buildGraph("EX-2046", "Compliance Agent",
    ["completed", "completed", "completed", "failed", "cancelled", "cancelled", "pending", "pending"],
    ["Zero violations", "Sweep plan", "Sweep workflow", "Rule eval task (failed)", "Compliance Agent run", "Policy Engine tool", "compliance.checked", "Post-run analysis"]),
  "EX-2049": buildGraph("EX-2049", "Budget Agent",
    ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed"],
    ["Cut infra cost", "Reforecast plan", "Budget workflow", "Reforecast task", "Budget Agent run", "Forecast tool", "budget.reforecast", "Lesson captured"]),
};

export function graphFor(id: string): ExecutionNode[] {
  return executionGraphs[id] ?? [];
}

/* ── Failures ──────────────────────────────────────────── */

export interface FailureRecord {
  id: string;
  execution: string;
  failedNode: string;
  classification: FailureClass;
  rootCause: string;
  recoveryStrategy: RecoveryKind;
  retryCount: number;
  escalation: "none" | "elevated" | "critical";
  owner: string;
  severity: "warning" | "error";
  lastAttempt: string;
  nextAction: string;
}

export const failures: FailureRecord[] = [
  { id: "f1", execution: "EX-2046", failedNode: "Rule eval task", classification: "application", rootCause: "Policy Engine returned malformed ruleset for DE region", recoveryStrategy: "human-escalation", retryCount: 2, escalation: "elevated", owner: "Compliance Agent", severity: "error", lastAttempt: "1h ago", nextAction: "Human review — Legal" },
  { id: "f2", execution: "EX-2047", failedNode: "Payment gateway tool", classification: "infrastructure", rootCause: "Gateway timeout (p95 latency spike)", recoveryStrategy: "alternative-tool", retryCount: 3, escalation: "none", owner: "Payment Agent", severity: "warning", lastAttempt: "just now", nextAction: "Fallback to alternate adapter" },
  { id: "f3", execution: "EX-2050", failedNode: "Review workflow", classification: "business", rootCause: "3 required clauses missing — cannot proceed without human", recoveryStrategy: "human-escalation", retryCount: 1, escalation: "critical", owner: "Contract Review Agent", severity: "error", lastAttempt: "22m ago", nextAction: "Director + Legal review" },
  { id: "f4", execution: "EX-2044", failedNode: "Reasoning step", classification: "reasoning", rootCause: "Low-confidence decision on renewal discount", recoveryStrategy: "fallback-model", retryCount: 1, escalation: "none", owner: "Renewal Agent", severity: "warning", lastAttempt: "2h ago", nextAction: "Escalate to reasoning model" },
  { id: "f5", execution: "EX-2038", failedNode: "Approval node", classification: "human", rootCause: "Approver did not respond within SLA window", recoveryStrategy: "human-escalation", retryCount: 0, escalation: "elevated", owner: "Approval Engine", severity: "warning", lastAttempt: "3h ago", nextAction: "Re-route to backup approver" },
];

/* ── Recovery status cards ─────────────────────────────── */

export interface RecoveryStatus {
  kind: RecoveryKind;
  active: number;
  succeeded: number;
  failed: number;
}

export const recoveryStatuses: RecoveryStatus[] = [
  { kind: "retry", active: 2, succeeded: 14, failed: 3 },
  { kind: "fallback-model", active: 1, succeeded: 6, failed: 0 },
  { kind: "alternative-tool", active: 1, succeeded: 4, failed: 1 },
  { kind: "compensation", active: 0, succeeded: 2, failed: 0 },
  { kind: "human-escalation", active: 3, succeeded: 9, failed: 0 },
  { kind: "circuit-breaker", active: 1, succeeded: 5, failed: 0 },
];

/* ── Bottlenecks ───────────────────────────────────────── */

export interface Bottleneck {
  id: string;
  location: string;
  type: "agent" | "tool" | "node" | "approval";
  waitTime: string;
  impact: string;
  execution: string;
}

export const bottlenecks: Bottleneck[] = [
  { id: "b1", location: "Contract Review Agent", type: "agent", waitTime: "22m", impact: "Legal queue growing, SOC2 blocked", execution: "EX-2050" },
  { id: "b2", location: "Payment gateway tool", type: "tool", waitTime: "12m", impact: "Payment retries piling up", execution: "EX-2047" },
  { id: "b3", location: "VAT approval node", type: "approval", waitTime: "8m", impact: "Invoice batch on hold", execution: "EX-2052" },
  { id: "b4", location: "Policy Engine tool", type: "tool", waitTime: "6m", impact: "Compliance sweep failed", execution: "EX-2046" },
];

/* ── Human intervention queue ──────────────────────────── */

export interface InterventionItem {
  id: string;
  execution: string;
  reason: string;
  waiting: string;
  priority: Priority;
}

export const interventionQueue: InterventionItem[] = [
  { id: "h1", execution: "EX-2050", reason: "High-risk MSA needs Director + Legal sign-off", waiting: "22m", priority: "critical" },
  { id: "h2", execution: "EX-2052", reason: "DE VAT batch approval before send", waiting: "8m", priority: "medium" },
  { id: "h3", execution: "EX-2046", reason: "Compliance failure review", waiting: "1h", priority: "high" },
];

/* ── Timeline ──────────────────────────────────────────── */

export interface ExecTimelineEvent extends SystemEvent {
  execution: string;
  department: string;
  status: ExecutionStatus | "info";
}

export const timelineEvents: ExecTimelineEvent[] = [
  { id: "t1", type: "goal.created", source: "Goal Formation", message: "Goal created — reduce Globex churn", severity: "info", timestamp: "14:00", execution: "EX-2051", department: "Sales", status: "running" },
  { id: "t2", type: "plan.created", source: "Planning Engine", message: "Plan generated — 3 objectives", severity: "info", timestamp: "14:01", execution: "EX-2051", department: "Sales", status: "running" },
  { id: "t3", type: "workflow.started", source: "Workflow Engine", message: "Renewal workflow started", severity: "info", timestamp: "14:02", execution: "EX-2051", department: "Sales", status: "running" },
  { id: "t4", type: "agent.assigned", source: "Organization Planner", message: "Renewal Agent assigned to outreach", severity: "info", timestamp: "14:02", execution: "EX-2051", department: "Sales", status: "running" },
  { id: "t5", type: "tool.called", source: "Tool Orchestrator", message: "Email tool invoked", severity: "info", timestamp: "14:03", execution: "EX-2051", department: "Sales", status: "running" },
  { id: "t6", type: "failure.detected", source: "Payment Agent", message: "Gateway timeout on Initech payment", severity: "error", timestamp: "13:52", execution: "EX-2047", department: "Finance", status: "retrying" },
  { id: "t7", type: "recovery.started", source: "Failure Recovery", message: "Retry with exponential backoff", severity: "warning", timestamp: "13:53", execution: "EX-2047", department: "Finance", status: "retrying" },
  { id: "t8", type: "approval.requested", source: "Approval Engine", message: "VAT batch approval requested", severity: "warning", timestamp: "13:56", execution: "EX-2052", department: "Finance", status: "waiting" },
  { id: "t9", type: "failure.detected", source: "Compliance Agent", message: "Rule eval failed — malformed ruleset", severity: "error", timestamp: "13:14", execution: "EX-2046", department: "Legal", status: "failed" },
  { id: "t10", type: "execution.completed", source: "Budget Agent", message: "Q3 reforecast completed", severity: "success", timestamp: "12:35", execution: "EX-2049", department: "Finance", status: "completed" },
  { id: "t11", type: "reflection.captured", source: "Reflection", message: "Lesson captured from reforecast", severity: "success", timestamp: "12:36", execution: "EX-2049", department: "Finance", status: "completed" },
];

/* ── Metrics ───────────────────────────────────────────── */

export const executionMetrics = {
  running: executions.filter((e) => e.status === "running").length,
  waiting: executions.filter((e) => e.status === "waiting").length,
  failed: executions.filter((e) => e.status === "failed").length,
  blocked: executions.filter((e) => e.status === "blocked").length,
  retrying: executions.filter((e) => e.status === "retrying").length,
  completedToday: 42,
  avgDuration: "5m 48s",
  retryCount: executions.reduce((a, e) => a + e.retryCount, 0),
  humanInterventions: interventionQueue.length,
  executionHealth: 87,
};
