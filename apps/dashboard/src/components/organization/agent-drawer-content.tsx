import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/director/progress-bar";
import { agentStatusConfig, healthTone } from "@/components/organization/org-tokens";
import { departmentName, type OrgAgent } from "@/features/organization/mock";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">{title}</h3>
      {children}
    </div>
  );
}

const outcomeTone: Record<OrgAgent["executionHistory"][number]["outcome"], string> = {
  success: "text-success",
  failed: "text-error",
  running: "text-info",
};

export function AgentDrawerContent({ agent }: { agent: OrgAgent }) {
  const st = agentStatusConfig[agent.status];
  return (
    <div className="flex flex-col gap-6">
      <Section title="Profile">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-subtle text-sm font-semibold text-primary">
            {agent.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold text-fg">{agent.name}</p>
            <p className="text-xs text-fg-secondary">{departmentName[agent.department]}</p>
          </div>
          <span className={cn("ml-auto inline-flex items-center gap-1.5 text-xs font-medium", st.text)}>
            <span className={cn("size-1.5 rounded-full", st.dot)} />
            {st.label}
          </span>
        </div>
      </Section>

      <Section title="Current Goal">
        <p className="text-sm text-fg-secondary">{agent.currentGoal}</p>
      </Section>

      <Section title="Current Execution">
        <p className="text-sm text-fg">{agent.currentTask}</p>
        <p className="text-xs text-fg-muted">queue {agent.queueSize} · last activity {agent.lastActivity}</p>
      </Section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="text-xs text-fg-muted">Capability</p>
          <p className="text-sm font-medium text-fg">{agent.capability}</p>
        </div>
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="text-xs text-fg-muted">Model</p>
          <p className="text-sm font-medium text-fg">{agent.model}</p>
        </div>
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="text-xs text-fg-muted">Response Time</p>
          <p className="text-sm font-medium tabular-nums text-fg">{agent.responseTime}</p>
        </div>
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="text-xs text-fg-muted">Health</p>
          <p className={cn("text-sm font-semibold tabular-nums", healthTone(agent.health))}>{agent.health}</p>
        </div>
      </div>

      <Section title="Confidence">
        <div className="flex items-center justify-between text-xs">
          <span className="text-fg-muted">decision confidence</span>
          <span className="font-medium tabular-nums text-fg-secondary">{agent.confidence}%</span>
        </div>
        <ProgressBar value={agent.confidence} />
      </Section>

      <Section title="Memory Usage">
        <div className="flex items-center justify-between text-xs">
          <span className="text-fg-muted">working memory</span>
          <span className="font-medium tabular-nums text-fg-secondary">{agent.memoryUsage}%</span>
        </div>
        <ProgressBar value={agent.memoryUsage} />
      </Section>

      <Section title="Running Tools">
        <div className="flex flex-wrap gap-2">
          {agent.runningTools.length ? (
            agent.runningTools.map((t) => <Badge key={t} variant="info">{t}</Badge>)
          ) : (
            <span className="text-xs text-fg-muted">none</span>
          )}
        </div>
      </Section>

      <Section title="Recent Decisions">
        <ul className="flex flex-col gap-1.5">
          {agent.recentDecisions.map((d, i) => (
            <li key={i} className="text-sm text-fg-secondary">• {d}</li>
          ))}
        </ul>
      </Section>

      <Section title="Execution History">
        <ul className="flex flex-col gap-1.5">
          {agent.executionHistory.length ? (
            agent.executionHistory.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-fg-muted">{e.id}</span>
                <span className={cn("font-medium capitalize", outcomeTone[e.outcome])}>{e.outcome}</span>
                <span className="text-xs text-fg-muted">{e.when}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-fg-muted">no recent runs</li>
          )}
        </ul>
      </Section>
    </div>
  );
}
