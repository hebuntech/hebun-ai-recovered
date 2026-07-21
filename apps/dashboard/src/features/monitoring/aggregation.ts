import type { CanonicalSignal } from "../observability";
import type { EvaluationWindow, MonitoringAggregate, MonitoringAuthorityScope } from "./types";

export function aggregateMonitoringSignals(input: {
  readonly monitorId: string;
  readonly signals: readonly CanonicalSignal[];
  readonly authorityScope: MonitoringAuthorityScope;
  readonly window: EvaluationWindow;
}): readonly MonitoringAggregate[] | undefined {
  const groups = new Map<string, CanonicalSignal[]>();
  for (const signal of input.signals) {
    const authorized = input.authorityScope.kind === "tenant"
      ? signal.tenantScope.kind === "tenant" && signal.tenantScope.tenantId === input.authorityScope.tenantId
      : signal.platformScope.kind === "platform" && signal.platformScope.authority === input.authorityScope.authority;
    if (!authorized) return undefined;
    const scope = input.authorityScope.kind === "tenant" ? `tenant:${input.authorityScope.tenantId}` : `platform:${input.authorityScope.authority}`;
    const key = [scope, input.monitorId, signal.source.component, signal.signalType, input.window.start, input.window.end].join("|");
    groups.set(key, [...(groups.get(key) ?? []), signal]);
  }
  return Object.freeze([...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, signals]) => Object.freeze({
    key,
    ...(input.authorityScope.kind === "tenant" ? { tenantId: input.authorityScope.tenantId } : { platformAuthority: input.authorityScope.authority }),
    monitorId: input.monitorId,
    component: signals[0]!.source.component,
    signalType: signals[0]!.signalType,
    window: input.window,
    count: signals.length,
  })));
}
