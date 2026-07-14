import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/director/progress-bar";
import { orgStatusVariant, healthTone } from "@/components/organization/org-tokens";
import {
  agentsForDepartment,
  orgExecutionFlows,
  departmentName,
  type OrgDepartment,
} from "@/features/organization/mock";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">{title}</h3>
      {children}
    </div>
  );
}

export function DepartmentDrawerContent({ dept }: { dept: OrgDepartment }) {
  const agents = agentsForDepartment(dept.id);
  const flows = orgExecutionFlows.filter((f) => f.path.includes(dept.id));
  const kpis = [
    { label: "Health", value: `${dept.health}` },
    { label: "Capacity", value: `${dept.capacity}%` },
    { label: "Efficiency", value: `${dept.efficiency}` },
    { label: "Risk", value: `${dept.risk}` },
    { label: "Running", value: `${dept.runningTasks}` },
    { label: "Waiting", value: `${dept.waitingTasks}` },
    { label: "Done today", value: `${dept.completedToday}` },
    { label: "Approvals", value: `${dept.humanApprovals}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Section title="Status">
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-bold tabular-nums", healthTone(dept.health))}>{dept.health}</span>
          <Badge variant={orgStatusVariant[dept.status]}>{dept.status}</Badge>
          <span className="text-xs text-fg-muted capitalize">{dept.workload} load · {dept.avgResponseTime} avg</span>
        </div>
      </Section>

      <Section title="Department KPIs">
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs text-fg-muted">{k.label}</p>
              <p className="text-sm font-semibold tabular-nums text-fg">{k.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Trends">
        {[
          { label: "Learning", value: dept.learning },
          { label: "Governance", value: dept.governance },
          { label: "Execution", value: dept.execution },
        ].map((t) => (
          <div key={t.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-fg-secondary">{t.label}</span>
              <span className="font-medium tabular-nums text-fg">{t.value}</span>
            </div>
            <ProgressBar value={t.value} />
          </div>
        ))}
      </Section>

      <Section title="Current Executions / Workflows">
        {flows.length ? (
          <ul className="flex flex-col gap-2">
            {flows.map((f) => (
              <li key={f.id} className="rounded-md border bg-surface-sunken p-3">
                <p className="text-sm font-medium text-fg">{f.name}</p>
                <p className="text-xs text-fg-muted">
                  {f.path.map((p) => departmentName[p]).join(" → ")} · {f.status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-fg-muted">no active flows</span>
        )}
      </Section>

      <Section title="Agents">
        <ul className="flex flex-col gap-1.5">
          {agents.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm">
              <span className="text-fg">{a.name}</span>
              <span className="text-xs text-fg-muted">{a.currentTask}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
