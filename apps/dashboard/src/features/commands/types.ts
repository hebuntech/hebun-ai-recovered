/*
 * Command Bus — object model.
 *
 * Every primary action in the platform produces exactly one Command that flows
 * through a fixed deterministic lifecycle. Execution stays offline: commands are
 * validated, authorized, queued, simulated, audited and recorded — never sent to
 * a provider, database, or runtime.
 */

import type { CommandType } from "./pipeline";

export type CommandSource = "ui" | "voice" | "system" | "scheduler" | "api";

export type CommandStatus =
  | "queued"
  | "running"
  | "completed"
  | "cancelled"
  | "failed"
  | "simulated";

export type ApprovalState = "not-required" | "pending" | "approved" | "rejected";

export type StageStatus = "passed" | "failed" | "skipped";

export interface StageResult {
  status: StageStatus;
  detail: string;
}

export interface LifecycleEntry {
  stage: string;
  status: StageStatus | "done";
  detail: string;
  at: string;
}

export interface SimulationState {
  status: "simulated" | "skipped";
  result: string;
  steps: string[];
}

export interface AuditRecord {
  recorded: boolean;
  at: string;
  entry: string;
}

export interface Telemetry {
  stages: number;
  durationMs: number;
  offline: true;
}

export interface CommandContext {
  environment: "offline";
  source: CommandSource;
  route?: string;
}

export interface Command {
  id: string;
  traceId: string;
  commandType: CommandType;
  source: CommandSource;
  actor: string;
  timestamp: string;
  context: CommandContext;
  payload: Record<string, unknown>;
  validationResult: StageResult;
  policyResult: StageResult;
  authorizationResult: StageResult;
  approvalState: ApprovalState;
  simulationState: SimulationState;
  auditRecord: AuditRecord;
  telemetry: Telemetry;
  lifecycle: LifecycleEntry[];
  status: CommandStatus;
}
