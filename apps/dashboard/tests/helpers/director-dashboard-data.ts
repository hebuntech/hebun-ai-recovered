import type { OrganizationRuntimeSnapshot, RuntimeModelBase } from "../../src/features/organization-runtime";
import type { WorkflowRuntimeModel } from "../../src/features/workflow-runtime";
import {
  DASHBOARD_DATA_SOURCES,
  DASHBOARD_SECTION_IDS,
  DashboardRegistry,
  type DashboardAuthorityScope,
  type DashboardSourceBundle,
} from "../../src/features/director-dashboard-data";

const tenantScope: DashboardAuthorityScope = { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" };

function base(kind: RuntimeModelBase["identity"]["kind"], id: string): RuntimeModelBase {
  return {
    identity: { id, slug: id, name: id, kind, source: "memory" },
    lifecycle: { status: "active", createdAt: "2026-07-21T10:00:00.000Z" },
    health: { score: 100, status: "healthy", summary: "healthy" },
    relationships: { children: [], memberships: [], ownership: {} },
    responsibilities: { assignedWork: [], responsibleWorkflows: [], responsibleGoals: [], responsibleMissions: [] },
  };
}

export function dashboardRegistry(): DashboardRegistry {
  return new DashboardRegistry(DASHBOARD_SECTION_IDS.map((sectionId) => ({
    sectionId,
    version: "1.0.0",
    owner: "platform-observability",
    lifecycle: "active" as const,
    supportedWidgets: [`${sectionId}-summary`],
    requiredDataSources: [DASHBOARD_DATA_SOURCES[0]],
  })));
}

export function dashboardSource(overrides: Partial<DashboardSourceBundle> = {}): DashboardSourceBundle {
  const company = { ...base("company", "company-1"), organizations: [], departments: [], humans: [], agents: [], teams: [], metrics: { departments: 0, humans: 0, agents: 1, activeWorkflows: 1, activeGoals: 0 } };
  const organization = { ...base("organization", "tenant-a"), company: { kind: "company" as const, id: "company-1", label: "Company" }, departments: [], humans: [], agents: [], teams: [] };
  const agent = { ...base("agent", "agent-1"), company: { kind: "company" as const, id: "company-1", label: "Company" }, organization: { kind: "organization" as const, id: "tenant-a", label: "Tenant A" }, runtime: "ready", provider: "provider-a", model: "model-a", status: "active" };
  const organizationSnapshot: OrganizationRuntimeSnapshot = {
    company, organizations: [organization], departments: [], humans: [], agents: [agent], memberships: [], roles: [], hierarchy: [],
  };
  const workflow: WorkflowRuntimeModel = {
    identity: { id: "workflow-1", slug: "workflow-1", name: "Workflow 1", kind: "workflow", source: "memory" },
    childWorkflows: [], assignedAgents: [], responsibleHumans: [], currentTasks: [], dependencies: [], executionStatus: "idle",
    lifecycle: { status: "active" }, health: { score: 100, status: "healthy", summary: "healthy" },
    progress: { completionRate: 1, successRate: 1, runsToday: 1, summary: "complete" }, priority: "medium", risk: "low",
    timeline: { trigger: "manual", lastRun: "2026-07-21T11:00:00.000Z" }, blockingIssues: [],
    readiness: { status: "ready", score: 100, blockers: 0, summary: "ready" }, learningReferences: [], knowledgeReferences: [], memoryReferences: [],
    statusSummary: { headline: "Ready", detail: "Ready" }, company: { kind: "company", id: "company-1", label: "Company" },
    organization: { kind: "organization", id: "tenant-a", label: "Tenant A" }, relationships: { children: [] },
  };
  return {
    authorityScope: tenantScope,
    sourceVersions: Object.fromEntries(DASHBOARD_DATA_SOURCES.map((source) => [source, "1.0.0"])) as DashboardSourceBundle["sourceVersions"],
    runtimeSnapshots: [{
      collection: "organization-runtime", data: organizationSnapshot,
      version: { value: 1, updatedAt: "2026-07-21T12:00:00.000Z" },
      health: { status: "healthy", detail: "ready", checkedAt: "2026-07-21T12:00:00.000Z" },
      availability: { available: true, detail: "ready" },
      statistics: { refreshCount: 1, lastDurationMs: 1, lastRefreshResult: "success", itemCount: 1 },
      metadata: { identity: { collection: "organization-runtime", label: "Organization" }, owner: "runtime", dependencies: [] },
    }],
    workflows: [workflow],
    monitoringAggregates: [{
      key: "monitor-1", tenantId: "tenant-a", monitorId: "monitor-1", component: "runtime-engine", signalType: "operational-event",
      window: { kind: "fixed", start: "2026-07-21T11:00:00.000Z", end: "2026-07-21T12:00:00.000Z" }, count: 1,
    }],
    healthSnapshots: [{
      snapshotId: "health-1", monitorId: "monitor-1", monitorVersion: "1.0.0",
      subject: { type: "component", id: "runtime", component: "runtime-engine" }, state: "healthy", severity: "info",
      evidenceCompleteness: "FULL", evidenceReferences: ["signal-1"],
      window: { kind: "fixed", start: "2026-07-21T11:00:00.000Z", end: "2026-07-21T12:00:00.000Z" }, evaluatedAt: "2026-07-21T12:00:00.000Z",
    }],
    diagnosticsProjections: [{
      projectionId: "diagnostic-1", kind: "tenant", sourceSignalId: "signal-1", signalType: "operational-event", schemaVersion: 1, policyVersion: 1,
      canonicalEventTime: "2026-07-21T12:00:00.000Z", component: "runtime-engine", serviceId: "runtime", tenantId: "tenant-a",
      severity: "info", evidenceCompleteness: "FULL", evidenceReferences: ["signal-1"], correlation: [],
    }],
    evaluationSummaries: [{ key: "evaluation-1", datasetId: "dataset-1", evaluatorId: "evaluator-1", subjectType: "agent", subjectId: "agent-1", version: "1.0.0", count: 1, meanScore: 1, passed: 1, failed: 0, inconclusive: 0 }],
    authenticationSessions: [{
      sessionContextId: "session-1", sessionVersion: 1, authIdentityId: "identity-1", userId: "user-1", activeTenantId: "tenant-a",
      activeMembershipId: "membership-1", membershipVersion: 1, assuranceLevel: "aal2", mfaVerified: true,
      authenticatedAt: "2026-07-21T10:00:00.000Z", absoluteExpiresAt: "2026-07-22T10:00:00.000Z", inactivityExpiresAt: "2026-07-21T14:00:00.000Z",
    }],
    organization: organizationSnapshot,
    ...overrides,
  };
}

export { tenantScope };
