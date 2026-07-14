import type { Approval } from "@/types";

export const approvals: Approval[] = [
  {
    id: "apr-001",
    title: "18% discount — Northwind deal",
    summary: "Negotiation Agent requests discount above the 10% autonomous limit.",
    requestedBy: "Negotiation Agent",
    type: "Big discount",
    risk: "high",
    createdAt: "9m ago",
  },
  {
    id: "apr-002",
    title: "Production deploy — dashboard v0.2.0",
    summary: "Deploy pending build to hebun.ai production on Vercel.",
    requestedBy: "GitHub → Vercel pipeline",
    type: "Production deploy",
    risk: "critical",
    createdAt: "14m ago",
  },
  {
    id: "apr-003",
    title: "New agent — Churn Prevention Agent",
    summary: "Support department requests a new agent with read access to customer data.",
    requestedBy: "Support Agent",
    type: "New agent",
    risk: "medium",
    createdAt: "1h ago",
  },
  {
    id: "apr-004",
    title: "Workflow change — Lead Qualification",
    summary: "Add auto-reject step for leads scoring below 20.",
    requestedBy: "Lead Qualifier Agent",
    type: "Workflow change",
    risk: "low",
    createdAt: "3h ago",
  },
];
