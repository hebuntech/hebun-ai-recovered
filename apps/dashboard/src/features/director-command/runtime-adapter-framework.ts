import type { CommandCapability } from "./types";
import type { CanonicalRuntimeTarget } from "./runtime-target-resolution";
import type { RuntimeTargetKind } from "./runtime-execution-contracts";
import { deepFreeze } from "./validation";

export const RUNTIME_ADAPTER_AVAILABILITY_STATES = ["available", "unavailable", "unsupported"] as const;
export type RuntimeAdapterAvailability = (typeof RUNTIME_ADAPTER_AVAILABILITY_STATES)[number];
export const RUNTIME_ADAPTER_ERROR_CODES = [
  "ADAPTER_NOT_FOUND", "ADAPTER_UNAVAILABLE", "ADAPTER_FAMILY_MISMATCH", "ADAPTER_TARGET_MISMATCH",
  "ADAPTER_CAPABILITY_MISMATCH", "AMBIGUOUS_ADAPTER", "INVALID_ADAPTER_DESCRIPTOR", "INVALID_ADAPTER_REGISTRY",
] as const;
export type RuntimeAdapterErrorCode = (typeof RUNTIME_ADAPTER_ERROR_CODES)[number];

export interface RuntimeAdapterError { readonly code: RuntimeAdapterErrorCode; readonly message: string; }
export interface RuntimeAdapterDescriptor {
  readonly adapterFamily: RuntimeTargetKind;
  readonly adapterId: string;
  readonly supportedTargetFamily: RuntimeTargetKind;
  readonly supportedCommandFamilies: readonly CanonicalRuntimeTarget["commandFamily"][];
  readonly capabilityRequirements: readonly CommandCapability[];
  readonly adapterVersion: "1.0.0";
  readonly availability: RuntimeAdapterAvailability;
  readonly architectureSource: "static-architecture";
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeAdapterConstructionPlan {
  readonly adapterId: string;
  readonly targetFamily: RuntimeTargetKind;
  readonly status: "planned" | "unavailable" | "unsupported";
  readonly executable: false;
  readonly authoritative: false;
}
export type RuntimeAdapterSelectionResult =
  | { readonly status: "selected"; readonly descriptor: RuntimeAdapterDescriptor; readonly executable: false; readonly authoritative: false }
  | { readonly status: "unavailable" | "unsupported" | "invalid"; readonly error: RuntimeAdapterError; readonly executable: false; readonly authoritative: false };

export const RUNTIME_ADAPTER_DESCRIPTORS: readonly RuntimeAdapterDescriptor[] = deepFreeze([
  { adapterFamily: "agent", adapterId: "runtime-adapter.agent", supportedTargetFamily: "agent", supportedCommandFamilies: ["agent"], capabilityRequirements: ["agent.lifecycle"], adapterVersion: "1.0.0", availability: "unavailable", architectureSource: "static-architecture", executable: false, authoritative: false },
  { adapterFamily: "workflow", adapterId: "runtime-adapter.workflow", supportedTargetFamily: "workflow", supportedCommandFamilies: ["workflow"], capabilityRequirements: ["workflow.lifecycle", "workflow.recovery"], adapterVersion: "1.0.0", availability: "unavailable", architectureSource: "static-architecture", executable: false, authoritative: false },
  { adapterFamily: "diagnostics", adapterId: "runtime-adapter.diagnostics", supportedTargetFamily: "diagnostics", supportedCommandFamilies: ["observability"], capabilityRequirements: ["observability.reevaluate"], adapterVersion: "1.0.0", availability: "unavailable", architectureSource: "static-architecture", executable: false, authoritative: false },
  { adapterFamily: "monitoring", adapterId: "runtime-adapter.monitoring", supportedTargetFamily: "monitoring", supportedCommandFamilies: ["observability"], capabilityRequirements: ["observability.reevaluate"], adapterVersion: "1.0.0", availability: "unavailable", architectureSource: "static-architecture", executable: false, authoritative: false },
]);

export function runtimeAdapterError(code: RuntimeAdapterErrorCode, message: string): RuntimeAdapterError { return deepFreeze({ code, message }); }

/** Future factory contract: returns metadata only, never an adapter instance. */
export function createRuntimeAdapterConstructionPlan(descriptor: RuntimeAdapterDescriptor): RuntimeAdapterConstructionPlan {
  return deepFreeze({ adapterId: descriptor.adapterId, targetFamily: descriptor.supportedTargetFamily, status: descriptor.availability === "available" ? "planned" : descriptor.availability, executable: false as const, authoritative: false as const });
}
