/*
 * canonical-read — serializable, read-only result contracts.
 *
 * This layer never exposes raw pg rows or mutation APIs. Every result is
 * explicit about availability, not-found, tenant mismatch, and partial shapes.
 */
export type CanonicalReadUnavailabilityReason =
  | "missing_database_url"
  | "disallowed_target"
  | "connection_failed"
  | "query_failed";

export interface CanonicalReadTarget {
  readonly host: string;
  readonly port: number | null;
  readonly database: string;
  readonly local: boolean;
}

export interface CanonicalReadAvailability {
  readonly available: boolean;
  readonly configured: boolean;
  readonly source: "postgres";
  readonly reason?: CanonicalReadUnavailabilityReason;
  readonly target?: CanonicalReadTarget;
  readonly checkedAt?: string;
  readonly latencyMs?: number;
  readonly warnings: readonly string[];
}

export interface CanonicalReadError {
  readonly code:
    | "unavailable"
    | "not_found"
    | "tenant_mismatch"
    | "partial_result"
    | "query_failed";
  readonly message: string;
  readonly retryable: boolean;
  readonly detail?: string;
}

export interface MembershipSummary {
  readonly membershipId: string;
  readonly tenantId: string;
  readonly roleId?: string | null;
  readonly roleName?: string | null;
  readonly roleType?: string | null;
  readonly authorityScope?: string | null;
  readonly authorityRank?: number | null;
  readonly delegatedByActorType?: string | null;
  readonly delegatedByActorId?: string | null;
  readonly effectiveFrom?: string | null;
  readonly effectiveUntil?: string | null;
  readonly suspendedAt?: string | null;
  readonly membershipVersion?: string | null;
}

export interface HumanOwnerSummary {
  readonly actorType?: string | null;
  readonly actorId?: string | null;
  readonly displayLabel?: string | null;
}

export interface ActorResolutionResult {
  readonly kind: "actor-resolution";
  readonly status:
    | "resolved"
    | "unresolved"
    | "not-found"
    | "tenant-mismatch"
    | "unavailable";
  readonly resolved: boolean;
  readonly availability: CanonicalReadAvailability;
  readonly actorRef: {
    readonly tenantId: string;
    readonly actorType: "human" | "agent" | "system" | "service";
    readonly actorId: string;
  };
  readonly displayLabel?: string;
  readonly tenantMatch: boolean;
  readonly lifecycleStatus?: string | null;
  readonly active: boolean;
  readonly suspended: boolean;
  readonly archived: boolean;
  readonly sourceTable?: "users" | "agents";
  readonly membershipSummary?: MembershipSummary | null;
  readonly humanOwnerSummary?: HumanOwnerSummary | null;
  readonly managerActorSummary?: HumanOwnerSummary | null;
  readonly replacementActorId?: string | null;
  readonly department?: string | null;
  readonly agentType?: string | null;
  readonly health?: string | null;
  readonly riskLevel?: string | null;
  readonly authorityCeilingSummary?: string | null;
  readonly configProfileVersion?: string | null;
  readonly warnings: readonly string[];
  readonly reason?: string;
  readonly error?: CanonicalReadError;
}

export interface CanonicalKnowledgeFactIdentity {
  readonly tenantId: string;
  readonly factKey: string;
  readonly domainKey: string;
  readonly knowledgeScope: "company-wide" | "department" | "domain";
  readonly factVersion: number;
  readonly selectedAt?: string | null;
  readonly selectedByActorType?: string | null;
  readonly selectedByActorId?: string | null;
  readonly previousKnowledgeNodeId?: string | null;
  readonly governanceSessionId?: string | null;
  readonly ratificationDecisionId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
}

export interface CanonicalKnowledgeNodeSelection {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly refId?: string | null;
  readonly statement?: string | null;
  readonly lifecycleStatus?: string | null;
  readonly health?: string | null;
  readonly authority?: string | null;
  readonly ratificationDecisionId?: string | null;
  readonly governanceSessionId?: string | null;
  readonly ratifiedByActorType?: string | null;
  readonly ratifiedByActorId?: string | null;
  readonly ratifiedAt?: string | null;
  readonly provenance?: Readonly<Record<string, unknown>> | null;
  readonly sourceAttribution?: Readonly<Record<string, unknown>> | null;
  readonly effectiveFrom?: string | null;
  readonly effectiveUntil?: string | null;
  readonly reviewCadence?: string | null;
  readonly nextReviewAt?: string | null;
  readonly freshnessEvaluatedAt?: string | null;
  readonly knowledgeVersion: number;
}

export interface CanonicalKnowledgeFactResult {
  readonly kind: "canonical-knowledge-fact";
  readonly status:
    | "resolved"
    | "partial"
    | "not-found"
    | "tenant-mismatch"
    | "unavailable";
  readonly resolved: boolean;
  readonly availability: CanonicalReadAvailability;
  readonly identity: {
    readonly tenantId: string;
    readonly factKey: string;
    readonly domainKey: string;
    readonly knowledgeScope: "company-wide" | "department" | "domain";
  };
  readonly fact?: CanonicalKnowledgeFactIdentity;
  readonly activeNode?: CanonicalKnowledgeNodeSelection;
  readonly warnings: readonly string[];
  readonly reason?: string;
  readonly error?: CanonicalReadError;
}

export interface LineageNodeReference {
  readonly id: string;
  readonly tenantId: string;
  readonly label?: string | null;
  readonly version?: number | null;
  readonly lifecycleStatus?: string | null;
  readonly health?: string | null;
  readonly legacyStatus?: string | null;
  readonly correlationId?: string | null;
  readonly causationId?: string | null;
  readonly idempotencyKey?: string | null;
  readonly simulationMode?: string | null;
}

export interface DualShapeWarning {
  readonly code: string;
  readonly message: string;
  readonly severity: "info" | "warning";
}

export interface ExecutionLineageResult {
  readonly kind: "execution-lineage";
  readonly status:
    | "resolved"
    | "partial"
    | "not-found"
    | "tenant-mismatch"
    | "unavailable";
  readonly availability: CanonicalReadAvailability;
  readonly executionId: string;
  readonly tenantId: string;
  readonly completeness: "complete" | "partial" | "missing-root";
  readonly execution?: LineageNodeReference;
  readonly command?: LineageNodeReference;
  readonly workflow?: LineageNodeReference;
  readonly task?: LineageNodeReference;
  readonly plan?: LineageNodeReference;
  readonly goal?: LineageNodeReference;
  readonly mission?: LineageNodeReference;
  readonly warnings: readonly DualShapeWarning[];
  readonly reason?: string;
  readonly error?: CanonicalReadError;
}

export interface CanonicalReadServices {
  availability(): Promise<CanonicalReadAvailability>;
  dispose(): Promise<void>;
  resolveActor(input: {
    tenantId: string;
    actorType: "human" | "agent" | "system" | "service";
    actorId: string;
  }): Promise<ActorResolutionResult>;
  selectCanonicalKnowledgeFact(input: {
    tenantId: string;
    factKey: string;
    domainKey: string;
    knowledgeScope: "company-wide" | "department" | "domain";
  }): Promise<CanonicalKnowledgeFactResult>;
  getExecutionLineage(input: {
    tenantId: string;
    executionId: string;
  }): Promise<ExecutionLineageResult>;
}
