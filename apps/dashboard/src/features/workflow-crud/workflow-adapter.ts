/*
 * Workflow CRUD — persistence adapter binding.
 */

import { getAdapter } from "@/features/persistence";
import { workflows as seededWorkflows, financeWorkflows } from "@/features/workflows/mock";
import type { WorkflowCrudRecord } from "./types";

const SEED_AT = "2026-01-01T00:00:00.000Z";

const workflowDepartments: Record<string, string> = {
  "Lead Qualifier Agent": "Sales",
  "Proposal Agent": "Sales",
  "SEO Agent": "Marketing",
  "Support Agent": "Operations",
  "Sales Agent": "Sales",
  "Invoice Agent": "Finance",
  "Payment Agent": "Finance",
  "Budget Agent": "Finance",
  "Expense Agent": "Finance",
  "Cash Flow Agent": "Finance",
  "Financial Analytics Agent": "Finance",
  "Tax Agent": "Finance",
};

const workflowCategories: Record<string, string> = {
  "Lead Qualification": "Lead Operations",
  "Proposal Preparation": "Sales Enablement",
  "Content Generation": "Marketing Automation",
  "Customer Support": "Support Automation",
  "Approval Review": "Governance Review",
  "Invoice Lifecycle": "Billing Operations",
  "Payment Verification": "Payment Operations",
  "Refund Approval": "Payment Operations",
  "Budget Monitoring": "Budget Controls",
  "Expense Approval": "Expense Controls",
  "Cash Flow Monitoring": "Treasury Monitoring",
  "Financial Analytics": "Finance Analytics",
  "Tax Validation": "Tax Controls",
  "Compliance Review": "Tax Compliance",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function seed(): WorkflowCrudRecord[] {
  return [...seededWorkflows, ...financeWorkflows].map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    slug: slugify(workflow.name),
    description: `${workflow.name} workflow triggered by ${workflow.trigger}.`,
    department: workflowDepartments[workflow.ownerAgent] ?? "Operations",
    category: workflowCategories[workflow.name] ?? "Workflow Automation",
    owner: workflow.ownerAgent,
    status: workflow.status,
    version: "v1.0.0",
    trigger: workflow.trigger,
    steps: [
      `Receive trigger: ${workflow.trigger}`,
      `Assign ${workflow.ownerAgent}`,
      "Execute workflow steps",
      "Record workflow outcome",
    ],
    assignedAgents: [workflow.ownerAgent],
    dependencies: [],
    approvalPolicy: workflow.status === "failed" ? "director-review" : "not-required",
    executionMode: workflow.status === "scheduled" ? "scheduled" : "event-driven",
    retryPolicy: workflow.status === "failed" ? "2 retries with escalation" : "1 retry",
    timeout: 900,
    runtime: "simulation",
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
    createdBy: "Seed",
    updatedBy: "Seed",
    lifecycleStatus: "active",
    ownerAgent: workflow.ownerAgent,
    successRate: workflow.successRate,
    runsToday: workflow.runsToday,
    lastRun: workflow.lastRun,
  }));
}

export const workflowAdapter = getAdapter<WorkflowCrudRecord>("workflows", seed);

export const subscribe = workflowAdapter.subscribe;
export const getSnapshot = workflowAdapter.getSnapshot;

export async function resetStore(): Promise<void> {
  await workflowAdapter.save(seed());
}
