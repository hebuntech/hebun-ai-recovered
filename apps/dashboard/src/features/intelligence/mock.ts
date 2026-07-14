/*
 * intelligence/mock.ts — mock data for the Intelligence Center (Dashboard v6).
 * Organizational learning + strategic intelligence. Mock only.
 * Reuses director recommendations/insights; adds patterns, forecasts, learning.
 */

export type Trend = "up" | "down" | "flat";
export type PatternStatus = "emerging" | "confirmed" | "monitoring" | "actioned";

/* ── Scores ────────────────────────────────────────────── */

export const intelligenceScores = {
  organizationIntelligence: 91,
  learning: 88,
  patternDiscovery: 84,
  strategicConfidence: 86,
  weeklyImprovement: 12, // %
  recommendationQueue: 3,
  organizationHealth: 93,
  riskTrend: "down" as Trend, // risk decreasing = good
  opportunityTrend: "up" as Trend,
};

/* ── Patterns ──────────────────────────────────────────── */

export interface Pattern {
  id: string;
  name: string;
  category: string;
  confidence: number; // 0–100
  businessImpact: string;
  frequency: string;
  departments: string[];
  relatedExecutions: string[];
  trend: Trend;
  status: PatternStatus;
  discovered: string;
}

export const patterns: Pattern[] = [
  { id: "p1", name: "Enterprise segment converts 3.1×", category: "Sales conversion", confidence: 88, businessImpact: "Higher ARR per deal", frequency: "42 deals", departments: ["Sales"], relatedExecutions: ["EX-2051", "EX-2045"], trend: "up", status: "actioned", discovered: "2026-07-01" },
  { id: "p2", name: "Approvals age past 4h SLA", category: "Approval delay", confidence: 82, businessImpact: "Deal + rollout slippage", frequency: "18 approvals", departments: ["Governance", "Sales"], relatedExecutions: ["EX-2050"], trend: "up", status: "confirmed", discovered: "2026-07-02" },
  { id: "p3", name: "Legal is the execution bottleneck", category: "Execution bottleneck", confidence: 90, businessImpact: "SOC2 blocked, queue growth", frequency: "recurring", departments: ["Legal"], relatedExecutions: ["EX-2050", "EX-2046"], trend: "up", status: "confirmed", discovered: "2026-07-03" },
  { id: "p4", name: "HR workload spikes end-of-quarter", category: "Department workload", confidence: 76, businessImpact: "Hiring delays", frequency: "quarterly", departments: ["HR"], relatedExecutions: [], trend: "flat", status: "monitoring", discovered: "2026-06-28" },
  { id: "p5", name: "DE SaaS contracts miss VAT clause", category: "Compliance trend", confidence: 84, businessImpact: "Compliance risk", frequency: "70% of DE contracts", departments: ["Legal", "Finance"], relatedExecutions: ["EX-2052"], trend: "down", status: "actioned", discovered: "2026-06-30" },
  { id: "p6", name: "Earlier renewal outreach lifts retention", category: "Customer behavior", confidence: 91, businessImpact: "+18% retention", frequency: "validated", departments: ["Sales"], relatedExecutions: ["EX-2051"], trend: "up", status: "actioned", discovered: "2026-06-29" },
  { id: "p7", name: "Infra retry storms drive cost spikes", category: "Financial trend", confidence: 79, businessImpact: "Infra overspend", frequency: "2 incidents", departments: ["Infrastructure", "Finance"], relatedExecutions: ["EX-2047"], trend: "down", status: "actioned", discovered: "2026-07-04" },
  { id: "p8", name: "Reflection quality improving weekly", category: "Learning trend", confidence: 80, businessImpact: "Faster, better lessons", frequency: "weekly", departments: ["Learning"], relatedExecutions: [], trend: "up", status: "monitoring", discovered: "2026-07-05" },
];

/* ── Forecasts ─────────────────────────────────────────── */

export type ForecastKind = "capacity" | "cost" | "performance" | "learning";

export interface Forecast {
  id: string;
  label: string;
  kind: ForecastKind;
  current: string;
  projected: string;
  trend: Trend;
  confidence: number;
  series: number[]; // small trend series
  note: string;
}

export const forecasts: Forecast[] = [
  { id: "fc1", label: "Capacity Forecast", kind: "capacity", current: "74%", projected: "89%", trend: "up", confidence: 82, series: [60, 63, 66, 70, 74, 80, 89], note: "Legal capacity will breach without a 2nd agent" },
  { id: "fc2", label: "Cost Forecast", kind: "cost", current: "$121.8K", projected: "$118.2K", trend: "down", confidence: 78, series: [130, 128, 126, 124, 122, 120, 118], note: "Infra consolidation lowers run rate" },
  { id: "fc3", label: "Performance Forecast", kind: "performance", current: "87", projected: "92", trend: "up", confidence: 85, series: [80, 82, 83, 85, 87, 90, 92], note: "Execution health improving with recovery tuning" },
  { id: "fc4", label: "Learning Forecast", kind: "learning", current: "88", projected: "93", trend: "up", confidence: 84, series: [78, 80, 83, 85, 88, 91, 93], note: "Learning loop compounding weekly" },
];

/* ── Learning pipeline ─────────────────────────────────── */

export const learningPipeline = [
  { id: "lp1", label: "Execution", detail: "1,284 runs recorded", kind: "execution" as const },
  { id: "lp2", label: "Reflection", detail: "946 evaluated this week", kind: "intelligence" as const },
  { id: "lp3", label: "Experience", detail: "946 experiences stored", kind: "intelligence" as const },
  { id: "lp4", label: "Pattern", detail: "12 patterns discovered", kind: "intelligence" as const },
  { id: "lp5", label: "Recommendation", detail: "3 open, 1 approved", kind: "intelligence" as const },
  { id: "lp6", label: "Approval", detail: "Director gate", kind: "governance" as const },
  { id: "lp7", label: "Continuous Improvement", detail: "1 adopted this week", kind: "intelligence" as const },
];

/* ── Learning summaries ────────────────────────────────── */

export const experienceSummary = { total: 946, thisWeek: 118, lessons: 63, avgConfidence: 84 };
export const learningSummary = { recommendations: 5, experiments: 3, abTests: 2, adopted: 14, rejected: 6, rolledBack: 1 };

export interface Improvement {
  id: string;
  title: string;
  status: "adopted" | "experimenting" | "rolled_back" | "rejected";
  impact: string;
  date: string;
}

export const improvementHistory: Improvement[] = [
  { id: "im1", title: "Earlier renewal outreach (health<75)", status: "adopted", impact: "+18% retention", date: "2026-07-04" },
  { id: "im2", title: "DE VAT clause in contract template", status: "experimenting", impact: "compliance risk ↓", date: "2026-07-05" },
  { id: "im3", title: "Auto-categorize L1 tickets", status: "experimenting", impact: "~1 FTE capacity", date: "2026-07-03" },
  { id: "im4", title: "Infra circuit breaker on retries", status: "adopted", impact: "-38% infra spike", date: "2026-07-04" },
  { id: "im5", title: "Consolidate two infra vendors", status: "rejected", impact: "ROI too low", date: "2026-07-02" },
  { id: "im6", title: "Aggressive auto-approve under $1K", status: "rolled_back", impact: "audit risk", date: "2026-06-30" },
];

/* ── Risk + Opportunity trends ─────────────────────────── */

export interface TrendItem {
  id: string;
  label: string;
  level: "low" | "medium" | "high" | "critical";
  trend: Trend;
  detail: string;
}

export const riskTrends: TrendItem[] = [
  { id: "rt1", label: "Legal capacity breach", level: "high", trend: "up", detail: "90% capacity, SOC2 blocked" },
  { id: "rt2", label: "Approval SLA aging", level: "medium", trend: "up", detail: "18 approvals past 4h" },
  { id: "rt3", label: "Infra cost volatility", level: "low", trend: "down", detail: "circuit breaker deployed" },
  { id: "rt4", label: "Hiring pace vs roadmap", level: "medium", trend: "flat", detail: "2/4 eng roles filled" },
];

export const opportunityTrends: TrendItem[] = [
  { id: "op1", label: "Enterprise segment expansion", level: "high", trend: "up", detail: "3.1× conversion — shift SDR focus" },
  { id: "op2", label: "Support automation", level: "medium", trend: "up", detail: "80% L1 automatable" },
  { id: "op3", label: "Renewal timing optimization", level: "high", trend: "up", detail: "+18% retention validated" },
  { id: "op4", label: "Infra vendor consolidation", level: "low", trend: "flat", detail: "modest savings" },
];

/* ── Weekly intelligence ───────────────────────────────── */

export const weeklyIntelligence = {
  summary: "Organization intelligence at 91. Learning loop shipped one adopted improvement (+18% retention) and two experiments are live. Clearest opportunity: enterprise segment (3.1× conversion). Clearest risk: Legal capacity — bottleneck blocks SOC2 and slows contract throughput. Recommendation engine has 3 open items awaiting Director decision.",
  strategicInsights: [
    "Enterprise is the growth lever — reallocate SDR focus.",
    "Legal capacity is the single biggest constraint this quarter.",
    "Learning loop is compounding — reflection quality up weekly.",
  ],
  predictions: [
    "Legal queue will breach SLA within 2 weeks without a 2nd Contract Review Agent.",
    "Enterprise tier can add ~$180K ARR/quarter if SDR focus shifts.",
    "Infra run rate trending down after circuit-breaker rollout.",
  ],
};
