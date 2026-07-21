import type { DashboardAuthorityScope, DashboardQueryFilter, DashboardQueryResult, DashboardSnapshot } from "./types";
import { deepFreeze } from "./validation";

const allowed = new Set<keyof DashboardQueryFilter>([
  "tenantId", "platformAuthority", "component", "agentId", "workflowId", "healthState", "evaluationStatus", "from", "to",
]);

function validFilter(filter: DashboardQueryFilter): boolean {
  if (Object.keys(filter).some((key) => !allowed.has(key as keyof DashboardQueryFilter))) return false;
  if (filter.healthState && !["healthy", "watch", "degraded", "critical", "unknown"].includes(filter.healthState)) return false;
  if (filter.evaluationStatus && !["passed", "failed", "inconclusive"].includes(filter.evaluationStatus)) return false;
  const from = filter.from ? Date.parse(filter.from) : undefined;
  const to = filter.to ? Date.parse(filter.to) : undefined;
  return (from === undefined || Number.isFinite(from)) && (to === undefined || Number.isFinite(to)) &&
    (from === undefined || to === undefined || from <= to);
}

function sameScope(snapshot: DashboardSnapshot, authority: DashboardAuthorityScope, filter: DashboardQueryFilter): boolean {
  if (snapshot.authorityScope.kind !== authority.kind) return false;
  if (authority.kind === "tenant") {
    return snapshot.authorityScope.kind === "tenant" && snapshot.authorityScope.tenantId === authority.tenantId &&
      (!filter.tenantId || filter.tenantId === authority.tenantId) && !filter.platformAuthority;
  }
  return snapshot.authorityScope.kind === "platform" && snapshot.authorityScope.authority === authority.authority &&
    (!filter.platformAuthority || filter.platformAuthority === authority.authority) && !filter.tenantId;
}

export function queryDashboard(input: {
  readonly snapshot?: DashboardSnapshot;
  readonly authorityScope: DashboardAuthorityScope;
  readonly filter: DashboardQueryFilter;
}): DashboardQueryResult {
  if (!input.snapshot) return Object.freeze({ status: "unavailable", reason: "DASHBOARD_SNAPSHOT_UNAVAILABLE" });
  if (!validFilter(input.filter)) return Object.freeze({ status: "invalid_filter", reason: "INVALID_FILTER" });
  if (!sameScope(input.snapshot, input.authorityScope, input.filter)) return Object.freeze({ status: "invalid_scope", reason: "CROSS_SCOPE_QUERY" });
  const from = input.filter.from ? Date.parse(input.filter.from) : Number.NEGATIVE_INFINITY;
  const to = input.filter.to ? Date.parse(input.filter.to) : Number.POSITIVE_INFINITY;
  const generated = Date.parse(input.snapshot.generatedAt);
  const models = deepFreeze({
    ...input.snapshot.models,
    runtimeOverview: input.snapshot.models.runtimeOverview.filter((item) => !input.filter.component || item.collection === input.filter.component),
    agentOverview: input.snapshot.models.agentOverview.filter((item) => !input.filter.agentId || item.agentId === input.filter.agentId),
    workflowOverview: input.snapshot.models.workflowOverview.filter((item) => !input.filter.workflowId || item.workflowId === input.filter.workflowId),
    monitoringSummary: input.snapshot.models.monitoringSummary.filter((item) => !input.filter.component || item.component === input.filter.component),
    healthSummary: input.snapshot.models.healthSummary.filter((item) => (!input.filter.component || item.component === input.filter.component) && (!input.filter.healthState || item.healthState === input.filter.healthState)),
    diagnosticsSummary: input.snapshot.models.diagnosticsSummary.filter((item) => !input.filter.component || item.component === input.filter.component),
    evaluationSummary: input.snapshot.models.evaluationSummary.filter((item) => !input.filter.evaluationStatus || item[input.filter.evaluationStatus] > 0),
  });
  const snapshot = deepFreeze({ ...input.snapshot, models });
  const hasSelector = Boolean(input.filter.component || input.filter.agentId || input.filter.workflowId || input.filter.healthState || input.filter.evaluationStatus);
  const count = hasSelector
    ? (input.filter.component ? models.runtimeOverview.length + models.monitoringSummary.length + models.healthSummary.length + models.diagnosticsSummary.length : 0) +
      (input.filter.agentId ? models.agentOverview.length : 0) +
      (input.filter.workflowId ? models.workflowOverview.length : 0) +
      (input.filter.healthState && !input.filter.component ? models.healthSummary.length : 0) +
      (input.filter.evaluationStatus ? models.evaluationSummary.length : 0)
    : Object.values(models).reduce((total, items) => total + items.length, 0);
  return generated < from || generated > to || count === 0
    ? Object.freeze({ status: "empty", snapshot })
    : Object.freeze({ status: "success", snapshot });
}
