import type { SignalSchemaRegistry } from "./registry";
import type { SignalPolicyDecision, SignalPolicyEngine, SignalRoute } from "./policy";
import type {
  CanonicalSignal,
  CanonicalSignalMetadata,
  CanonicalSignalType,
  CorrelationRelationshipType,
  NormalizedSignalCandidate,
  PlatformScope,
  SignalProducer,
  SignalSeverity,
  TenantScope,
} from "./types";

export interface ProducerObservation {
  readonly signalId: string;
  readonly signalType: string;
  readonly schemaVersion: number;
  readonly producer: SignalProducer;
  readonly source: { readonly component: string; readonly operation: string };
  readonly timestamp: string;
  readonly tenantIdCandidate?: string;
  readonly platformAuthorityCandidate?: string;
  readonly correlationCandidates?: readonly {
    readonly type: CorrelationRelationshipType;
    readonly id: string;
    readonly tenantId?: string;
    readonly parentId?: string;
  }[];
  readonly severityCandidate: string;
  readonly payload: unknown;
  readonly metadata: Partial<CanonicalSignalMetadata>;
  readonly evidenceCompleteness: string;
}

export interface RequestCorrelationContext {
  readonly scope: "request";
  readonly tenantScope: TenantScope;
  readonly platformScope: PlatformScope;
  readonly relationships: readonly {
    readonly type: CorrelationRelationshipType;
    readonly id: string;
    readonly tenantId?: string;
    readonly parentId?: string;
  }[];
}

export interface RoutedCanonicalSignal<T extends CanonicalSignalType = CanonicalSignalType> {
  readonly route: SignalRoute;
  readonly disposition: Exclude<SignalPolicyDecision<T>["disposition"], "discard">;
  readonly signal: CanonicalSignal<T>;
}

export interface CanonicalSignalSink {
  readonly route: SignalRoute;
  append(delivery: RoutedCanonicalSignal): Promise<"stored" | "duplicate">;
}

export type CollectionResult =
  | { readonly status: "accepted"; readonly signalId: string; readonly routes: readonly SignalRoute[] }
  | { readonly status: "discarded_by_policy"; readonly signalId: string }
  | { readonly status: "rejected_invalid" | "rejected_security" | "rejected_scope" | "rejected_correlation" | "rejected_version" | "rejected_capacity"; readonly reason: string }
  | { readonly status: "sink_unavailable"; readonly signalId: string; readonly runtimeAuthorityChanged: false }
  | { readonly status: "audit_guarantee_failed"; readonly signalId: string; readonly failClosed: true };

export interface SignalEmitter {
  submit(observation: ProducerObservation, context: RequestCorrelationContext): Promise<CollectionResult>;
}

export interface CollectionPipelineDependencies {
  readonly registry: SignalSchemaRegistry;
  readonly policyEngine: SignalPolicyEngine;
  readonly sinks: ReadonlyMap<SignalRoute, CanonicalSignalSink>;
  readonly maxCandidatePayloadBytes: number;
  readonly maxClockDriftMs: number;
  readonly now: () => Date;
}

export interface NormalizationResult<T extends CanonicalSignalType = CanonicalSignalType> {
  readonly candidate: NormalizedSignalCandidate<T>;
  readonly requestedRoutes: readonly SignalRoute[];
}

export const SIGNAL_SEVERITIES: readonly SignalSeverity[] = Object.freeze([
  "debug", "info", "warning", "error", "critical",
]);
