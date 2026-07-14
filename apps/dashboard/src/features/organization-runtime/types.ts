export type RuntimeEntityKind =
  | "company"
  | "organization"
  | "department"
  | "team"
  | "human"
  | "agent"
  | "membership"
  | "role";

export type RuntimeLifecycleStatus = "active" | "archived" | "deleted" | "derived";
export type RuntimeHealthStatus = "healthy" | "watch" | "critical" | "unknown";

export interface RuntimeIdentity {
  id: string;
  slug: string;
  name: string;
  kind: RuntimeEntityKind;
  source: "memory" | "derived";
}

export interface RuntimeLifecycle {
  status: RuntimeLifecycleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface RuntimeHealth {
  score: number;
  status: RuntimeHealthStatus;
  summary: string;
}

export interface RuntimeRef {
  kind: RuntimeEntityKind;
  id: string;
  label: string;
}

export interface RuntimeWorkItem {
  type: "workflow" | "goal" | "mission" | "memory" | "review" | "ticket" | "approval";
  id: string;
  label: string;
  status?: string;
  detail?: string;
}

export interface RuntimeOwnership {
  owner?: RuntimeRef;
  manager?: RuntimeRef;
}

export interface RuntimeRelationships {
  parent?: RuntimeRef;
  children: RuntimeRef[];
  memberships: RuntimeRef[];
  reportsTo?: RuntimeRef;
  ownership: RuntimeOwnership;
}

export interface RuntimeResponsibilities {
  assignedWork: RuntimeWorkItem[];
  responsibleWorkflows: RuntimeWorkItem[];
  responsibleGoals: RuntimeWorkItem[];
  responsibleMissions: RuntimeWorkItem[];
}

export interface RuntimeModelBase {
  identity: RuntimeIdentity;
  lifecycle: RuntimeLifecycle;
  health: RuntimeHealth;
  relationships: RuntimeRelationships;
  responsibilities: RuntimeResponsibilities;
}

export interface CompanyRuntimeModel extends RuntimeModelBase {
  organizations: RuntimeRef[];
  departments: RuntimeRef[];
  humans: RuntimeRef[];
  agents: RuntimeRef[];
  teams: RuntimeRef[];
  metrics: {
    departments: number;
    humans: number;
    agents: number;
    activeWorkflows: number;
    activeGoals: number;
  };
}

export interface OrganizationRuntimeModel extends RuntimeModelBase {
  company: RuntimeRef;
  departments: RuntimeRef[];
  humans: RuntimeRef[];
  agents: RuntimeRef[];
  teams: RuntimeRef[];
}

export interface DepartmentRuntimeModel extends RuntimeModelBase {
  company: RuntimeRef;
  organization: RuntimeRef;
  teams: RuntimeRef[];
  humans: RuntimeRef[];
  agents: RuntimeRef[];
  reportingLine: RuntimeRef[];
}

export interface AgentRuntimeModel extends RuntimeModelBase {
  department?: RuntimeRef;
  role?: RuntimeRef;
  company: RuntimeRef;
  organization: RuntimeRef;
  runtime: string;
  provider: string;
  model: string;
  status: string;
}

export interface HumanRuntimeModel extends RuntimeModelBase {
  department?: RuntimeRef;
  role?: RuntimeRef;
  company: RuntimeRef;
  organization: RuntimeRef;
  status: "active" | "watch" | "unknown";
  profile: {
    title: string;
    email?: string;
    sourceRecords: string[];
  };
}

export interface MembershipRuntimeModel extends RuntimeModelBase {
  actor: RuntimeRef;
  role?: RuntimeRef;
  company: RuntimeRef;
  organization: RuntimeRef;
  department?: RuntimeRef;
  scope: "company" | "organization" | "department";
}

export interface RoleRuntimeModel extends RuntimeModelBase {
  roleType: "human" | "agent" | "system";
  authorityRank: number;
  members: RuntimeRef[];
}

export interface HierarchyNodeRuntimeModel {
  identity: RuntimeIdentity;
  parent?: RuntimeRef;
  children: RuntimeRef[];
  reportsTo?: RuntimeRef;
  owner?: RuntimeRef;
  manager?: RuntimeRef;
  depth: number;
  lineage: RuntimeRef[];
}

export interface OrganizationRuntimeSnapshot {
  company: CompanyRuntimeModel;
  organizations: OrganizationRuntimeModel[];
  departments: DepartmentRuntimeModel[];
  humans: HumanRuntimeModel[];
  agents: AgentRuntimeModel[];
  memberships: MembershipRuntimeModel[];
  roles: RoleRuntimeModel[];
  hierarchy: HierarchyNodeRuntimeModel[];
}
