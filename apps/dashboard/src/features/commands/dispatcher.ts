/*
 * Command Dispatcher.
 *
 * Generic and deterministic. Accepts a command, then runs the full offline
 * lifecycle: create → id → timestamp → context → validation → policy →
 * authorization → queue → approval → simulation → audit → telemetry → history →
 * result. Behavior per command comes from the registry, never hardcoded here.
 *
 * Nothing executes. No providers, no database, no mutation of business data.
 */

import "./registry";
import { getCommandDefinition } from "./registry";
import { recordCommand, getHistoryCount } from "./history";
import type { CommandType } from "./pipeline";
import type {
  Command,
  CommandSource,
  LifecycleEntry,
  StageResult,
  StageStatus,
} from "./types";

let sequence = 0;

function nextSequence(): number {
  sequence += 1;
  return sequence;
}

function pad(n: number): string {
  return String(n).padStart(5, "0");
}

export interface DispatchInput {
  commandType: CommandType;
  payload?: Record<string, unknown>;
  actor?: string;
  source?: CommandSource;
  route?: string;
}

/* Per-stage deterministic cost (ms) used to derive telemetry. */
const STAGE_COST_MS = 3;

export function dispatchCommand(input: DispatchInput): Command {
  const seq = nextSequence();
  const id = `cmd_${pad(seq)}`;
  const traceId = `trace_${pad(seq)}`;
  const timestamp = new Date().toISOString();
  const at = timestamp;
  const source: CommandSource = input.source ?? "ui";
  const actor = input.actor ?? "Director";
  const payload = input.payload ?? {};

  const def = getCommandDefinition(input.commandType);
  const lifecycle: LifecycleEntry[] = [];
  const log = (stage: string, status: StageStatus | "done", detail: string) =>
    lifecycle.push({ stage, status, detail, at });

  log("create", "done", `Command ${id} created.`);
  log("id", "done", `Assigned ${id}.`);
  log("timestamp", "done", timestamp);
  log("context", "done", `Offline context via ${source}.`);

  // Validation
  const validationResult: StageResult = def
    ? def.validate(payload)
    : { status: "failed", detail: `No command registered for "${input.commandType}".` };
  log("validation", validationResult.status, validationResult.detail);

  // Policy
  const policyResult: StageResult = def
    ? { status: "passed", detail: "Deterministic policy check passed (offline)." }
    : { status: "skipped", detail: "Policy skipped — command not registered." };
  log("policy", policyResult.status, policyResult.detail);

  // Authorization
  const authorizationResult: StageResult = def
    ? { status: "passed", detail: `Actor "${actor}" authorized for ${def.domain}.` }
    : { status: "skipped", detail: "Authorization skipped — command not registered." };
  log("authorization", authorizationResult.status, authorizationResult.detail);

  // Queue
  log("queue", "done", "Enqueued on the offline command queue.");

  // Approval
  const requiresApproval = def?.requiresApproval ?? false;
  const approvalState = requiresApproval ? "pending" : "not-required";
  log(
    "approval",
    requiresApproval ? "passed" : "skipped",
    requiresApproval
      ? "Routed to the Director / governance approval gate."
      : "Approval not required for this command."
  );

  // Simulation
  const sim = def?.simulate(payload) ?? { result: "No simulation available.", steps: [] };
  const simulationState = { status: "simulated" as const, result: sim.result, steps: sim.steps };
  log("simulation", "done", "Executed deterministic offline simulation.");

  // Audit
  const auditRecord = {
    recorded: true,
    at,
    entry: `${input.commandType} simulated by ${actor} via ${source} (${id}).`,
  };
  log("audit", "done", auditRecord.entry);

  // Telemetry
  const telemetry = {
    stages: lifecycle.length + 1,
    durationMs: (lifecycle.length + 1) * STAGE_COST_MS,
    offline: true as const,
  };
  log("telemetry", "done", `${telemetry.stages} stages, ${telemetry.durationMs}ms (offline).`);

  const command: Command = {
    id,
    traceId,
    commandType: input.commandType,
    source,
    actor,
    timestamp,
    context: { environment: "offline", source, route: input.route },
    payload,
    validationResult,
    policyResult,
    authorizationResult,
    approvalState,
    simulationState,
    auditRecord,
    telemetry,
    lifecycle,
    status: validationResult.status === "failed" ? "failed" : "simulated",
  };

  // History
  recordCommand(command);
  log("history", "done", `Recorded to history (position ${getHistoryCount()}).`);

  return command;
}
