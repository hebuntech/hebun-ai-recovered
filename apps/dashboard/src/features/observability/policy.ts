import type { SignalSchemaDefinition } from "./registry";
import type {
  CanonicalSignalType,
  NormalizedSignalCandidate,
  PlatformScope,
  SignalSeverity,
  TenantScope,
} from "./types";

export type SignalDisposition = "telemetry" | "audit" | "discard";
export type SignalRoute = Exclude<SignalDisposition, "discard">;
export type SignalRetentionClass = "ephemeral" | "operational" | "security" | "compliance";

export interface SignalPolicyDecision<T extends CanonicalSignalType = CanonicalSignalType> {
  readonly decision: "accept" | "reject";
  readonly signalType: T;
  readonly schemaVersion: number;
  readonly policyVersion: number;
  readonly disposition: SignalDisposition;
  readonly retention: SignalRetentionClass;
  readonly severity: SignalSeverity;
  readonly tenantScope: TenantScope;
  readonly platformScope: PlatformScope;
  readonly maxPayloadBytes: number;
  readonly sampled: boolean;
  readonly redactionApplied: boolean;
  readonly approvedRoutes: readonly SignalRoute[];
  readonly reasonCode?: string;
}

export interface SignalPolicyEngine {
  evaluate<T extends CanonicalSignalType>(
    candidate: NormalizedSignalCandidate<T>,
    schema: SignalSchemaDefinition,
  ): SignalPolicyDecision<T>;
}
