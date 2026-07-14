import type { CanonicalReadAvailability } from "@/features/canonical-read";
import type {
  ReadFieldComparisonStatus,
  ReadSourceAvailability,
  ReadStatus,
} from "@/features/canonical-read-platform";

export type KnowledgeShadowReadStatus = ReadStatus;

export type KnowledgeShadowMismatchCategory =
  | "identity mismatch"
  | "content mismatch"
  | "lifecycle mismatch"
  | "health mismatch"
  | "authority mismatch"
  | "version mismatch"
  | "provenance mismatch"
  | "freshness mismatch"
  | "missing canonical selection"
  | "missing memory representation"
  | "tenant mismatch"
  | "unavailable source"
  | "non-comparable shape";

export type KnowledgeFieldComparisonStatus = ReadFieldComparisonStatus;

export interface KnowledgeShadowReadInput {
  readonly tenantId: string;
  readonly factKey: string;
  readonly domainKey: string;
  readonly knowledgeScope: "company-wide" | "department" | "domain";
}

export type KnowledgeShadowReadSourceAvailability = ReadSourceAvailability;

export interface MemoryKnowledgeShadowSummary {
  readonly lookupKey: string;
  readonly lookupKeyType: "id" | "slug";
  readonly nodeId: string;
  readonly title: string;
  readonly statementSummary: string;
  readonly lifecycleStatus: string;
  readonly health?: string;
  readonly authority?: string;
  readonly ratificationPresent?: boolean;
  readonly version: string;
  readonly domainKey?: string;
  readonly knowledgeScope?: "company-wide" | "department" | "domain";
  readonly provenance?: Readonly<Record<string, unknown>>;
  readonly sourceAttribution?: Readonly<Record<string, unknown>>;
  readonly freshnessUpdatedAt?: string;
  readonly supersessionState?: string;
}

export interface PostgresKnowledgeShadowSummary {
  readonly factKey: string;
  readonly domainKey: string;
  readonly knowledgeScope: "company-wide" | "department" | "domain";
  readonly nodeId?: string;
  readonly refId?: string | null;
  readonly title?: string;
  readonly statementSummary?: string | null;
  readonly lifecycleStatus?: string | null;
  readonly health?: string | null;
  readonly authority?: string | null;
  readonly ratificationPresent: boolean;
  readonly version?: number;
  readonly provenance?: Readonly<Record<string, unknown>> | null;
  readonly sourceAttribution?: Readonly<Record<string, unknown>> | null;
  readonly freshnessUpdatedAt?: string | null;
  readonly reviewAt?: string | null;
  readonly supersessionState?: string;
}

export interface KnowledgeFieldComparison {
  readonly field:
    | "tenantId"
    | "factKey"
    | "domainKey"
    | "knowledgeScope"
    | "title"
    | "statementSummary"
    | "nodeIdentity"
    | "lifecycleStatus"
    | "health"
    | "authority"
    | "ratificationPresence"
    | "version"
    | "supersessionState"
    | "provenance"
    | "sourceAttribution"
    | "freshnessUpdatedAt"
    | "reviewAt";
  readonly category:
    | "identity"
    | "content"
    | "governance"
    | "versioning"
    | "trust"
    | "freshness";
  readonly status: KnowledgeFieldComparisonStatus;
  readonly memoryValue?: string | number | boolean | Readonly<Record<string, unknown>> | null;
  readonly postgresValue?: string | number | boolean | Readonly<Record<string, unknown>> | null;
  readonly note?: string;
}

export interface KnowledgeShadowReadDiff {
  readonly mismatches: readonly KnowledgeFieldComparison[];
  readonly matchedFields: readonly KnowledgeFieldComparison[];
  readonly nonComparableFields: readonly KnowledgeFieldComparison[];
  readonly missingFields: readonly KnowledgeFieldComparison[];
  readonly mismatchCategories: readonly KnowledgeShadowMismatchCategory[];
}

export interface KnowledgeShadowReadResult {
  readonly kind: "knowledge-shadow-read";
  readonly input: KnowledgeShadowReadInput;
  readonly status: KnowledgeShadowReadStatus;
  readonly memory: {
    readonly found: boolean;
    readonly summary?: MemoryKnowledgeShadowSummary;
  };
  readonly postgres: {
    readonly found: boolean;
    readonly availability: CanonicalReadAvailability;
    readonly summary?: PostgresKnowledgeShadowSummary;
    readonly reason?: string;
  };
  readonly sourceAvailability: KnowledgeShadowReadSourceAvailability;
  readonly diff: KnowledgeShadowReadDiff;
  readonly warnings: readonly string[];
  readonly comparedAt: string;
}
