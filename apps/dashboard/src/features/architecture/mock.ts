/*
 * architecture/mock.ts — mock data for the Architecture & Orchestration Center.
 * Mirrors the Hebun Brain AI Operating System v1.0 (Migration Pack 09).
 * Mock only — no backend, no real APIs. UI reads from here; keep UI dumb.
 */

import type { SystemEvent } from "@/types";

export type CoreId = "cognitive" | "execution" | "intelligence" | "governance";

export type ComponentHealth = "healthy" | "degraded" | "idle";
export type ComponentStatus = "active" | "planned" | "idle";

export interface CoreDefinition {
  id: CoreId;
  name: string;
  tagline: string;
  question: string; // the one-line "what it answers"
  engineCount: number;
  registryCount: number;
  status: ComponentStatus;
  health: number; // 0–100
  href: string;
  adr: string; // related ADR
}

export interface EngineDefinition {
  id: string;
  name: string;
  core: CoreId;
  purpose: string;
  consumers: string[];
  status: ComponentStatus;
  health: ComponentHealth;
  lastActivity: string;
}

export type RegistryType = "definition" | "state" | "learning" | "governance";

export interface RegistryDefinition {
  id: string;
  name: string;
  type: RegistryType;
  records: number; // mock record count
  owner: string;
  status: ComponentStatus;
  lastUpdate: string;
}

export interface FlowStep {
  id: string;
  label: string;
  core: CoreId | "signal" | "director";
  detail: string;
}

export interface SystemStatus {
  version: string;
  status: "Active" | "Degraded" | "Offline";
  cores: number;
  engines: number;
  registries: number;
  adrs: number;
  platformHealth: number; // 0–100
}

/* ── System status ─────────────────────────────────────── */

export const systemStatus: SystemStatus = {
  version: "v1.0",
  status: "Active",
  cores: 4,
  engines: 23,
  registries: 15,
  adrs: 8,
  platformHealth: 98.2,
};

/* ── Cores ─────────────────────────────────────────────── */

export const cores: CoreDefinition[] = [
  {
    id: "cognitive",
    name: "Cognitive Core",
    tagline: "Reasoning · Goals · Planning",
    question: "What should we do, and how?",
    engineCount: 5,
    registryCount: 2,
    status: "active",
    health: 99,
    href: "/architecture/cognitive-core",
    adr: "ADR-005",
  },
  {
    id: "execution",
    name: "Execution Core",
    tagline: "Context · Tools · Runtime",
    question: "Turn the plan into real operations.",
    engineCount: 7,
    registryCount: 1,
    status: "active",
    health: 98,
    href: "/architecture/execution-core",
    adr: "ADR-006",
  },
  {
    id: "intelligence",
    name: "Intelligence Core",
    tagline: "Observe · Reflect · Improve",
    question: "What did we learn, and what's better?",
    engineCount: 7,
    registryCount: 2,
    status: "active",
    health: 97,
    href: "/architecture/intelligence-core",
    adr: "ADR-007",
  },
  {
    id: "governance",
    name: "Governance Core",
    tagline: "Approve · Permit · Audit",
    question: "Is it allowed, compliant, and explained?",
    engineCount: 4,
    registryCount: 1,
    status: "active",
    health: 99,
    href: "/architecture/governance-core",
    adr: "ADR-008",
  },
];

export function coreById(id: CoreId): CoreDefinition | undefined {
  return cores.find((c) => c.id === id);
}

export const coreLabel: Record<CoreId, string> = {
  cognitive: "Cognitive Core",
  execution: "Execution Core",
  intelligence: "Intelligence Core",
  governance: "Governance Core",
};

/* ── Engines (23) ──────────────────────────────────────── */

export const engines: EngineDefinition[] = [
  // Cognitive (5)
  {
    id: "executive-reasoning",
    name: "Executive Reasoning",
    core: "cognitive",
    purpose: "Interprets business signals into strategic decision recommendations.",
    consumers: ["Director AI", "Goal Formation", "Orchestrator"],
    status: "active",
    health: "healthy",
    lastActivity: "just now",
  },
  {
    id: "goal-formation",
    name: "Goal Formation",
    core: "cognitive",
    purpose: "Turns signals and decisions into validated goals.",
    consumers: ["Goal Prioritization"],
    status: "active",
    health: "healthy",
    lastActivity: "2m ago",
  },
  {
    id: "goal-prioritization",
    name: "Goal Prioritization",
    core: "cognitive",
    purpose: "Ranks goals by value, risk, urgency, dependency and capacity.",
    consumers: ["Planning Engine"],
    status: "active",
    health: "healthy",
    lastActivity: "4m ago",
  },
  {
    id: "planning-engine",
    name: "Planning Engine",
    core: "cognitive",
    purpose: "Decomposes goals into objectives, tasks and execution graphs.",
    consumers: ["Organization Planner", "Orchestrator"],
    status: "active",
    health: "healthy",
    lastActivity: "1m ago",
  },
  {
    id: "organization-planner",
    name: "Organization Planner",
    core: "cognitive",
    purpose: "Assigns plan tasks to departments, capabilities and agents.",
    consumers: ["Orchestrator", "Agent Runtime"],
    status: "active",
    health: "healthy",
    lastActivity: "3m ago",
  },
  // Execution (7)
  {
    id: "orchestrator",
    name: "Orchestrator",
    core: "execution",
    purpose: "Coordinates multi-agent / multi-department dispatch of the plan.",
    consumers: ["Agent Runtime", "Workflow Engine"],
    status: "active",
    health: "healthy",
    lastActivity: "just now",
  },
  {
    id: "agent-runtime",
    name: "Agent Runtime",
    core: "execution",
    purpose: "Executes agents with context, model and tools loaded; checkpoints.",
    consumers: ["All agents"],
    status: "active",
    health: "healthy",
    lastActivity: "just now",
  },
  {
    id: "context-engine",
    name: "Context Engine",
    core: "execution",
    purpose: "Assembles, ranks, compresses and budgets runtime context.",
    consumers: ["Agent Runtime"],
    status: "active",
    health: "healthy",
    lastActivity: "just now",
  },
  {
    id: "memory-engine",
    name: "Memory Engine",
    core: "execution",
    purpose: "Working / conversation / entity / workflow / organizational memory.",
    consumers: ["Context Engine"],
    status: "active",
    health: "healthy",
    lastActivity: "1m ago",
  },
  {
    id: "model-router",
    name: "Model Router",
    core: "execution",
    purpose: "Selects the right model per call — cost / quality / latency.",
    consumers: ["Agent Runtime"],
    status: "active",
    health: "healthy",
    lastActivity: "just now",
  },
  {
    id: "communication-engine",
    name: "Communication Engine",
    core: "execution",
    purpose: "Structured agent / human messaging, inbox and outbound channels.",
    consumers: ["All agents", "Director"],
    status: "active",
    health: "healthy",
    lastActivity: "2m ago",
  },
  {
    id: "failure-recovery",
    name: "Failure Recovery",
    core: "execution",
    purpose: "Retry, fallback, compensation, circuit breaker and escalation.",
    consumers: ["Agent Runtime", "Orchestrator"],
    status: "active",
    health: "degraded",
    lastActivity: "34m ago",
  },
  // Intelligence (7)
  {
    id: "reflection",
    name: "Reflection",
    core: "intelligence",
    purpose: "Evaluates every execution: success, failure, quality, confidence.",
    consumers: ["Experience Registry", "Pattern Discovery"],
    status: "active",
    health: "healthy",
    lastActivity: "8m ago",
  },
  {
    id: "pattern-discovery",
    name: "Pattern Discovery",
    core: "intelligence",
    purpose: "Extracts patterns, trends, correlations, risks and opportunities.",
    consumers: ["Recommendation Engine", "Organizational Intelligence"],
    status: "active",
    health: "healthy",
    lastActivity: "16m ago",
  },
  {
    id: "recommendation-engine",
    name: "Recommendation Engine",
    core: "intelligence",
    purpose: "Generates scored, prioritized improvement recommendations.",
    consumers: ["Director AI", "Continuous Improvement"],
    status: "active",
    health: "healthy",
    lastActivity: "22m ago",
  },
  {
    id: "continuous-improvement",
    name: "Continuous Improvement",
    core: "intelligence",
    purpose: "Applies approved recommendations: experiment, A/B, rollout, rollback.",
    consumers: ["Governance", "Departments"],
    status: "active",
    health: "idle",
    lastActivity: "1h ago",
  },
  {
    id: "organizational-intelligence",
    name: "Organizational Intelligence",
    core: "intelligence",
    purpose: "Synthesizes strategic, cross-department, predictive intelligence.",
    consumers: ["Director AI", "Executive Reasoning"],
    status: "active",
    health: "healthy",
    lastActivity: "12m ago",
  },
  {
    id: "forecast-engine",
    name: "Forecast Engine",
    core: "intelligence",
    purpose: "Time-series forecasting for cash, budget and capacity (shared).",
    consumers: ["Finance", "Planning", "Organizational Intelligence"],
    status: "active",
    health: "healthy",
    lastActivity: "40m ago",
  },
  {
    id: "scenario-engine",
    name: "Scenario Engine",
    core: "intelligence",
    purpose: "What-if scenario modeling on top of forecasts (shared).",
    consumers: ["Finance", "Director"],
    status: "idle",
    health: "idle",
    lastActivity: "3h ago",
  },
  // Governance (4)
  {
    id: "approval-engine",
    name: "Approval Engine",
    core: "governance",
    purpose: "Runs approval gates: routing, multi-level, delegation, timeout.",
    consumers: ["All cores", "All departments"],
    status: "active",
    health: "healthy",
    lastActivity: "9m ago",
  },
  {
    id: "permission-engine",
    name: "Permission Engine",
    core: "governance",
    purpose: "Authorization (RBAC + ABAC), deny-by-default.",
    consumers: ["Everyone"],
    status: "active",
    health: "healthy",
    lastActivity: "just now",
  },
  {
    id: "policy-engine",
    name: "Policy Engine",
    core: "governance",
    purpose: "Evaluates business / operational / security / AI policies.",
    consumers: ["Compliance Engine", "All departments"],
    status: "active",
    health: "healthy",
    lastActivity: "18m ago",
  },
  {
    id: "compliance-engine",
    name: "Compliance Engine",
    core: "governance",
    purpose: "Country / department / workflow / capability compliance (shared).",
    consumers: ["Finance", "Legal", "Risk Governance"],
    status: "active",
    health: "healthy",
    lastActivity: "27m ago",
  },
];

export function enginesByCore(core: CoreId): EngineDefinition[] {
  return engines.filter((e) => e.core === core);
}

/* ── Registries (15) ───────────────────────────────────── */

export const registries: RegistryDefinition[] = [
  { id: "agent", name: "Agent Registry", type: "definition", records: 36, owner: "Platform", status: "active", lastUpdate: "2m ago" },
  { id: "workflow", name: "Workflow Registry", type: "definition", records: 24, owner: "Platform", status: "active", lastUpdate: "9m ago" },
  { id: "business-entity", name: "Business Entity Registry", type: "definition", records: 58, owner: "Platform", status: "active", lastUpdate: "1h ago" },
  { id: "event", name: "Event Registry", type: "definition", records: 87, owner: "Platform", status: "active", lastUpdate: "just now" },
  { id: "goal", name: "Goal Registry", type: "state", records: 42, owner: "Platform", status: "active", lastUpdate: "1m ago" },
  { id: "plan", name: "Plan Registry", type: "state", records: 38, owner: "Platform", status: "active", lastUpdate: "3m ago" },
  { id: "execution", name: "Execution Registry", type: "state", records: 1284, owner: "Platform", status: "active", lastUpdate: "just now" },
  { id: "experience", name: "Experience Registry", type: "learning", records: 946, owner: "Platform", status: "active", lastUpdate: "8m ago" },
  { id: "learning", name: "Learning Registry", type: "learning", records: 63, owner: "Platform", status: "active", lastUpdate: "22m ago" },
  { id: "model", name: "Model Registry", type: "definition", records: 11, owner: "Platform", status: "active", lastUpdate: "2h ago" },
  { id: "tool", name: "Tool Registry", type: "definition", records: 47, owner: "Platform", status: "active", lastUpdate: "14m ago" },
  { id: "capability", name: "Capability Registry", type: "definition", records: 72, owner: "Platform", status: "active", lastUpdate: "31m ago" },
  { id: "memory", name: "Memory Registry", type: "state", records: 519, owner: "Platform", status: "active", lastUpdate: "just now" },
  { id: "risk", name: "Risk Registry", type: "governance", records: 29, owner: "Platform", status: "active", lastUpdate: "40m ago" },
  { id: "governance", name: "Governance Registry", type: "governance", records: 118, owner: "Platform", status: "active", lastUpdate: "1h ago" },
];

export const registryTypeLabel: Record<RegistryType, string> = {
  definition: "Definition",
  state: "State",
  learning: "Learning",
  governance: "Governance",
};

/* ── Architecture events ───────────────────────────────── */

export const architectureEvents: SystemEvent[] = [
  { id: "arch-01", type: "goal.created", source: "Goal Formation", message: "New goal formed from budget.exceeded signal — owner Finance", severity: "info", timestamp: "just now" },
  { id: "arch-02", type: "plan.created", source: "Planning Engine", message: "Plan generated — 3 objectives, 11 tasks, 2 parallel branches", severity: "info", timestamp: "1m ago" },
  { id: "arch-03", type: "execution.completed", source: "Agent Runtime", message: "Execution #EX-2043 completed in 4m12s — $0.38 model cost", severity: "success", timestamp: "3m ago" },
  { id: "arch-04", type: "failure.recovered", source: "Failure Recovery", message: "Payment tool timeout — fell back to alternate adapter after 2 retries", severity: "warning", timestamp: "12m ago" },
  { id: "arch-05", type: "recommendation.submitted", source: "Recommendation Engine", message: "Add DE VAT clause to contract template — awaiting Director approval", severity: "warning", timestamp: "22m ago" },
  { id: "arch-06", type: "approval.granted", source: "Approval Engine", message: "Production rollout approved — controlled canary at 10%", severity: "success", timestamp: "28m ago" },
  { id: "arch-07", type: "pattern.detected", source: "Pattern Discovery", message: "Risk pattern: 70% of DE SaaS contracts miss VAT clause", severity: "info", timestamp: "34m ago" },
  { id: "arch-08", type: "compliance.checked", source: "Compliance Engine", message: "VAT validation passed on 42-invoice batch", severity: "success", timestamp: "51m ago" },
];

/* ── System flow (full OS pipeline) ────────────────────── */

export const flowSteps: FlowStep[] = [
  { id: "signal", label: "Business Signal", core: "signal", detail: "Event, metric, anomaly or Director request enters the system." },
  { id: "executive-reasoning", label: "Executive Reasoning", core: "cognitive", detail: "Interprets the signal into a decision recommendation." },
  { id: "goal-formation", label: "Goal Formation", core: "cognitive", detail: "Turns the decision into a validated goal." },
  { id: "goal-prioritization", label: "Goal Prioritization", core: "cognitive", detail: "Ranks the goal against all active goals." },
  { id: "planning-engine", label: "Planning Engine", core: "cognitive", detail: "Decomposes the goal into objectives and tasks." },
  { id: "organization-planner", label: "Organization Planner", core: "cognitive", detail: "Assigns tasks to departments and agents." },
  { id: "context-engine", label: "Context Engine", core: "execution", detail: "Assembles the context for each task." },
  { id: "memory-engine", label: "Memory Engine", core: "execution", detail: "Reads relevant memory tiers." },
  { id: "model-router", label: "Model Router", core: "execution", detail: "Selects the right model per call." },
  { id: "communication-engine", label: "Communication Engine", core: "execution", detail: "Coordinates agent and human messaging." },
  { id: "tool-orchestrator", label: "Tool Orchestrator", core: "execution", detail: "Invokes tools with permission and sandbox." },
  { id: "agent-runtime", label: "Agent Runtime", core: "execution", detail: "Executes the task and checkpoints." },
  { id: "execution-graph", label: "Execution Graph", core: "execution", detail: "Tracks live nodes, edges and timeline." },
  { id: "failure-recovery", label: "Failure Recovery", core: "execution", detail: "Recovers from failures — retry, fallback, escalate." },
  { id: "observability", label: "Observability", core: "intelligence", detail: "Captures logs, metrics, traces, health and cost." },
  { id: "reflection", label: "Reflection", core: "intelligence", detail: "Evaluates the execution outcome." },
  { id: "experience-registry", label: "Experience Registry", core: "intelligence", detail: "Stores the structured lesson learned." },
  { id: "pattern-discovery", label: "Pattern Discovery", core: "intelligence", detail: "Extracts patterns across experiences." },
  { id: "recommendation-engine", label: "Recommendation Engine", core: "intelligence", detail: "Produces scored recommendations." },
  { id: "continuous-improvement", label: "Continuous Improvement", core: "intelligence", detail: "Applies approved improvements safely." },
  { id: "organizational-intelligence", label: "Organizational Intelligence", core: "intelligence", detail: "Synthesizes strategic intelligence." },
  { id: "director-ai", label: "Director AI", core: "director", detail: "Human-in-the-loop: approves, overrides, steers strategy." },
];

/* Governance gates — cross-core control points. */
export interface GovernanceGate {
  id: string;
  name: string;
  trigger: string;
}

export const governanceGates: GovernanceGate[] = [
  { id: "planning", name: "Planning Gate", trigger: "Plan ready → execution" },
  { id: "execution", name: "Execution Gate", trigger: "Node runs → permission + policy" },
  { id: "learning", name: "Learning Gate", trigger: "Recommendation → approval" },
  { id: "production", name: "Production Gate", trigger: "Prod change → controlled rollout" },
];
