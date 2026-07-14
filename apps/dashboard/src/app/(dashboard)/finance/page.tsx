import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandAction } from "@/components/command/command-action";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { AgentCard } from "@/features/agents/agent-card";
import { WorkflowCard } from "@/features/workflows/workflow-card";
import { ApprovalRow } from "@/features/approvals/approval-row";
import { agents } from "@/features/agents/mock";
import { financeWorkflows } from "@/features/workflows/mock";
import { financeEvents } from "@/features/finance/events";
import { financeOverview as f } from "@/features/finance/mock";
import { approvals } from "@/features/approvals/mock";
import { usdCompact } from "@/lib/format";

const financeApprovals = approvals.filter(
  (a) =>
    a.type.toLowerCase().includes("discount") ||
    a.type.toLowerCase().includes("deploy")
);

const kpis = [
  { label: "Monthly Revenue", value: usdCompact(f.monthlyRevenue) },
  { label: "Net Profit", value: usdCompact(f.netProfit) },
  { label: "Cash Balance", value: usdCompact(f.cashBalance) },
  { label: "Tax Compliance", value: `${f.taxComplianceScore}%` },
];

export default function FinancePage() {
  const financeAgents = agents.filter((a) => a.department === "Finance");

  return (
    <>
      <PageHeader
        title="Finance Center"
        context="Finance Department — the money layer of Hebun AI."
        action={
          <CommandAction
            label="Create Invoice"
            commandType="invoice.create"
            variant="outline"
            summary="Draft a new invoice — customer, line items, and due date."
          />
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* KPI row */}
        {kpis.map((kpi) => (
          <div key={kpi.label} className="col-span-6 xl:col-span-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  {kpi.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{kpi.value}</p>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Agents */}
        <div className="col-span-12">
          <h3 className="mb-3 text-sm font-semibold text-fg-secondary">
            Finance Department Agents
          </h3>
          <div className="grid grid-cols-12 gap-6">
            {financeAgents.map((agent) => (
              <div key={agent.id} className="col-span-12 sm:col-span-6 xl:col-span-3">
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        </div>

        {/* Events + approvals */}
        <div className="col-span-12 xl:col-span-7">
          <EventTimeline events={financeEvents} title="Recent Finance Events" />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <span className="text-xs tabular-nums text-fg-muted">
                {financeApprovals.length}
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {financeApprovals.length > 0 ? (
                financeApprovals.map((a) => <ApprovalRow key={a.id} approval={a} />)
              ) : (
                <p className="text-sm text-fg-muted">No finance approvals waiting.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workflows */}
        <div className="col-span-12">
          <h3 className="mb-3 text-sm font-semibold text-fg-secondary">
            Finance Workflows
          </h3>
          <div className="grid grid-cols-12 gap-6">
            {financeWorkflows.slice(0, 6).map((wf) => (
              <div key={wf.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
                <WorkflowCard workflow={wf} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
