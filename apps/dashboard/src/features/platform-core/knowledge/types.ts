/*
 * platform-core / knowledge — declarative knowledge contracts only.
 *
 * Structural types only. No governance resolution, memory promotion, or runtime
 * canonical selection lives here.
 */
export interface KnowledgeScopeReference {
  readonly domainKey?: string;
  readonly categoryKey?: string;
  readonly knowledgeScope?: "company-wide" | "department" | "domain";
}

export interface KnowledgeAuthorityReference {
  readonly ownerActorType?: "human" | "agent" | "system" | "service";
  readonly ownerActorId?: string;
  readonly stewardActorType?: "human" | "agent" | "system" | "service";
  readonly stewardActorId?: string;
  readonly knowledgeAuthority?: "authoritative" | "provisional";
}

export interface KnowledgeRatificationReference {
  readonly governanceSessionId?: string;
  readonly ratificationDecisionId?: string;
  readonly ratifiedByActorType?: "human" | "agent" | "system" | "service";
  readonly ratifiedByActorId?: string;
  readonly ratifiedAt?: string;
}

export interface KnowledgeProvenance {
  readonly provenance?: Readonly<Record<string, unknown>>;
  readonly sourceAttribution?: Readonly<Record<string, unknown>>;
  readonly memoryRefs?: Readonly<Record<string, unknown>>;
}

export interface CanonicalKnowledgeFact {
  readonly factKey: string;
  readonly domainKey: string;
  readonly knowledgeScope: "company-wide" | "department" | "domain";
  readonly activeKnowledgeNodeId?: string;
  readonly previousKnowledgeNodeId?: string;
  readonly factVersion?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface KnowledgeSelection {
  readonly activeKnowledgeNodeId?: string;
  readonly previousKnowledgeNodeId?: string;
  readonly selectedAt?: string;
  readonly selectedByActorType?: "human" | "agent" | "system" | "service";
  readonly selectedByActorId?: string;
}
