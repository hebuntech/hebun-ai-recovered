import { SIGNAL_TYPES } from "../observability";
import type {
  DiagnosticsAuthorityScope,
  DiagnosticsProjection,
  DiagnosticsProjectionState,
  DiagnosticsQueryFilter,
  DiagnosticsQueryResult,
} from "./types";

const allowedFilters = new Set<keyof DiagnosticsQueryFilter>([
  "tenantId", "platformAuthority", "component", "monitorId", "evaluatorId", "signalType",
  "healthState", "severity", "correlation", "from", "to",
]);

function validFilter(filter: DiagnosticsQueryFilter): boolean {
  if (Object.keys(filter).some((key) => !allowedFilters.has(key as keyof DiagnosticsQueryFilter))) return false;
  if (filter.signalType && !(SIGNAL_TYPES as readonly string[]).includes(filter.signalType)) return false;
  if (filter.healthState && !["healthy", "watch", "degraded", "critical", "unknown"].includes(filter.healthState)) return false;
  if (filter.severity && !["debug", "info", "warning", "error", "critical"].includes(filter.severity)) return false;
  if (filter.from && !Number.isFinite(Date.parse(filter.from))) return false;
  if (filter.to && !Number.isFinite(Date.parse(filter.to))) return false;
  if (filter.from && filter.to && Date.parse(filter.from) > Date.parse(filter.to)) return false;
  if (filter.correlation && (!filter.correlation.id.trim() || !["request", "actor", "session", "command", "workflow", "execution", "provider-invocation", "evaluation-run", "incident"].includes(filter.correlation.type))) return false;
  return true;
}

function visible(projection: DiagnosticsProjection, authority: DiagnosticsAuthorityScope): boolean {
  return authority.kind === "tenant" ? projection.tenantId === authority.tenantId : projection.platformAuthority === authority.authority;
}

export function queryDiagnostics(input: {
  readonly state?: DiagnosticsProjectionState;
  readonly authorityScope: DiagnosticsAuthorityScope;
  readonly filter: DiagnosticsQueryFilter;
}): DiagnosticsQueryResult {
  if (!input.state) return Object.freeze({ status: "projection_unavailable", reason: "PROJECTION_UNAVAILABLE" });
  if (!validFilter(input.filter)) return Object.freeze({ status: "invalid_filter", reason: "INVALID_FILTER" });
  if ((input.filter.tenantId && (input.authorityScope.kind !== "tenant" || input.filter.tenantId !== input.authorityScope.tenantId)) ||
      (input.filter.platformAuthority && (input.authorityScope.kind !== "platform" || input.filter.platformAuthority !== input.authorityScope.authority))) {
    return Object.freeze({ status: "insufficient_scope", reason: "CROSS_SCOPE_QUERY" });
  }
  const from = input.filter.from ? Date.parse(input.filter.from) : Number.NEGATIVE_INFINITY;
  const to = input.filter.to ? Date.parse(input.filter.to) : Number.POSITIVE_INFINITY;
  const projections = Object.freeze(input.state.projections.filter((projection) => {
    if (!visible(projection, input.authorityScope)) return false;
    const time = Date.parse(projection.canonicalEventTime);
    return (!input.filter.component || projection.component === input.filter.component) &&
      (!input.filter.signalType || projection.signalType === input.filter.signalType) &&
      (!input.filter.severity || projection.severity === input.filter.severity) &&
      (!input.filter.monitorId || (projection.kind === "health" && projection.monitorId === input.filter.monitorId)) &&
      (!input.filter.evaluatorId || (projection.kind === "evaluation" && projection.evaluatorId === input.filter.evaluatorId)) &&
      (!input.filter.healthState || (projection.kind === "health" && projection.healthState === input.filter.healthState)) &&
      (!input.filter.correlation || projection.correlation.some(({ type, id }) => type === input.filter.correlation?.type && id === input.filter.correlation.id)) &&
      time >= from && time <= to;
  }));
  return projections.length === 0
    ? Object.freeze({ status: "empty", projections: [] as const })
    : Object.freeze({ status: "success", projections });
}
