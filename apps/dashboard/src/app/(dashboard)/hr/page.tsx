import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CommandAction } from "@/components/command/command-action";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { AgentCard } from "@/features/agents/agent-card";
import { agents } from "@/features/agents/mock";
import { hrEvents } from "@/features/hr/events";
import { hrOverview as h } from "@/features/hr/mock";

const kpis = [
  { label: "Open Positions", value: `${h.openPositions}` },
  { label: "Candidates", value: `${h.candidates}` },
  { label: "Active Interviews", value: `${h.activeInterviews}` },
  { label: "Employee Satisfaction", value: `${h.employeeSatisfaction}%` },
];

export default function HrPage() {
  const hrAgents = agents.filter((a) => a.department === "HR");

  return (
    <>
      <PageHeader
        title="HR Center"
        context="HR Department — recruiting, people ops, and the employee lifecycle."
        action={
          <CommandAction
            label="Post a Job"
            commandType="job.post"
            variant="outline"
            summary="Open a new role — title, department, and hiring pipeline."
          />
        }
      />

      <div className="grid grid-cols-12 gap-6">
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

        <div className="col-span-12">
          <h3 className="mb-3 text-sm font-semibold text-fg-secondary">
            HR Department Agents
          </h3>
          <div className="grid grid-cols-12 gap-6">
            {hrAgents.map((agent) => (
              <div key={agent.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12">
          <EventTimeline events={hrEvents} title="Recent HR Events" />
        </div>
      </div>
    </>
  );
}
