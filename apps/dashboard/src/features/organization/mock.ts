/*
 * organization/mock.ts — mock data for the Live Organization View (Dashboard v4).
 * A living operational map of the enterprise AI organization.
 * Mock only — no backend. UI reads from here.
 */

import type { SystemEvent } from "@/types";

export type OrgStatus = "online" | "degraded" | "offline";
export type Workload = "idle" | "low" | "medium" | "high" | "critical";
export type AgentStatus = "running" | "idle" | "paused" | "error";

export interface OrgAgent {
  id: string;
  name: string;
  department: string; // department id
  status: AgentStatus;
  currentTask: string;
  queueSize: number;
  currentGoal: string;
  capability: string;
  confidence: number; // 0–100
  model: string;
  responseTime: string;
  lastActivity: string;
  health: number; // 0–100
  memoryUsage: number; // %
  runningTools: string[];
  recentDecisions: string[];
  executionHistory: { id: string; outcome: "success" | "failed" | "running"; when: string }[];
}

export interface OrgDepartment {
  id: string;
  name: string;
  status: OrgStatus;
  health: number;
  capacity: number; // % utilized
  workload: Workload;
  runningTasks: number;
  waitingTasks: number;
  completedToday: number;
  humanApprovals: number;
  avgResponseTime: string;
  // matrix metrics (0–100; risk lower is better)
  efficiency: number;
  risk: number;
  learning: number;
  governance: number;
  execution: number;
  agentIds: string[];
}

export interface OrgExecutionFlow {
  id: string;
  name: string;
  path: string[]; // department ids in order
  status: "running" | "waiting" | "completed" | "failed";
  currentStage: number; // index into path
}

/* ── Agents ────────────────────────────────────────────── */

export const orgAgents: OrgAgent[] = [
  // Sales
  { id: "ag-renewal", name: "Renewal Agent", department: "sales", status: "running", currentTask: "Globex renewal outreach", queueSize: 3, currentGoal: "Reduce Q3 churn below 8%", capability: "retention", confidence: 88, model: "reasoning", responseTime: "1.2s", lastActivity: "just now", health: 96, memoryUsage: 42, runningTools: ["CRM", "Email"], recentDecisions: ["Offer 2-day-early retention deal", "Flag Globex health 71"], executionHistory: [{ id: "EX-2051", outcome: "running", when: "now" }, { id: "EX-2044", outcome: "success", when: "1h ago" }] },
  { id: "ag-sales", name: "Sales Agent", department: "sales", status: "running", currentTask: "Northwind negotiation", queueSize: 2, currentGoal: "Launch enterprise tier", capability: "deal-management", confidence: 81, model: "reasoning", responseTime: "1.5s", lastActivity: "2m ago", health: 92, memoryUsage: 38, runningTools: ["CRM"], recentDecisions: ["Escalate 18% discount to Director"], executionHistory: [{ id: "EX-2045", outcome: "success", when: "3h ago" }] },
  { id: "ag-lead", name: "Lead Qualifier Agent", department: "sales", status: "idle", currentTask: "—", queueSize: 0, currentGoal: "Qualify inbound leads", capability: "lead-scoring", confidence: 90, model: "fast", responseTime: "0.4s", lastActivity: "12m ago", health: 94, memoryUsage: 21, runningTools: [], recentDecisions: ["Scored Acme 87 → qualified"], executionHistory: [{ id: "EX-2039", outcome: "success", when: "12m ago" }] },
  // Operations
  { id: "ag-support", name: "Support Agent", department: "operations", status: "running", currentTask: "Ticket #4832 resolution", queueSize: 5, currentGoal: "Automate 80% of L1 support", capability: "support", confidence: 84, model: "fast", responseTime: "0.8s", lastActivity: "just now", health: 93, memoryUsage: 47, runningTools: ["Ticket", "KB"], recentDecisions: ["Auto-resolved refund ticket from KB"], executionHistory: [{ id: "EX-2043", outcome: "success", when: "3m ago" }] },
  { id: "ag-ticket", name: "Ticket Management Agent", department: "operations", status: "running", currentTask: "SLA monitoring", queueSize: 1, currentGoal: "Zero SLA breaches", capability: "routing", confidence: 89, model: "fast", responseTime: "0.3s", lastActivity: "1m ago", health: 95, memoryUsage: 29, runningTools: ["Ticket"], recentDecisions: ["Routed #4831 to Support"], executionHistory: [{ id: "EX-2040", outcome: "success", when: "8m ago" }] },
  // Finance
  { id: "ag-invoice", name: "Invoice Agent", department: "finance", status: "running", currentTask: "DE invoice VAT batch", queueSize: 4, currentGoal: "Cut infra cost 15%", capability: "invoicing", confidence: 86, model: "reasoning", responseTime: "1.1s", lastActivity: "just now", health: 95, memoryUsage: 33, runningTools: ["ERP", "Tax"], recentDecisions: ["Held batch for VAT validation"], executionHistory: [{ id: "EX-2052", outcome: "running", when: "now" }] },
  { id: "ag-payment", name: "Payment Agent", department: "finance", status: "error", currentTask: "Initech payment retry", queueSize: 2, currentGoal: "Verify all payments", capability: "payments", confidence: 62, model: "fast", responseTime: "2.4s", lastActivity: "12m ago", health: 71, memoryUsage: 55, runningTools: ["Payment"], recentDecisions: ["Retry #3 after gateway timeout"], executionHistory: [{ id: "EX-2047", outcome: "failed", when: "12m ago" }] },
  // HR
  { id: "ag-recruiting", name: "Recruiting Agent", department: "hr", status: "running", currentTask: "Screen eng candidates", queueSize: 6, currentGoal: "Fill 4 engineering roles", capability: "recruiting", confidence: 78, model: "reasoning", responseTime: "1.8s", lastActivity: "3m ago", health: 88, memoryUsage: 44, runningTools: ["ATS"], recentDecisions: ["Advanced 3 candidates to interview"], executionHistory: [{ id: "EX-2048", outcome: "running", when: "now" }] },
  { id: "ag-hr", name: "HR Agent", department: "hr", status: "idle", currentTask: "—", queueSize: 1, currentGoal: "People ops coordination", capability: "hr-management", confidence: 82, model: "fast", responseTime: "0.6s", lastActivity: "20m ago", health: 90, memoryUsage: 26, runningTools: [], recentDecisions: ["Approved onboarding checklist"], executionHistory: [{ id: "EX-2035", outcome: "success", when: "1h ago" }] },
  // Legal
  { id: "ag-contract-review", name: "Contract Review Agent", department: "legal", status: "paused", currentTask: "Acme MSA review (blocked)", queueSize: 8, currentGoal: "SOC2 Type II readiness", capability: "contract-review", confidence: 74, model: "reasoning", responseTime: "3.1s", lastActivity: "22m ago", health: 79, memoryUsage: 68, runningTools: ["Clause Library"], recentDecisions: ["Flagged 3 clauses missing", "Escalated high-risk MSA"], executionHistory: [{ id: "EX-2050", outcome: "running", when: "now" }] },
  { id: "ag-compliance", name: "Compliance Agent", department: "legal", status: "error", currentTask: "Compliance sweep (failed)", queueSize: 3, currentGoal: "Zero open violations", capability: "compliance", confidence: 66, model: "reasoning", responseTime: "2.8s", lastActivity: "1h ago", health: 72, memoryUsage: 61, runningTools: ["Policy Engine"], recentDecisions: ["Detected SOC2 evidence gap"], executionHistory: [{ id: "EX-2046", outcome: "failed", when: "1h ago" }] },
  // Architecture
  { id: "ag-planner", name: "Planning Engine", department: "architecture", status: "running", currentTask: "Decompose renewal goal", queueSize: 2, currentGoal: "Plan active goals", capability: "planning", confidence: 91, model: "reasoning", responseTime: "1.4s", lastActivity: "1m ago", health: 97, memoryUsage: 40, runningTools: ["Goal Registry", "Plan Registry"], recentDecisions: ["Split goal into 3 objectives"], executionHistory: [{ id: "EX-2051", outcome: "running", when: "now" }] },
  { id: "ag-orchestrator", name: "Orchestrator", department: "architecture", status: "running", currentTask: "Dispatch 4 plans", queueSize: 4, currentGoal: "Coordinate execution", capability: "orchestration", confidence: 93, model: "reasoning", responseTime: "0.9s", lastActivity: "just now", health: 98, memoryUsage: 36, runningTools: ["Workflow Engine"], recentDecisions: ["Parallel-dispatched renewal tasks"], executionHistory: [{ id: "EX-2051", outcome: "running", when: "now" }] },
  // Infrastructure
  { id: "ag-model-router", name: "Model Router", department: "infrastructure", status: "running", currentTask: "Route model calls", queueSize: 12, currentGoal: "Cost/quality routing", capability: "model-routing", confidence: 95, model: "system", responseTime: "0.1s", lastActivity: "just now", health: 94, memoryUsage: 30, runningTools: ["Model Registry"], recentDecisions: ["Fell back to secondary reasoning model"], executionHistory: [{ id: "EX-2051", outcome: "running", when: "now" }] },
  { id: "ag-tool-orch", name: "Tool Orchestrator", department: "infrastructure", status: "running", currentTask: "Tool invocation guardrails", queueSize: 7, currentGoal: "Safe tool execution", capability: "tool-invocation", confidence: 90, model: "system", responseTime: "0.2s", lastActivity: "just now", health: 92, memoryUsage: 34, runningTools: ["Sandbox", "MCP"], recentDecisions: ["Sandboxed unverified tool call"], executionHistory: [{ id: "EX-2052", outcome: "running", when: "now" }] },
  // Governance
  { id: "ag-approval", name: "Approval Engine", department: "governance", status: "running", currentTask: "Route 8 approvals", queueSize: 8, currentGoal: "Timely approvals", capability: "approval", confidence: 92, model: "system", responseTime: "0.3s", lastActivity: "9m ago", health: 96, memoryUsage: 22, runningTools: ["Governance Registry"], recentDecisions: ["Escalated aging discount to Director"], executionHistory: [{ id: "EX-2049", outcome: "success", when: "28m ago" }] },
  { id: "ag-permission", name: "Permission Engine", department: "governance", status: "running", currentTask: "Authz evaluation", queueSize: 15, currentGoal: "Deny-by-default enforcement", capability: "authorization", confidence: 97, model: "system", responseTime: "0.05s", lastActivity: "just now", health: 99, memoryUsage: 18, runningTools: [], recentDecisions: ["Denied unauthorized tool access"], executionHistory: [] },
  // Learning
  { id: "ag-reflection", name: "Reflection", department: "learning", status: "running", currentTask: "Evaluate EX-2043", queueSize: 5, currentGoal: "Turn execution into experience", capability: "reflection", confidence: 87, model: "reasoning", responseTime: "1.6s", lastActivity: "8m ago", health: 93, memoryUsage: 51, runningTools: ["Experience Registry"], recentDecisions: ["Lesson: 2-day-earlier renewal offer"], executionHistory: [{ id: "EX-2043", outcome: "success", when: "8m ago" }] },
  { id: "ag-recommendation", name: "Recommendation Engine", department: "learning", status: "idle", currentTask: "—", queueSize: 2, currentGoal: "Generate improvements", capability: "recommendation", confidence: 85, model: "reasoning", responseTime: "1.9s", lastActivity: "22m ago", health: 91, memoryUsage: 39, runningTools: ["Learning Registry"], recentDecisions: ["Proposed 2nd Contract Review Agent"], executionHistory: [] },
];

/* ── Departments ───────────────────────────────────────── */

export const orgDepartments: OrgDepartment[] = [
  { id: "sales", name: "Sales & Customer Operations", status: "online", health: 96, capacity: 78, workload: "high", runningTasks: 5, waitingTasks: 3, completedToday: 42, humanApprovals: 2, avgResponseTime: "1.1s", efficiency: 91, risk: 22, learning: 88, governance: 94, execution: 93, agentIds: ["ag-renewal", "ag-sales", "ag-lead"] },
  { id: "operations", name: "Operations", status: "online", health: 93, capacity: 71, workload: "medium", runningTasks: 6, waitingTasks: 2, completedToday: 58, humanApprovals: 1, avgResponseTime: "0.6s", efficiency: 88, risk: 18, learning: 82, governance: 92, execution: 90, agentIds: ["ag-support", "ag-ticket"] },
  { id: "finance", name: "Finance", status: "degraded", health: 88, capacity: 64, workload: "medium", runningTasks: 3, waitingTasks: 4, completedToday: 31, humanApprovals: 4, avgResponseTime: "1.4s", efficiency: 93, risk: 27, learning: 79, governance: 90, execution: 84, agentIds: ["ag-invoice", "ag-payment"] },
  { id: "hr", name: "HR", status: "online", health: 89, capacity: 82, workload: "high", runningTasks: 2, waitingTasks: 6, completedToday: 18, humanApprovals: 3, avgResponseTime: "1.3s", efficiency: 84, risk: 31, learning: 74, governance: 88, execution: 80, agentIds: ["ag-recruiting", "ag-hr"] },
  { id: "legal", name: "Legal", status: "degraded", health: 84, capacity: 90, workload: "critical", runningTasks: 3, waitingTasks: 8, completedToday: 12, humanApprovals: 6, avgResponseTime: "3.0s", efficiency: 80, risk: 44, learning: 71, governance: 86, execution: 74, agentIds: ["ag-contract-review", "ag-compliance"] },
  { id: "architecture", name: "Architecture & Orchestration", status: "online", health: 97, capacity: 68, workload: "medium", runningTasks: 6, waitingTasks: 2, completedToday: 64, humanApprovals: 0, avgResponseTime: "1.0s", efficiency: 95, risk: 12, learning: 90, governance: 96, execution: 97, agentIds: ["ag-planner", "ag-orchestrator"] },
  { id: "infrastructure", name: "Infrastructure", status: "online", health: 94, capacity: 74, workload: "high", runningTasks: 19, waitingTasks: 3, completedToday: 210, humanApprovals: 0, avgResponseTime: "0.2s", efficiency: 92, risk: 16, learning: 80, governance: 93, execution: 95, agentIds: ["ag-model-router", "ag-tool-orch"] },
  { id: "governance", name: "Governance", status: "online", health: 96, capacity: 58, workload: "medium", runningTasks: 23, waitingTasks: 8, completedToday: 340, humanApprovals: 8, avgResponseTime: "0.2s", efficiency: 94, risk: 20, learning: 76, governance: 99, execution: 92, agentIds: ["ag-approval", "ag-permission"] },
  { id: "learning", name: "Learning", status: "online", health: 92, capacity: 49, workload: "low", runningTasks: 5, waitingTasks: 2, completedToday: 27, humanApprovals: 0, avgResponseTime: "1.7s", efficiency: 86, risk: 24, learning: 95, governance: 90, execution: 88, agentIds: ["ag-reflection", "ag-recommendation"] },
];

export function departmentById(id: string): OrgDepartment | undefined {
  return orgDepartments.find((d) => d.id === id);
}
export function agentById(id: string): OrgAgent | undefined {
  return orgAgents.find((a) => a.id === id);
}
export function agentsForDepartment(id: string): OrgAgent[] {
  return orgAgents.filter((a) => a.department === id);
}
export const departmentName: Record<string, string> = Object.fromEntries(
  orgDepartments.map((d) => [d.id, d.name])
);

/* ── Live execution flows (through departments) ────────── */

export const orgExecutionFlows: OrgExecutionFlow[] = [
  { id: "flow-1", name: "Enterprise Customer Renewal", path: ["sales", "legal", "finance"], status: "running", currentStage: 1 },
  { id: "flow-2", name: "New Contract Generation", path: ["legal", "governance", "finance"], status: "waiting", currentStage: 0 },
  { id: "flow-3", name: "Invoice → Payment → Cash", path: ["finance", "governance"], status: "running", currentStage: 0 },
  { id: "flow-4", name: "Candidate Hire Pipeline", path: ["hr", "governance"], status: "running", currentStage: 0 },
  { id: "flow-5", name: "Improvement Rollout", path: ["learning", "governance", "architecture"], status: "completed", currentStage: 2 },
];

/* ── Capacity heatmap ordering ─────────────────────────── */

export const workloadRank: Record<Workload, number> = {
  idle: 0, low: 1, medium: 2, high: 3, critical: 4,
};

/* ── Organization timeline ─────────────────────────────── */

export const orgTimeline: SystemEvent[] = [
  { id: "ot1", type: "agent.started", source: "Renewal Agent", message: "Started Globex renewal outreach execution", severity: "info", timestamp: "just now" },
  { id: "ot2", type: "workflow.completed", source: "Budget Agent", message: "Q3 budget reforecast completed", severity: "success", timestamp: "4m ago" },
  { id: "ot3", type: "approval.received", source: "Approval Engine", message: "Production rollout approved by Director", severity: "success", timestamp: "9m ago" },
  { id: "ot4", type: "goal.created", source: "Goal Formation", message: "New goal from budget.exceeded — owner Finance", severity: "info", timestamp: "14m ago" },
  { id: "ot5", type: "execution.failed", source: "Compliance Agent", message: "Compliance sweep EX-2046 failed after retries", severity: "error", timestamp: "1h ago" },
  { id: "ot6", type: "learning.completed", source: "Continuous Improvement", message: "Earlier renewal outreach adopted — retention +18%", severity: "success", timestamp: "40m ago" },
  { id: "ot7", type: "recommendation.generated", source: "Recommendation Engine", message: "Add 2nd Contract Review Agent — Legal bottleneck", severity: "warning", timestamp: "22m ago" },
];

/* ── Summary roll-up ───────────────────────────────────── */

export const organizationSummary = {
  health: 93,
  departmentsOnline: orgDepartments.filter((d) => d.status === "online").length,
  departmentsTotal: orgDepartments.length,
  activeAgents: orgAgents.filter((a) => a.status === "running").length,
  totalAgents: orgAgents.length,
  runningExecutions: orgExecutionFlows.filter((f) => f.status === "running").length,
  waitingExecutions: orgExecutionFlows.filter((f) => f.status === "waiting").length,
  criticalAlerts: 1,
  avgCapacity: Math.round(orgDepartments.reduce((a, d) => a + d.capacity, 0) / orgDepartments.length),
  aiUtilization: 79,
};
