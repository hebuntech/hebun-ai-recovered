import type {
  Job,
  JobStatus,
  Candidate,
  CandidateStage,
  Interview,
  Employee,
  PerformanceReview,
  LearningPath,
  HrTicket,
  Offboarding,
} from "@/types";

/* ── HR Overview (Director widget) ────────────────────────── */

export const hrOverview = {
  openPositions: 14,
  candidates: 186,
  activeInterviews: 9,
  onboardingProgress: 68, // %
  employeeSatisfaction: 87, // %
  reviewsDue: 12,
  learningProgress: 74, // %
  retentionRisk: 3, // employees flagged
};

/* ── Recruiting ───────────────────────────────────────────── */

export const jobs: Job[] = [
  { id: "JOB-401", title: "Senior AI Engineer", department: "Engineering", status: "interviewing", candidates: 24, posted: "2w ago" },
  { id: "JOB-402", title: "Product Designer", department: "Design", status: "screening", candidates: 41, posted: "1w ago" },
  { id: "JOB-403", title: "Sales Development Rep", department: "Sales", status: "open", candidates: 63, posted: "4d ago" },
  { id: "JOB-404", title: "Data Analyst", department: "Finance", status: "offer", candidates: 18, posted: "3w ago" },
  { id: "JOB-405", title: "Customer Success Manager", department: "Operations", status: "interviewing", candidates: 29, posted: "10d ago" },
  { id: "JOB-406", title: "DevOps Engineer", department: "Engineering", status: "filled", candidates: 11, posted: "1mo ago" },
];

export function jobCount(status: JobStatus): number {
  return jobs.filter((j) => j.status === status).length;
}

export const hiringFunnel = [
  { stage: "Applied", value: 186 },
  { stage: "Screened", value: 92 },
  { stage: "Interviewed", value: 38 },
  { stage: "Offer", value: 11 },
  { stage: "Hired", value: 6 },
];

export const sourceAnalytics = [
  { source: "LinkedIn", value: 74 },
  { source: "Referral", value: 48 },
  { source: "Career Page", value: 39 },
  { source: "Job Boards", value: 25 },
];

/* ── Candidates / Screening ───────────────────────────────── */

export const candidates: Candidate[] = [
  { id: "CND-91", name: "Elif Yılmaz", role: "Senior AI Engineer", stage: "interview", technicalMatch: 92, experienceMatch: 88, domainMatch: 81, source: "Referral" },
  { id: "CND-92", name: "Marco Rossi", role: "Senior AI Engineer", stage: "screening", technicalMatch: 78, experienceMatch: 74, domainMatch: 69, source: "LinkedIn" },
  { id: "CND-93", name: "Ayşe Demir", role: "Product Designer", stage: "interview", technicalMatch: 84, experienceMatch: 90, domainMatch: 76, source: "Career Page" },
  { id: "CND-94", name: "John Carter", role: "Data Analyst", stage: "offer", technicalMatch: 88, experienceMatch: 82, domainMatch: 85, source: "LinkedIn" },
  { id: "CND-95", name: "Priya Nair", role: "SDR", stage: "applied", technicalMatch: 61, experienceMatch: 58, domainMatch: 64, source: "Job Boards" },
  { id: "CND-96", name: "Tomás Silva", role: "DevOps Engineer", stage: "hired", technicalMatch: 90, experienceMatch: 86, domainMatch: 83, source: "Referral" },
  { id: "CND-97", name: "Lena Fischer", role: "Product Designer", stage: "rejected", technicalMatch: 52, experienceMatch: 60, domainMatch: 41, source: "Job Boards" },
];

export const screeningStages: CandidateStage[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export function candidateCount(stage: CandidateStage): number {
  return candidates.filter((c) => c.stage === stage).length;
}

export const skillGaps = [
  { skill: "LLM fine-tuning", gap: 42 },
  { skill: "System design", gap: 28 },
  { skill: "Domain (fintech)", gap: 35 },
  { skill: "Communication", gap: 15 },
];

/* ── Interviews ───────────────────────────────────────────── */

export const interviews: Interview[] = [
  { id: "INT-51", candidate: "Elif Yılmaz", role: "Senior AI Engineer", interviewer: "Recruiting Agent", when: "Today · 14:00", status: "scheduled" },
  { id: "INT-52", candidate: "Ayşe Demir", role: "Product Designer", interviewer: "Design Lead", when: "Today · 16:30", status: "scheduled" },
  { id: "INT-53", candidate: "John Carter", role: "Data Analyst", interviewer: "Finance Agent", when: "Yesterday", status: "feedback-pending" },
  { id: "INT-54", candidate: "Marco Rossi", role: "Senior AI Engineer", interviewer: "Eng Lead", when: "Tomorrow · 11:00", status: "scheduled" },
  { id: "INT-55", candidate: "Priya Nair", role: "SDR", interviewer: "Sales Agent", when: "Jul 05 · 10:00", status: "scheduled" },
  { id: "INT-56", candidate: "Tomás Silva", role: "DevOps Engineer", interviewer: "Eng Lead", when: "2d ago", status: "completed" },
];

/* ── Employees / Onboarding ───────────────────────────────── */

export const employees: Employee[] = [
  { id: "EMP-201", name: "Tomás Silva", role: "DevOps Engineer", department: "Engineering", onboardingStage: "training", onboardingProgress: 55, startDate: "Jul 01" },
  { id: "EMP-202", name: "Sara Ahmadi", role: "Account Executive", department: "Sales", onboardingStage: "mentor", onboardingProgress: 80, startDate: "Jun 24" },
  { id: "EMP-203", name: "David Kim", role: "Support Specialist", department: "Operations", onboardingStage: "access", onboardingProgress: 20, startDate: "Jul 03" },
  { id: "EMP-204", name: "Nora Haddad", role: "Financial Analyst", department: "Finance", onboardingStage: "complete", onboardingProgress: 100, startDate: "Jun 10" },
];

export const accessRequests = [
  { id: "AR-11", employee: "David Kim", system: "GitHub + Supabase", status: "pending" },
  { id: "AR-12", employee: "Tomás Silva", system: "Vercel", status: "granted" },
  { id: "AR-13", employee: "Sara Ahmadi", system: "CRM", status: "granted" },
];

export const equipmentStatus = [
  { employee: "David Kim", item: "MacBook Pro", status: "shipped" },
  { employee: "Tomás Silva", item: "MacBook Pro", status: "delivered" },
  { employee: "Sara Ahmadi", item: "Monitor + dock", status: "delivered" },
];

/* ── Performance ──────────────────────────────────────────── */

export const reviews: PerformanceReview[] = [
  { id: "REV-31", employee: "Sara Ahmadi", reviewer: "Sales Agent", goalCompletion: 82, status: "due", cycle: "Q2 2026" },
  { id: "REV-32", employee: "Nora Haddad", reviewer: "Finance Agent", goalCompletion: 91, status: "in-progress", cycle: "Q2 2026" },
  { id: "REV-33", employee: "David Kim", reviewer: "Support Agent", goalCompletion: 64, status: "due", cycle: "Q2 2026" },
  { id: "REV-34", employee: "Tomás Silva", reviewer: "Eng Lead", goalCompletion: 88, status: "completed", cycle: "Q2 2026" },
];

export const performanceTrend = [
  { quarter: "Q3 25", score: 78 },
  { quarter: "Q4 25", score: 81 },
  { quarter: "Q1 26", score: 83 },
  { quarter: "Q2 26", score: 86 },
];

/* ── Learning ─────────────────────────────────────────────── */

export const learningPaths: LearningPath[] = [
  { id: "LP-11", name: "AI Systems Fundamentals", assignee: "Sara Ahmadi", progress: 72, certification: "In progress", skillGap: "System design" },
  { id: "LP-12", name: "Advanced Sales Methodology", assignee: "David Kim", progress: 40, certification: "Not started", skillGap: "Negotiation" },
  { id: "LP-13", name: "Financial Modeling", assignee: "Nora Haddad", progress: 100, certification: "Certified", skillGap: "None" },
  { id: "LP-14", name: "Leadership Essentials", assignee: "Tomás Silva", progress: 25, certification: "In progress", skillGap: "Delegation" },
];

/* ── Employee Support ─────────────────────────────────────── */

export const hrTickets: HrTicket[] = [
  { id: "HRT-71", employee: "Sara Ahmadi", topic: "Payroll question", status: "open", sla: "on-track", updated: "12m ago" },
  { id: "HRT-72", employee: "David Kim", topic: "Benefits enrollment", status: "in-progress", sla: "on-track", updated: "1h ago" },
  { id: "HRT-73", employee: "Nora Haddad", topic: "PTO balance", status: "resolved", sla: "on-track", updated: "3h ago" },
  { id: "HRT-74", employee: "Tomás Silva", topic: "Equipment replacement", status: "open", sla: "warning", updated: "5h ago" },
];

export const employeeSupportStats = {
  slaMet: 95, // %
  csat: 4.6, // / 5
  knowledgeUsage: 68, // % of tickets self-served
};

/* ── Offboarding ──────────────────────────────────────────── */

export const offboardings: Offboarding[] = [
  { id: "OFB-9", employee: "Lucas Meyer", role: "Support Specialist", step: "asset-return", progress: 60, lastDay: "Jul 12" },
  { id: "OFB-10", employee: "Hannah Weber", role: "Marketing Associate", step: "knowledge-transfer", progress: 75, lastDay: "Jul 08" },
  { id: "OFB-11", employee: "Omar Farouk", role: "Sales Rep", step: "access-revocation", progress: 30, lastDay: "Jul 20" },
];
