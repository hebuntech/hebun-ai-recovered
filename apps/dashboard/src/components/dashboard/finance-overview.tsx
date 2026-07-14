import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usdCompact } from "@/lib/format";
import { financeOverview as f } from "@/features/finance/mock";

export function FinanceOverview() {
  const metrics = [
    { label: "Monthly Revenue", value: usdCompact(f.monthlyRevenue), intent: "up" },
    { label: "Monthly Expenses", value: usdCompact(f.monthlyExpenses), intent: "flat" },
    { label: "Net Profit", value: usdCompact(f.netProfit), intent: "up" },
    { label: "Gross Margin", value: `${f.grossMargin}%`, intent: "up" },
    { label: "Cash Balance", value: usdCompact(f.cashBalance), intent: "flat" },
    { label: "Outstanding Invoices", value: usdCompact(f.outstandingInvoices), intent: "flat" },
    { label: "Overdue Payments", value: usdCompact(f.overduePayments), intent: "bad" },
    { label: "Budget Usage", value: `${f.budgetUsage}%`, intent: "flat" },
    { label: "Tax Compliance", value: `${f.taxComplianceScore}%`, intent: "up" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Overview</CardTitle>
        <span className="text-xs text-fg-muted">Finance Department · this month</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              {m.label}
            </p>
            <p
              className={cn(
                "mt-1 text-xl font-bold tabular-nums",
                m.intent === "bad" && "text-error"
              )}
            >
              {m.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
