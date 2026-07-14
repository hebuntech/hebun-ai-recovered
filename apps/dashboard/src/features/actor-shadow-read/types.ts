import type { CanonicalReadAvailability } from "@/features/canonical-read";
import type {
  ReadFieldComparisonStatus,
  ReadSourceAvailability,
  ReadStatus,
} from "@/features/canonical-read-platform";

export type ActorShadowReadStatus =
  | ReadStatus
  | "unresolved-actor-type";

export type ActorShadowMismatchCategory =
  | "identity mismatch"
  | "tenant mismatch"
  | "display-label mismatch"
  | "lifecycle mismatch"
  | "suspension mismatch"
  | "membership mismatch"
  | "role mismatch"
  | "ownership mismatch"
  | "manager mismatch"
  | "department mismatch"
  | "agent-type mismatch"
  | "health mismatch"
  | "risk mismatch"
  | "authority-metadata mismatch"
  | "missing memory actor"
  | "missing canonical actor"
  | "unresolved system/service actor"
  | "unavailable source"
  | "non-comparable field";

export type ActorFieldComparisonStatus = ReadFieldComparisonStatus;

export interface ActorShadowReadInput {
  readonly tenantId: string;
  readonly actorType: "human" | "agent" | "system" | "service";
  readonly actorId: string;
}

export type ActorShadowReadSourceAvailability = ReadSourceAvailability;

export interface ActorMembershipSnapshot {
  readonly membershipExists?: boolean | null;
  readonly membershipId?: string | null;
  readonly tenantId?: string | null;
  readonly roleId?: string | null;
  readonly roleName?: string | null;
  readonly roleType?: string | null;
  readonly authorityScope?: string | null;
  readonly delegatedByActorType?: string | null;
  readonly delegatedByActorId?: string | null;
  readonly authorityRank?: number | null;
  readonly effectiveFrom?: string | null;
  readonly effectiveUntil?: string | null;
  readonly suspendedAt?: string | null;
  readonly membershipVersion?: string | null;
}

export interface ActorOwnershipSnapshot {
  readonly humanOwnerActorType?: string | null;
  readonly humanOwnerActorId?: string | null;
  readonly humanOwnerDisplayLabel?: string | null;
  readonly managerActorType?: string | null;
  readonly managerActorId?: string | null;
  readonly managerDisplayLabel?: string | null;
  readonly replacementActorId?: string | null;
}

export interface ActorAuthoritySnapshot {
  readonly roleRank?: number | null;
  readonly authorityScope?: string | null;
  readonly delegatedByActorType?: string | null;
  readonly delegatedByActorId?: string | null;
  readonly authorityCeilingSummary?: string | null;
  readonly configProfileVersion?: string | null;
}

export interface MemoryActorShadowSummary {
  readonly source:
    | "no-human-registry"
    | "agent-crud"
    | "machine-actor-reference";
  readonly actorType: "human" | "agent" | "system" | "service";
  readonly actorId: string;
  readonly tenantId?: string | null;
  readonly displayLabel?: string | null;
  readonly lifecycleStatus?: string | null;
  readonly active?: boolean | null;
  readonly suspended?: boolean | null;
  readonly archived?: boolean | null;
  readonly department?: string | null;
  readonly agentType?: string | null;
  readonly health?: string | null;
  readonly riskLevel?: string | null;
  readonly membership?: ActorMembershipSnapshot | null;
  readonly ownership?: ActorOwnershipSnapshot | null;
  readonly authority?: ActorAuthoritySnapshot | null;
}

export interface PostgresActorShadowSummary {
  readonly source: "canonical-actor-resolution";
  readonly actorType: "human" | "agent" | "system" | "service";
  readonly actorId: string;
  readonly tenantId: string;
  readonly resolved: boolean;
  readonly displayLabel?: string | null;
  readonly lifecycleStatus?: string | null;
  readonly active?: boolean | null;
  readonly suspended?: boolean | null;
  readonly archived?: boolean | null;
  readonly sourceTable?: "users" | "agents";
  readonly department?: string | null;
  readonly agentType?: string | null;
  readonly health?: string | null;
  readonly riskLevel?: string | null;
  readonly membership?: ActorMembershipSnapshot | null;
  readonly ownership?: ActorOwnershipSnapshot | null;
  readonly authority?: ActorAuthoritySnapshot | null;
  readonly unresolvedReason?: string | null;
}

export interface ActorFieldComparison {
  readonly field:
    | "actorType"
    | "actorId"
    | "tenantId"
    | "displayLabel"
    | "lifecycleStatus"
    | "active"
    | "suspended"
    | "archived"
    | "membershipExists"
    | "roleId"
    | "roleName"
    | "roleType"
    | "effectiveFrom"
    | "effectiveUntil"
    | "membershipSuspendedAt"
    | "membershipVersion"
    | "department"
    | "humanOwner"
    | "managerActor"
    | "replacementActorId"
    | "agentType"
    | "health"
    | "riskLevel"
    | "roleRank"
    | "authorityScope"
    | "delegatedBy"
    | "authorityCeilingSummary"
    | "configProfileVersion";
  readonly section:
    | "identity"
    | "membership"
    | "lifecycle"
    | "ownership"
    | "authority";
  readonly status: ActorFieldComparisonStatus;
  readonly memoryValue?: string | number | boolean | null;
  readonly postgresValue?: string | number | boolean | null;
  readonly note?: string;
}

export type ActorMembershipComparison = ActorFieldComparison & {
  readonly section: "membership";
};

export type ActorAuthorityComparison = ActorFieldComparison & {
  readonly section: "authority";
};

export interface ActorShadowReadDiff {
  readonly mismatches: readonly ActorFieldComparison[];
  readonly matchedFields: readonly ActorFieldComparison[];
  readonly nonComparableFields: readonly ActorFieldComparison[];
  readonly missingFields: readonly ActorFieldComparison[];
  readonly membershipDifferences: readonly ActorMembershipComparison[];
  readonly authorityDifferences: readonly ActorAuthorityComparison[];
  readonly mismatchCategories: readonly ActorShadowMismatchCategory[];
}

export interface ActorShadowReadResult {
  readonly kind: "actor-shadow-read";
  readonly input: ActorShadowReadInput;
  readonly status: ActorShadowReadStatus;
  readonly memory: {
    readonly found: boolean;
    readonly summary?: MemoryActorShadowSummary;
  };
  readonly postgres: {
    readonly found: boolean;
    readonly availability: CanonicalReadAvailability;
    readonly summary?: PostgresActorShadowSummary;
    readonly reason?: string;
  };
  readonly sourceAvailability: ActorShadowReadSourceAvailability;
  readonly diff: ActorShadowReadDiff;
  readonly warnings: readonly string[];
  readonly comparedAt: string;
}
