import { CanonicalPgReadClient } from "./pg-read-client";
import type {
  ActorResolutionResult,
  MembershipSummary,
  HumanOwnerSummary,
} from "./types";

interface HumanRow {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  lifecycle_status: string;
  suspended_at: string | null;
  archived_at: string | null;
  membership_id: string | null;
  membership_tenant_id: string | null;
  role_id: string | null;
  role_name: string | null;
  role_type: string | null;
  authority_scope: string | null;
  authority_rank: number | null;
  delegated_by_type: string | null;
  delegated_by_id: string | null;
  effective_from: string | null;
  effective_until: string | null;
  membership_suspended_at: string | null;
  membership_version: number | null;
}

interface AgentRow {
  id: string;
  tenant_id: string;
  name: string;
  department_name: string | null;
  role: string | null;
  lifecycle_status: string;
  agent_lifecycle_status: string | null;
  agent_health: string | null;
  agent_type: string | null;
  risk_level: string | null;
  suspended_at: string | null;
  retired_at: string | null;
  human_owner_type: string | null;
  human_owner_id: string | null;
  owner_display_name: string | null;
  owner_name: string | null;
  owner_email: string | null;
  manager_actor_type: string | null;
  manager_actor_id: string | null;
  manager_human_display_name: string | null;
  manager_human_name: string | null;
  manager_human_email: string | null;
  manager_agent_name: string | null;
  authority_ceiling_summary: string | null;
  config_version: number | null;
  replaced_by_agent_id: string | null;
}

function baseUnavailable(
  client: CanonicalPgReadClient,
  input: ActorResolutionResult["actorRef"],
): ActorResolutionResult {
  return {
    kind: "actor-resolution",
    status: "unavailable",
    resolved: false,
    availability: client.unavailableAvailability(),
    actorRef: input,
    tenantMatch: false,
    active: false,
    suspended: false,
    archived: false,
    warnings: [],
    reason: client.unavailableError().message,
    error: client.unavailableError(),
  };
}

function membershipSummary(row: HumanRow): MembershipSummary | null {
  if (!row.membership_id || !row.membership_tenant_id) return null;
  return {
    membershipId: row.membership_id,
    tenantId: row.membership_tenant_id,
    roleId: row.role_id,
    roleName: row.role_name,
    roleType: row.role_type,
    authorityScope: row.authority_scope,
    authorityRank: row.authority_rank,
    delegatedByActorType: row.delegated_by_type,
    delegatedByActorId: row.delegated_by_id,
    effectiveFrom: row.effective_from,
    effectiveUntil: row.effective_until,
    suspendedAt: row.membership_suspended_at,
    membershipVersion:
      row.membership_version == null ? null : String(row.membership_version),
  };
}

function ownerSummary(row: AgentRow): HumanOwnerSummary | null {
  if (!row.human_owner_id && !row.human_owner_type) return null;
  return {
    actorType: row.human_owner_type,
    actorId: row.human_owner_id,
    displayLabel:
      row.owner_display_name ?? row.owner_name ?? row.owner_email ?? null,
  };
}

function managerSummary(row: AgentRow): HumanOwnerSummary | null {
  if (!row.manager_actor_id && !row.manager_actor_type) return null;
  const displayLabel =
    row.manager_actor_type === "agent"
      ? row.manager_agent_name
      : row.manager_human_display_name ??
        row.manager_human_name ??
        row.manager_human_email;

  return {
    actorType: row.manager_actor_type,
    actorId: row.manager_actor_id,
    displayLabel: displayLabel ?? null,
  };
}

export async function resolveCanonicalActor(
  client: CanonicalPgReadClient,
  input: ActorResolutionResult["actorRef"],
): Promise<ActorResolutionResult> {
  const availability = await client.availability();
  if (!availability.available) return baseUnavailable(client, input);

  try {
    if (input.actorType === "system" || input.actorType === "service") {
      return {
        kind: "actor-resolution",
        status: "unresolved",
        resolved: false,
        availability,
        actorRef: input,
        tenantMatch: false,
        active: false,
        suspended: false,
        archived: false,
        warnings: ["System and service actors do not have canonical rows yet."],
        reason: "registry-required",
      };
    }

    if (input.actorType === "human") {
      const row = await client.queryOne<HumanRow>(
        `
          select
            u.id,
            u.email,
            u.name,
            u.display_name,
            u.lifecycle_status,
            u.suspended_at,
            u.archived_at,
            m.id as membership_id,
            m.tenant_id as membership_tenant_id,
            m.role_id,
            r.name as role_name,
            r.type as role_type,
            m.authority_scope,
            r.authority_rank,
            m.delegated_by_type,
            m.delegated_by_id,
            m.effective_from,
            m.effective_until,
            m.suspended_at as membership_suspended_at,
            m.version as membership_version
          from public.users u
          left join public.memberships m
            on m.user_id = u.id
           and m.tenant_id = $2
          left join public.roles r
            on r.id = m.role_id
          where u.id = $1
          limit 1
        `,
        [input.actorId, input.tenantId],
      );

      if (!row) {
        return {
          kind: "actor-resolution",
          status: "not-found",
          resolved: false,
          availability,
          actorRef: input,
          tenantMatch: false,
          active: false,
          suspended: false,
          archived: false,
          warnings: [],
          reason: "user-not-found",
          error: {
            code: "not_found",
            message: "No canonical user row exists for this actor id.",
            retryable: false,
          },
        };
      }

      const matched = Boolean(row.membership_id);
      const suspended =
        Boolean(row.suspended_at) || Boolean(row.membership_suspended_at);
      const archived =
        row.lifecycle_status === "archived" || Boolean(row.archived_at);
      const label = row.display_name ?? row.name ?? row.email;

      if (!matched) {
        return {
          kind: "actor-resolution",
          status: "tenant-mismatch",
          resolved: false,
          availability,
          actorRef: input,
          displayLabel: label,
          tenantMatch: false,
          lifecycleStatus: row.lifecycle_status,
          active: false,
          suspended,
          archived,
          sourceTable: "users",
          membershipSummary: null,
          warnings: ["User exists, but no membership was found for the tenant."],
          reason: "membership-missing-for-tenant",
          error: {
            code: "tenant_mismatch",
            message: "User exists but is not a member of the requested tenant.",
            retryable: false,
          },
        };
      }

      return {
        kind: "actor-resolution",
        status: "resolved",
        resolved: true,
        availability,
        actorRef: input,
        displayLabel: label,
        tenantMatch: true,
        lifecycleStatus: row.lifecycle_status,
        active: row.lifecycle_status === "active" && !suspended && !archived,
        suspended,
        archived,
        sourceTable: "users",
        membershipSummary: membershipSummary(row),
        warnings: [],
      };
    }

    const row = await client.queryOne<AgentRow>(
      `
        select
          a.id,
          a.tenant_id,
          a.name,
          d.name as department_name,
          a.role,
          a.lifecycle_status,
          a.agent_lifecycle_status,
          a.agent_health,
          a.agent_type,
          a.risk_level,
          a.suspended_at,
          a.retired_at,
          a.human_owner_type,
          a.human_owner_id,
          u.display_name as owner_display_name,
          u.name as owner_name,
          u.email as owner_email,
          a.manager_actor_type,
          a.manager_actor_id,
          mu.display_name as manager_human_display_name,
          mu.name as manager_human_name,
          mu.email as manager_human_email,
          ma.name as manager_agent_name,
          case
            when a.authority_ceiling is null then null
            when jsonb_typeof(a.authority_ceiling) = 'object' then
              concat(
                'object:',
                coalesce(
                  (
                    select string_agg(key, ',' order by key)
                    from jsonb_object_keys(a.authority_ceiling) as key
                  ),
                  ''
                )
              )
            when jsonb_typeof(a.authority_ceiling) = 'array' then
              concat('array:', jsonb_array_length(a.authority_ceiling))
            else jsonb_typeof(a.authority_ceiling)
          end as authority_ceiling_summary,
          a.config_version,
          a.replaced_by_agent_id
        from public.agents a
        left join public.departments d
          on d.id = a.department_id
        left join public.users u
          on u.id = a.human_owner_id
        left join public.users mu
          on mu.id = a.manager_actor_id
         and a.manager_actor_type = 'human'
        left join public.agents ma
          on ma.id = a.manager_actor_id
         and a.manager_actor_type = 'agent'
        where a.id = $1
          and a.tenant_id = $2
        limit 1
      `,
      [input.actorId, input.tenantId],
    );

    if (!row) {
      const existsElsewhere = await client.queryOne<{ tenant_id: string }>(
        `
          select tenant_id
          from public.agents
          where id = $1
          limit 1
        `,
        [input.actorId],
      );

      if (existsElsewhere) {
        return {
          kind: "actor-resolution",
          status: "tenant-mismatch",
          resolved: false,
          availability,
          actorRef: input,
          tenantMatch: false,
          active: false,
          suspended: false,
          archived: false,
          sourceTable: "agents",
          warnings: ["Agent exists but belongs to a different tenant."],
          reason: "agent-tenant-mismatch",
          error: {
            code: "tenant_mismatch",
            message: "Agent exists but does not belong to the requested tenant.",
            retryable: false,
          },
        };
      }

      return {
        kind: "actor-resolution",
        status: "not-found",
        resolved: false,
        availability,
        actorRef: input,
        tenantMatch: false,
        active: false,
        suspended: false,
        archived: false,
        warnings: [],
        reason: "agent-not-found",
        error: {
          code: "not_found",
          message: "No canonical agent row exists for this actor id.",
          retryable: false,
          },
        };
      }

    const suspended = Boolean(row.suspended_at);
    const archived =
      row.lifecycle_status === "archived" ||
      row.agent_lifecycle_status === "retired" ||
      Boolean(row.retired_at);

    return {
      kind: "actor-resolution",
      status: "resolved",
      resolved: true,
      availability,
      actorRef: input,
      displayLabel: row.name,
      tenantMatch: true,
      lifecycleStatus: row.agent_lifecycle_status ?? row.lifecycle_status,
      active:
        row.lifecycle_status === "active" &&
        row.agent_lifecycle_status !== "suspended" &&
        !suspended &&
        !archived,
      suspended,
      archived,
      sourceTable: "agents",
      humanOwnerSummary: ownerSummary(row),
      managerActorSummary: managerSummary(row),
      replacementActorId: row.replaced_by_agent_id,
      department: row.department_name,
      agentType: row.agent_type,
      health: row.agent_health,
      riskLevel: row.risk_level,
      authorityCeilingSummary: row.authority_ceiling_summary,
      configProfileVersion:
        row.config_version == null ? null : String(row.config_version),
      warnings: [],
    };
  } catch (error) {
    return {
      kind: "actor-resolution",
      status: "unavailable",
      resolved: false,
      availability,
      actorRef: input,
      tenantMatch: false,
      active: false,
      suspended: false,
      archived: false,
      warnings: [],
      reason: "actor-query-failed",
      error: {
        code: "query_failed",
        message: "Canonical actor resolution query failed.",
        retryable: true,
        detail: error instanceof Error ? error.message : "Unknown actor query failure.",
      },
    };
  }
}
