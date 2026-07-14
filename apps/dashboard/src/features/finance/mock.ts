import type {
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  Budget,
  Expense,
  FinanceAlert,
} from "@/types";

/* ── High-level KPIs (Finance Overview widget) ────────────── */

export const financeOverview = {
  monthlyRevenue: 184200,
  monthlyExpenses: 121800,
  netProfit: 62400,
  grossMargin: 66.1, // %
  cashBalance: 342500,
  outstandingInvoices: 48200,
  overduePayments: 9600,
  budgetUsage: 71, // %
  taxComplianceScore: 94, // %
};

/* ── Cash Flow panel ──────────────────────────────────────── */

export const cashFlow = {
  currentCash: 342500,
  forecast7d: 318000,
  forecast30d: 296400,
  forecast90d: 254900,
  dailyBurn: 3900,
  runwayMonths: 29,
  liquidityRisk: "low" as "low" | "medium" | "high",
};

/* ── Budget panel ─────────────────────────────────────────── */

export const budgetSummary = {
  total: 480000,
  used: 341000,
  remaining: 139000,
  usagePercent: 71,
  departmentsOverBudget: 1,
  forecastExhaustion: "Nov 2026",
};

export const budgets: Budget[] = [
  { id: "bdg-sales", department: "Sales", total: 160000, used: 118400, forecastExhaustion: "Oct 2026" },
  { id: "bdg-ops", department: "Operations", total: 120000, used: 74200, forecastExhaustion: "Jan 2027" },
  { id: "bdg-marketing", department: "Marketing", total: 90000, used: 91500, forecastExhaustion: "Overspent" },
  { id: "bdg-research", department: "Research", total: 70000, used: 38900, forecastExhaustion: "Feb 2027" },
  { id: "bdg-finance", department: "Finance", total: 40000, used: 18000, forecastExhaustion: "Mar 2027" },
];

/* ── Finance alerts ───────────────────────────────────────── */

export const financeAlerts: FinanceAlert[] = [
  {
    id: "fa-01",
    kind: "cash-flow",
    title: "Cash Flow Warning",
    detail: "30-day forecast dips below 3-month runway threshold.",
    severity: "warning",
    timestamp: "12m ago",
  },
  {
    id: "fa-02",
    kind: "budget",
    title: "Budget Exceeded — Marketing",
    detail: "Marketing spent 102% of its allocated budget.",
    severity: "error",
    timestamp: "40m ago",
  },
  {
    id: "fa-03",
    kind: "payment",
    title: "Payment Overdue",
    detail: "Invoice #INV-2043 payment is 6 days overdue ($9,600).",
    severity: "error",
    timestamp: "1h ago",
  },
  {
    id: "fa-04",
    kind: "tax",
    title: "Tax Validation Failed",
    detail: "VAT rate mismatch on DE invoice batch — needs review.",
    severity: "warning",
    timestamp: "2h ago",
  },
  {
    id: "fa-05",
    kind: "cost-anomaly",
    title: "Cost Anomaly Detected",
    detail: "Infrastructure spend up 38% vs 7-day average.",
    severity: "warning",
    timestamp: "3h ago",
  },
];

/* ── Invoices ─────────────────────────────────────────────── */

export const invoiceStatuses: InvoiceStatus[] = [
  "draft",
  "review",
  "approved",
  "issued",
  "sent",
  "paid",
  "archived",
];

export const invoices: Invoice[] = [
  { id: "INV-2051", customer: "Acme GmbH", amount: 14200, status: "draft", issued: "—", due: "—" },
  { id: "INV-2050", customer: "Northwind", amount: 8600, status: "review", issued: "—", due: "Jul 20" },
  { id: "INV-2049", customer: "Globex", amount: 22400, status: "approved", issued: "Jul 03", due: "Jul 25" },
  { id: "INV-2048", customer: "Contoso Ltd", amount: 12400, status: "issued", issued: "Jul 02", due: "Jul 22" },
  { id: "INV-2047", customer: "Fabrikam", amount: 5300, status: "sent", issued: "Jul 01", due: "Jul 18" },
  { id: "INV-2043", customer: "Initech", amount: 9600, status: "sent", issued: "Jun 24", due: "Jun 27" },
  { id: "INV-2039", customer: "Wayne Corp", amount: 31500, status: "paid", issued: "Jun 20", due: "Jun 30" },
  { id: "INV-2012", customer: "Stark Industries", amount: 18800, status: "archived", issued: "May 12", due: "May 22" },
];

export function invoiceCount(status: InvoiceStatus): number {
  return invoices.filter((i) => i.status === status).length;
}

/* ── Payments ─────────────────────────────────────────────── */

export const paymentStatuses: PaymentStatus[] = [
  "pending",
  "processing",
  "verified",
  "completed",
  "failed",
  "refunded",
];

export const payments: Payment[] = [
  { id: "PMT-908", counterparty: "Globex", amount: 22400, method: "Wire", status: "pending", updated: "2m ago" },
  { id: "PMT-907", counterparty: "Contoso Ltd", amount: 12400, method: "Card", status: "processing", updated: "9m ago" },
  { id: "PMT-906", counterparty: "Fabrikam", amount: 5300, method: "Card", status: "verified", updated: "26m ago" },
  { id: "PMT-905", counterparty: "Wayne Corp", amount: 31500, method: "Wire", status: "completed", updated: "1h ago" },
  { id: "PMT-904", counterparty: "Initech", amount: 9600, method: "ACH", status: "failed", updated: "3h ago" },
  { id: "PMT-901", counterparty: "Umbrella Co", amount: 4200, method: "Card", status: "refunded", updated: "yesterday" },
];

export function paymentCount(status: PaymentStatus): number {
  return payments.filter((p) => p.status === status).length;
}

/* ── Expenses ─────────────────────────────────────────────── */

export const expenses: Expense[] = [
  { id: "EXP-514", vendor: "Vercel", category: "Infrastructure", department: "Finance", amount: 640, approval: "approved", budgetImpact: "+0.5% Finance", date: "Jul 03" },
  { id: "EXP-513", vendor: "OpenAI", category: "AI / Model", department: "Operations", amount: 1820, approval: "approved", budgetImpact: "+1.5% Ops", date: "Jul 03" },
  { id: "EXP-512", vendor: "LinkedIn Ads", category: "Marketing", department: "Marketing", amount: 3400, approval: "pending", budgetImpact: "over budget", date: "Jul 02" },
  { id: "EXP-511", vendor: "Notion", category: "Software", department: "Sales", amount: 210, approval: "approved", budgetImpact: "+0.1% Sales", date: "Jul 02" },
  { id: "EXP-510", vendor: "AWS", category: "Infrastructure", department: "Research", amount: 980, approval: "approved", budgetImpact: "+1.4% Research", date: "Jul 01" },
  { id: "EXP-509", vendor: "Unknown SaaS", category: "Uncategorized", department: "Operations", amount: 1250, approval: "rejected", budgetImpact: "flagged anomaly", date: "Jun 30" },
];

export const expenseCategories = [
  "Infrastructure",
  "AI / Model",
  "Marketing",
  "Software",
  "Uncategorized",
];

/* ── Cash Flow center ─────────────────────────────────────── */

export const incomingPayments = payments.filter(
  (p) => p.status === "pending" || p.status === "processing" || p.status === "verified"
);

export const outgoingPayments = expenses.slice(0, 4);

export const cashFlowScenarios = [
  { id: "sc-base", name: "Base case", runway: "29 months", note: "Current burn, expected renewals" },
  { id: "sc-growth", name: "Growth", runway: "18 months", note: "2× hiring, higher infra spend" },
  { id: "sc-downside", name: "Downside", runway: "22 months", note: "20% churn, delayed payments" },
];

/* ── Analytics center ─────────────────────────────────────── */

export const revenueTrend = [
  { month: "Feb", revenue: 142000 },
  { month: "Mar", revenue: 151000 },
  { month: "Apr", revenue: 158500 },
  { month: "May", revenue: 167200 },
  { month: "Jun", revenue: 176400 },
  { month: "Jul", revenue: 184200 },
];

export const profitByDepartment = [
  { department: "Sales", profit: 41200 },
  { department: "Operations", profit: 12800 },
  { department: "Research", profit: 4600 },
  { department: "Marketing", profit: 3800 },
];

/* ── Tax & Compliance center ──────────────────────────────── */

export const taxCompliance = {
  score: 94,
  auditRisk: "low" as "low" | "medium" | "high",
  reportsReady: 3,
  countries: [
    { country: "Türkiye (TR)", status: "compliant" as const, note: "KDV up to date" },
    { country: "Germany (DE)", status: "warning" as const, note: "VAT rate mismatch on 1 batch" },
    { country: "United States (US)", status: "compliant" as const, note: "Sales tax nexus tracked" },
    { country: "United Kingdom (UK)", status: "compliant" as const, note: "VAT filed Q2" },
  ],
};
