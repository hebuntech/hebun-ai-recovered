import type { AdapterEvent, AdapterEventType } from "@/features/adapters/types";

export const adapterEventTypes: AdapterEventType[] = [
  "Adapter Registered",
  "Adapter Loaded",
  "Adapter Ready",
  "Execution Started",
  "Execution Progress",
  "Execution Completed",
  "Execution Failed",
  "Execution Cancelled",
  "Health Changed",
  "Telemetry Updated",
];

let seq = 0;
function nextId(): string {
  seq += 1;
  return `ae-${seq}`;
}

/** deterministic event factory — the SDK event bridge future providers emit to */
export function makeEvent(type: AdapterEventType, adapterId: string, summary: string, timestamp: string): AdapterEvent {
  return { id: nextId(), type, adapterId, timestamp, summary };
}

/* Static event log for the built-in Simulation Adapter (deterministic). */
export const adapterEvents: AdapterEvent[] = [
  { id: "ae-s1", type: "Adapter Registered", adapterId: "simulation", timestamp: "09:00", summary: "Simulation Adapter registered with the SDK" },
  { id: "ae-s2", type: "Adapter Loaded", adapterId: "simulation", timestamp: "09:00", summary: "Simulation Adapter loaded" },
  { id: "ae-s3", type: "Adapter Ready", adapterId: "simulation", timestamp: "09:01", summary: "Initialized and ready for deterministic execution" },
  { id: "ae-s4", type: "Execution Started", adapterId: "simulation", timestamp: "09:04", summary: "Simulated File System execution started" },
  { id: "ae-s5", type: "Execution Progress", adapterId: "simulation", timestamp: "09:04", summary: "Step 2/3 simulated" },
  { id: "ae-s6", type: "Execution Completed", adapterId: "simulation", timestamp: "09:05", summary: "Simulated execution completed deterministically" },
  { id: "ae-s7", type: "Telemetry Updated", adapterId: "simulation", timestamp: "09:05", summary: "Telemetry aggregated: 24 simulated executions" },
  { id: "ae-s8", type: "Health Changed", adapterId: "simulation", timestamp: "09:06", summary: "Health confirmed Healthy" },
];
