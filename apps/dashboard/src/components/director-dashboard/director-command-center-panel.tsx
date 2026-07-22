import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { DirectorCommandCenterModel } from "@/features/director-command";

const riskVariant: Record<string, BadgeVariant> = {
  informational: "info", low: "success", medium: "warning", high: "error", critical: "error",
};

const readinessVariant: Record<string, BadgeVariant> = {
  not_ready: "neutral", accepted: "success", blocked: "warning", rejected: "error", not_implemented: "neutral",
};

/** Read-only integration surface for the immutable Command Center model. */
export function DirectorCommandCenterPanel({ model }: { readonly model: DirectorCommandCenterModel }) {
  const headingId = `command-center-${model.record.sectionId}-${model.record.recordId}`;
  return (
    <section aria-labelledby={headingId} className="space-y-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={headingId} className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">Command Center</h3>
        <span className="text-xs text-fg-muted">{model.auditTimeline.entries.length} immutable audit events</span>
      </div>
      {model.commands.length === 0 ? (
        <p className="text-sm text-fg-secondary">No command metadata is declared for this record.</p>
      ) : (
        <div className="divide-y divide-border">
          {model.commands.map((command) => (
            <article key={command.presentation.commandId} className="space-y-2 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-fg">{command.presentation.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={riskVariant[command.safety.riskLevel]}>{command.safety.riskLevel} risk</Badge>
                  <Badge variant={readinessVariant[command.executionReadiness]}>{command.executionReadiness.replace(/_/g, " ")}</Badge>
                </div>
              </div>
              <dl className="grid gap-x-6 sm:grid-cols-2">
                {[
                  { key: "effect", label: "Estimated effect", value: command.safety.estimatedEffect },
                  { key: "rollback", label: "Rollback", value: command.safety.rollbackAvailability },
                  { key: "audit", label: "Audit required", value: command.safety.auditRequired ? "Yes" : "No" },
                  { key: "confirmation", label: "Confirmation", value: command.confirmation.title },
                ].map((entry) => (
                  <div key={entry.key} className="flex items-baseline justify-between gap-3 py-0.5">
                    <dt className="text-[0.7rem] uppercase tracking-[0.12em] text-fg-muted">{entry.label}</dt>
                    <dd className="min-w-0 truncate text-xs text-fg-secondary">{entry.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-fg-muted">{command.confirmation.warningText}</p>
              {command.executionResult && "error" in command.executionResult ? (
                <p className="text-xs text-fg-muted">Execution result: {command.executionResult.error.code}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
      <p className="text-xs text-fg-muted">Read-only orchestration: no command can be executed from this dashboard.</p>
    </section>
  );
}
