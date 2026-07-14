"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Drawer } from "@/components/organization/drawer";
import { commandStages, type CommandType } from "@/features/commands/pipeline";
import { dispatchCommand } from "@/features/commands/dispatcher";
import { getHistoryCount } from "@/features/commands/history";
import type { Command, StageStatus, ApprovalState } from "@/features/commands/types";

type ButtonVariant = "primary" | "outline" | "ghost" | "success" | "danger";
type ButtonSize = "sm" | "md";

interface CommandActionProps {
  /** Button label, e.g. "Create Agent". */
  label: string;
  /** The command this action dispatches through the Command Bus. */
  commandType: CommandType;
  /** Drawer heading. Defaults to the label. */
  title?: string;
  /** One line describing what the command does. */
  summary: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  className?: string;
}

const stageVariant: Record<StageStatus | "done", BadgeVariant> = {
  passed: "success",
  done: "success",
  failed: "error",
  skipped: "neutral",
};

const approvalVariant: Record<ApprovalState, BadgeVariant> = {
  "not-required": "neutral",
  pending: "warning",
  approved: "success",
  rejected: "error",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-fg">{children}</span>
    </div>
  );
}

/*
 * Primary action wired to the Command Bus. Opening the drawer previews the
 * lifecycle; dispatching runs the real deterministic offline pipeline and
 * renders the resulting Command object — id, lifecycle, validation, approval,
 * simulation, audit, telemetry and its position in history. Nothing executes.
 */
export function CommandAction({
  label,
  commandType,
  title,
  summary,
  variant = "primary",
  size = "md",
  icon,
  className,
}: CommandActionProps) {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState<Command | null>(null);

  function close() {
    setOpen(false);
    setCommand(null);
  }

  function dispatch() {
    setCommand(
      dispatchCommand({
        commandType,
        payload: { label },
        actor: "Director",
        source: "ui",
        route: typeof window !== "undefined" ? window.location.pathname : undefined,
      })
    );
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {icon}
        {label}
      </Button>

      <Drawer
        open={open}
        onClose={close}
        title={title ?? label}
        subtitle={command ? `Command · ${command.id}` : `Command · ${commandType}`}
      >
        {command ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info" className="w-fit">
                {command.status}
              </Badge>
              <Badge variant={approvalVariant[command.approvalState]}>
                approval: {command.approvalState}
              </Badge>
              <Badge variant="neutral">offline simulation</Badge>
            </div>

            <div className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-4">
              <Row label="Command ID">
                <span className="font-mono">{command.id}</span>
              </Row>
              <Row label="Trace ID">
                <span className="font-mono">{command.traceId}</span>
              </Row>
              <Row label="Type">
                <span className="font-mono">{command.commandType}</span>
              </Row>
              <Row label="Actor">{command.actor}</Row>
              <Row label="Source">{command.source}</Row>
              <Row label="Timestamp">
                <span className="tabular-nums">{command.timestamp}</span>
              </Row>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                Validation, policy & authorization
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Validation", r: command.validationResult },
                  { label: "Policy", r: command.policyResult },
                  { label: "Authorization", r: command.authorizationResult },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-fg">{item.label}</p>
                      <p className="text-sm leading-6 text-fg-secondary">{item.r.detail}</p>
                    </div>
                    <Badge variant={stageVariant[item.r.status]}>{item.r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                Simulation result
              </p>
              <p className="text-sm leading-6 text-fg-secondary">{command.simulationState.result}</p>
              <ol className="mt-1 flex flex-col gap-2">
                {command.simulationState.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-semibold tabular-nums text-fg-secondary">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-6 text-fg-secondary">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                Lifecycle
              </p>
              <div className="flex flex-col gap-1.5">
                {command.lifecycle.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-mono text-fg-secondary">{entry.stage}</span>
                    <Badge variant={stageVariant[entry.status]}>{entry.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-4">
              <Row label="Audit">{command.auditRecord.recorded ? "recorded" : "—"}</Row>
              <Row label="Telemetry">
                <span className="tabular-nums">
                  {command.telemetry.stages} stages · {command.telemetry.durationMs}ms
                </span>
              </Row>
              <Row label="History">
                <span className="tabular-nums">{getHistoryCount()} commands</span>
              </Row>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setCommand(null)} className="w-full justify-center">
                Dispatch another
              </Button>
              <p className="text-xs leading-5 text-fg-muted">
                Deterministic offline simulation. No provider, database, or business data was
                touched.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Badge variant="info" className="w-fit">
                Offline · Simulation
              </Badge>
              <p className="text-sm leading-6 text-fg-secondary">{summary}</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                Command pipeline
              </p>
              <ol className="mt-2 flex flex-col gap-3">
                {commandStages.map((stage, i) => (
                  <li key={stage.id} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-semibold tabular-nums text-fg-secondary">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-fg">{stage.label}</p>
                      <p className="text-sm leading-6 text-fg-secondary">{stage.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              <Button variant="primary" onClick={dispatch} className="w-full justify-center">
                Dispatch command
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-xs leading-5 text-fg-muted">
                Dispatch runs the deterministic offline Command Bus — validation, policy,
                authorization, queue, approval, simulation, audit and telemetry. Nothing is
                executed or persisted.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
