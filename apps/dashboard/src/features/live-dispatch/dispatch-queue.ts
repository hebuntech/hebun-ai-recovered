/*
 * Live Dispatch — queue construction.
 *
 * Turns accepted (READY) simulated commands into ordered, positioned queue
 * entries in the initial `queued` state. Order is preserved verbatim from the
 * deterministic execution order, so queue positions are stable. The terminal
 * state each command will settle into is decided here (deterministically from
 * the simulation), and the runner advances the lifecycle to reach it.
 */

import type { SimulatedExecutionCommand } from "@/features/execution-engine";
import type { DispatchTraceability, QueueState } from "./types";

/** Internal hand-off shape between queue construction and the runner. */
export interface PreparedDispatch {
  dispatchId: string;
  commandId: string;
  commandType: string;
  commandLabel: string;
  title: string;
  agentId: string;
  agentName: string;
  priority: SimulatedExecutionCommand["priority"];
  queuePosition: number;
  estimatedDuration: number;
  /** Deterministic settled state the runner will drive this command to. */
  terminalState: QueueState;
  traceability: DispatchTraceability;
}

function pad(n: number): string {
  return String(n).padStart(4, "0");
}

/** Deterministic terminal state for an accepted command. */
function terminalStateFor(item: SimulatedExecutionCommand): QueueState {
  if (item.failureReasons.length > 0) return "failed";
  if (item.state === "cancelled") return "cancelled";
  return "completed";
}

export function buildDispatchQueue(
  acceptedItems: SimulatedExecutionCommand[],
  agentId: string,
  agentName: string,
  traceFn: (item: SimulatedExecutionCommand, agentId: string) => DispatchTraceability
): PreparedDispatch[] {
  return acceptedItems.map((item, index) => {
    const position = index + 1;
    return {
      dispatchId: `dsp_${agentId}_${pad(position)}`,
      commandId: item.commandId,
      commandType: item.commandType,
      commandLabel: item.commandLabel,
      title: item.title,
      agentId,
      agentName,
      priority: item.priority,
      queuePosition: position,
      estimatedDuration: item.estimatedDuration,
      terminalState: terminalStateFor(item),
      traceability: traceFn(item, agentId),
    };
  });
}
