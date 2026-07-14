import { cn } from "@/lib/utils";
import type { AgentStatus, WorkflowStatus, IntegrationStatus } from "@/types";

type Status = AgentStatus | WorkflowStatus | IntegrationStatus;

const statusConfig: Record<Status, { label: string; dot: string; text: string }> = {
  running: { label: "Running", dot: "bg-success", text: "text-success" },
  idle: { label: "Idle", dot: "bg-fg-muted", text: "text-fg-secondary" },
  paused: { label: "Paused", dot: "bg-warning", text: "text-warning" },
  error: { label: "Error", dot: "bg-error", text: "text-error" },
  failed: { label: "Failed", dot: "bg-error", text: "text-error" },
  scheduled: { label: "Scheduled", dot: "bg-info", text: "text-info" },
  connected: { label: "Connected", dot: "bg-success", text: "text-success" },
  pending: { label: "Pending", dot: "bg-warning", text: "text-warning" },
  syncing: { label: "Syncing", dot: "bg-info", text: "text-info" },
};

interface StatusBadgeProps extends React.ComponentProps<"span"> {
  status: Status;
  pulse?: boolean;
}

function StatusBadge({ status, pulse, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        config.text,
        className
      )}
      {...props}
    >
      <span className="relative flex size-2">
        {pulse && status === "running" && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              config.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex size-2 rounded-full", config.dot)} />
      </span>
      {config.label}
    </span>
  );
}

export { StatusBadge };
