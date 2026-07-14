import type { SystemEvent } from "@/types";

/** Finance-domain events — surfaced in the Finance Center and Event Center. */
export const financeEvents: SystemEvent[] = [
  {
    id: "fe-01",
    type: "invoice.sent",
    source: "Invoice Agent",
    message: "Invoice INV-2047 sent to Fabrikam — $5,300 due Jul 18",
    severity: "info",
    timestamp: "just now",
  },
  {
    id: "fe-02",
    type: "payment.completed",
    source: "Payment Agent",
    message: "Wayne Corp payment PMT-905 completed — $31,500 received",
    severity: "success",
    timestamp: "8m ago",
  },
  {
    id: "fe-03",
    type: "budget.exceeded",
    source: "Budget Agent",
    message: "Marketing exceeded budget — 102% used, escalated to Director",
    severity: "error",
    timestamp: "40m ago",
  },
  {
    id: "fe-04",
    type: "payment.failed",
    source: "Payment Agent",
    message: "Initech ACH payment PMT-904 failed — retry scheduled",
    severity: "error",
    timestamp: "3h ago",
  },
  {
    id: "fe-05",
    type: "tax.validation.failed",
    source: "Tax Agent",
    message: "DE invoice batch failed VAT validation — Compliance Engine flagged",
    severity: "warning",
    timestamp: "2h ago",
  },
  {
    id: "fe-06",
    type: "cost.anomaly",
    source: "Financial Analytics Agent",
    message: "Infrastructure spend anomaly — +38% vs 7-day average",
    severity: "warning",
    timestamp: "3h ago",
  },
  {
    id: "fe-07",
    type: "invoice.paid",
    source: "Invoice Agent",
    message: "Invoice INV-2039 marked paid — Wayne Corp, $31,500",
    severity: "success",
    timestamp: "1h ago",
  },
  {
    id: "fe-08",
    type: "cashflow.warning",
    source: "Cash Flow Agent",
    message: "30-day forecast dips toward runway threshold — monitoring",
    severity: "warning",
    timestamp: "12m ago",
  },
];
