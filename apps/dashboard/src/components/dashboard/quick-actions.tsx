import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Workflow,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Plug,
} from "lucide-react";
import { ActionStateBadge, type ActionState } from "@/components/dashboard/action-state-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    label: "Create Agent",
    icon: Bot,
    state: "comingSoon" as ActionState,
    description: "Visible but intentionally disabled until live creation flows exist.",
  },
  {
    label: "New Workflow",
    icon: Workflow,
    href: "/workflows",
    state: "opensPage" as ActionState,
    description: "Routes to the workflow surface for inspection and setup.",
  },
  {
    label: "Review Approvals",
    icon: CheckCircle2,
    href: "/approvals",
    state: "opensPage" as ActionState,
    description: "Takes you to the current approval queue.",
  },
  {
    label: "Sync Integrations",
    icon: Plug,
    href: "/integrations",
    state: "simulation" as ActionState,
    description: "Inspection only. No real sync runs from the dashboard.",
  },
  {
    label: "Replay Event",
    icon: RefreshCw,
    href: "/events",
    state: "simulation" as ActionState,
    description: "Historical review only. Event replay is not live.",
  },
  {
    label: "Open Docs",
    icon: BookOpen,
    href: "/knowledge",
    state: "opensPage" as ActionState,
    description: "Opens the knowledge surface for deeper reference.",
  },
];

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          if (!action.href) {
            return (
              <button
                key={action.label}
                type="button"
                disabled
                className="flex min-h-32 cursor-not-allowed flex-col items-start gap-3 rounded-md border bg-surface-sunken p-4 text-left opacity-60"
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <Icon className="size-4 text-primary" />
                  <ActionStateBadge state={action.state} />
                </div>
                <div className="space-y-1">
                  <span className="block text-sm font-medium text-fg">{action.label}</span>
                  <p className="text-xs leading-5 text-fg-secondary">{action.description}</p>
                </div>
              </button>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex min-h-32 flex-col items-start gap-3 rounded-md border bg-surface-sunken p-4 text-left transition-colors duration-(--dur-fast) hover:border-border-strong hover:bg-surface-raised"
            >
              <div className="flex w-full items-start justify-between gap-3">
                <Icon className="size-4 text-primary" />
                <ActionStateBadge state={action.state} />
              </div>
              <div className="space-y-1">
                <span className="block text-sm font-medium text-fg">{action.label}</span>
                <p className="text-xs leading-5 text-fg-secondary">{action.description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                Open page
                <ArrowUpRight className="size-3.5" />
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
