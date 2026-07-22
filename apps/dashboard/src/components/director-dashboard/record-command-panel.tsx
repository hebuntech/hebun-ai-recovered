import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type {
  CommandAvailabilityState,
  CommandPresentation,
  RecordCommandView,
} from "@/features/director-command";

const availabilityVariant: Record<CommandAvailabilityState, BadgeVariant> = {
  available: "success",
  "approval-required": "warning",
  "permission-required": "neutral",
  disabled: "neutral",
  unsupported: "neutral",
};

const availabilityLabel: Record<CommandAvailabilityState, string> = {
  available: "Available",
  "approval-required": "Approval required",
  "permission-required": "Permission required",
  disabled: "Disabled",
  unsupported: "Unsupported",
};

const disabledReasonCopy: Record<string, string> = {
  NO_RECORD_STATUS: "This record reports no status, so the command cannot be assessed.",
  CAPABILITY_NOT_GRANTED: "The capability this command requires has not been granted.",
  INSUFFICIENT_PRIVILEGE: "A higher privilege level is required.",
  APPROVAL_REQUIRED: "A governance approval must clear first.",
};

function CommandRow({ command }: { readonly command: CommandPresentation }) {
  return (
    <div className="space-y-1.5 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-medium text-fg">{command.label}</p>
        <Badge variant={availabilityVariant[command.availability]}>
          {availabilityLabel[command.availability]}
        </Badge>
      </div>
      <dl className="grid gap-x-6 sm:grid-cols-2">
        {[
          { key: "category", label: "Category", value: command.category },
          { key: "capability", label: "Required capability", value: command.requiredCapability },
          { key: "privilege", label: "Required privilege", value: command.requiredPrivilege },
          { key: "approval", label: "Approval required", value: command.approvalRequired ? "Yes" : "No" },
        ].map((entry) => (
          <div key={entry.key} className="flex items-baseline justify-between gap-3 py-0.5">
            <dt className="text-[0.7rem] uppercase tracking-[0.12em] text-fg-muted">{entry.label}</dt>
            <dd className="min-w-0 truncate text-xs text-fg-secondary">{entry.value}</dd>
          </div>
        ))}
      </dl>
      {command.disabledReason ? (
        <p className="text-xs text-fg-muted">
          {disabledReasonCopy[command.disabledReason] ?? command.disabledReason}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Read-only command panel.
 *
 * Presentation only: it renders no button, link, menu, or interactive element,
 * carries no handler, and has no execution path. It describes what each
 * command would require if an executor existed.
 */
export function RecordCommandPanel({ view }: { readonly view: RecordCommandView }) {
  const headingId = `commands-${view.sectionId}-${view.recordId}`;

  return (
    <section aria-labelledby={headingId} className="space-y-2 border-t border-border pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={headingId} className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
          Commands
        </h3>
        <span className="text-xs text-fg-muted">
          {view.state === "unsupported"
            ? "None declared"
            : `${view.commands.length} declared`}
        </span>
      </div>

      {view.state === "unsupported" ? (
        <p className="text-sm text-fg-secondary">
          No commands are declared for {view.sectionId.replace(/-/g, " ")} records.
        </p>
      ) : (
        <>
          <div className="divide-y divide-border">
            {view.commands.map((command) => (
              <CommandRow key={command.commandId} command={command} />
            ))}
          </div>
          <p className="text-xs text-fg-muted">
            Commands are shown for reference only. None can be run: no executor exists yet.
          </p>
        </>
      )}
    </section>
  );
}
