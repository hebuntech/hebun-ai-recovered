export type KnowledgeReadFacadeStatus =
  | "found"
  | "not-found"
  | "invalid-input"
  | "tenant-mismatch"
  | "unavailable";

export type KnowledgeReadFacadeWarningCode =
  | "memory-tenant-unavailable"
  | "memory-domain-unavailable"
  | "memory-scope-unavailable"
  | "slug-match"
  | "memory-read-failed";

export interface KnowledgeReadWarning {
  readonly code: KnowledgeReadFacadeWarningCode;
  readonly message: string;
}

export interface KnowledgeReadAvailability {
  readonly available: boolean;
  readonly source: "memory";
  readonly reason?: "invalid-input" | "memory-read-failed";
}

export interface KnowledgeReadRequest {
  readonly tenantId: string;
  readonly factKey: string;
  readonly domainKey?: string;
  readonly knowledgeScope?: "company-wide" | "department" | "domain";
}

export interface KnowledgeReadLogicalIdentity {
  readonly tenantId: string;
  readonly factKey: string;
  readonly domainKey?: string;
  readonly knowledgeScope?: "company-wide" | "department" | "domain";
  readonly lookupKeyType: "id" | "slug";
  readonly nodeId: string;
}

export interface KnowledgeReadNodeSummary {
  readonly source: "memory";
  readonly logicalIdentity: KnowledgeReadLogicalIdentity;
  readonly title: string;
  readonly statementSummary: string;
  readonly lifecycleStatus: string;
  readonly version: string;
  readonly sourceMetadata: {
    readonly source: string;
    readonly tags: readonly string[];
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly createdBy: string;
    readonly updatedBy: string;
  };
  readonly tenantBoundary: {
    readonly requestedTenantId: string;
    readonly verification: "verified" | "partial";
    readonly memoryTenantId?: string;
  };
}

export interface KnowledgeReadResult {
  readonly kind: "knowledge-read-facade";
  readonly status: KnowledgeReadFacadeStatus;
  readonly request: KnowledgeReadRequest;
  readonly found: boolean;
  readonly availability: KnowledgeReadAvailability;
  readonly source: "memory";
  readonly node?: KnowledgeReadNodeSummary;
  readonly warnings: readonly KnowledgeReadWarning[];
  readonly nonComparableFields: readonly string[];
  readonly readAt: string;
}
