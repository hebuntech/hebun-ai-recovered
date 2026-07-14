/*
 * platform-core / memory — declarative memory contracts only.
 *
 * Structural types only. No retrieval, promotion, retention, or storage
 * implementation lives here.
 */
export interface WorkingMemoryProfile {
  readonly sessionScope?: Readonly<Record<string, unknown>>;
  readonly activeContext?: Readonly<Record<string, unknown>>;
  readonly constraints?: Readonly<Record<string, unknown>>;
  readonly expiresAt?: string;
}

export interface WorkingMemorySession {
  readonly sessionKey: string;
  readonly agentId?: string;
  readonly contextType?: string;
  readonly contextId?: string;
  readonly lifecycleStatus?:
    | "created"
    | "hydrated"
    | "active"
    | "updated"
    | "compressed"
    | "expired"
    | "disposed"
    | "archived";
  readonly health?: "unknown" | "healthy" | "degraded" | "overflow" | "corrupted";
  readonly profile?: WorkingMemoryProfile;
}

export interface LongTermMemoryRecord {
  readonly kind?: "episodic" | "semantic" | "procedural";
  readonly scope?: "personal" | "shared" | "organizational";
  readonly namespace?: string;
  readonly collection?: string;
  readonly provenance?: Readonly<Record<string, unknown>>;
  readonly lineage?: Readonly<Record<string, unknown>>;
  readonly trust?: Readonly<Record<string, unknown>>;
  readonly quality?: Readonly<Record<string, unknown>>;
  readonly storageMetadata?: Readonly<Record<string, unknown>>;
  readonly memoryVersion?: number;
}

export interface MemoryPromotionCandidate {
  readonly sourceSessionKey?: string;
  readonly rationale?: Readonly<Record<string, unknown>>;
  readonly promotionMetadata?: Readonly<Record<string, unknown>>;
}

export interface MemoryRetentionPolicy {
  readonly retentionMetadata?: Readonly<Record<string, unknown>>;
  readonly agingMetadata?: Readonly<Record<string, unknown>>;
  readonly correctionMetadata?: Readonly<Record<string, unknown>>;
  readonly supersessionMetadata?: Readonly<Record<string, unknown>>;
}
