import type {
  KnowledgeFieldComparison,
  KnowledgeShadowMismatchCategory,
  KnowledgeShadowReadResult,
  MemoryKnowledgeShadowSummary,
  PostgresKnowledgeShadowSummary,
} from "./types";
import {
  compareReadField,
  partitionReadComparisons,
} from "@/features/canonical-read-platform";

function classifyMismatch(field: KnowledgeFieldComparison["field"]): KnowledgeShadowMismatchCategory {
  switch (field) {
    case "tenantId":
    case "factKey":
    case "domainKey":
    case "knowledgeScope":
    case "nodeIdentity":
      return "identity mismatch";
    case "title":
    case "statementSummary":
      return "content mismatch";
    case "lifecycleStatus":
      return "lifecycle mismatch";
    case "health":
      return "health mismatch";
    case "authority":
    case "ratificationPresence":
      return "authority mismatch";
    case "version":
    case "supersessionState":
      return "version mismatch";
    case "provenance":
    case "sourceAttribution":
      return "provenance mismatch";
    case "freshnessUpdatedAt":
    case "reviewAt":
      return "freshness mismatch";
  }
}

function compareField(params: {
  field: KnowledgeFieldComparison["field"];
  category: KnowledgeFieldComparison["category"];
  memoryValue?: string | number | boolean | Readonly<Record<string, unknown>> | null;
  postgresValue?: string | number | boolean | Readonly<Record<string, unknown>> | null;
  memoryComparable?: boolean;
  postgresComparable?: boolean;
  normalize?: "identifier" | "text" | "json" | "exact";
  note?: string;
}): KnowledgeFieldComparison {
  return compareReadField({
    memoryValue: params.memoryValue,
    postgresValue: params.postgresValue,
    memoryComparable: params.memoryComparable,
    postgresComparable: params.postgresComparable,
    normalize: params.normalize,
    create: (status) => ({
      field: params.field,
      category: params.category,
      status,
      memoryValue: params.memoryValue ?? null,
      postgresValue: params.postgresValue ?? null,
      note: params.note,
    }),
  });
}

export function compareKnowledgeShadow(params: {
  input: KnowledgeShadowReadResult["input"];
  memory?: MemoryKnowledgeShadowSummary;
  postgres?: PostgresKnowledgeShadowSummary;
}): KnowledgeShadowReadResult["diff"] {
  const comparisons: KnowledgeFieldComparison[] = [
    compareField({
      field: "tenantId",
      category: "identity",
      memoryValue: params.input.tenantId,
      postgresValue: params.input.tenantId,
      memoryComparable: false,
      note: "The current memory Knowledge shape is not tenant-scoped.",
    }),
    compareField({
      field: "factKey",
      category: "identity",
      memoryValue: params.memory?.lookupKey,
      postgresValue: params.postgres?.factKey ?? params.input.factKey,
      normalize: "identifier",
    }),
    compareField({
      field: "domainKey",
      category: "identity",
      memoryValue: params.memory?.domainKey ?? null,
      postgresValue: params.postgres?.domainKey ?? params.input.domainKey,
      normalize: "identifier",
      note:
        "Memory domainKey is derived from the seeded node tag when available.",
    }),
    compareField({
      field: "knowledgeScope",
      category: "identity",
      memoryValue: params.memory?.knowledgeScope ?? null,
      postgresValue: params.postgres?.knowledgeScope ?? params.input.knowledgeScope,
      normalize: "identifier",
      note:
        "Memory knowledgeScope is derived from ownerType when available.",
    }),
    compareField({
      field: "title",
      category: "content",
      memoryValue: params.memory?.title,
      postgresValue: params.postgres?.title,
      normalize: "text",
    }),
    compareField({
      field: "statementSummary",
      category: "content",
      memoryValue: params.memory?.statementSummary,
      postgresValue: params.postgres?.statementSummary ?? null,
      normalize: "text",
    }),
    compareField({
      field: "nodeIdentity",
      category: "identity",
      memoryValue: params.memory?.nodeId,
      postgresValue: params.postgres?.refId ?? params.postgres?.nodeId ?? null,
      normalize: "identifier",
      note:
        "Canonical comparison prefers knowledge_nodes.ref_id before the canonical node id.",
    }),
    compareField({
      field: "lifecycleStatus",
      category: "governance",
      memoryValue: params.memory?.lifecycleStatus,
      postgresValue: params.postgres?.lifecycleStatus ?? null,
      normalize: "identifier",
    }),
    compareField({
      field: "health",
      category: "governance",
      memoryValue: params.memory?.health ?? null,
      postgresValue: params.postgres?.health ?? null,
      memoryComparable: params.memory?.health != null,
      note:
        "The current memory Knowledge shape does not expose a canonical health field.",
    }),
    compareField({
      field: "authority",
      category: "governance",
      memoryValue: params.memory?.authority ?? null,
      postgresValue: params.postgres?.authority ?? null,
      memoryComparable: params.memory?.authority != null,
      note:
        "The current memory Knowledge shape does not expose canonical authority semantics.",
    }),
    compareField({
      field: "ratificationPresence",
      category: "governance",
      memoryValue: params.memory?.ratificationPresent ?? null,
      postgresValue: params.postgres?.ratificationPresent ?? null,
      memoryComparable: params.memory?.ratificationPresent != null,
      note:
        "The current memory Knowledge shape has no ratification metadata.",
    }),
    compareField({
      field: "version",
      category: "versioning",
      memoryValue: params.memory?.version ?? null,
      postgresValue:
        params.postgres?.version != null ? String(params.postgres.version) : null,
      note:
        "Memory version is an opaque string while canonical Knowledge uses an integer lineage.",
    }),
    compareField({
      field: "supersessionState",
      category: "versioning",
      memoryValue: params.memory?.supersessionState ?? null,
      postgresValue: params.postgres?.supersessionState ?? null,
      memoryComparable: params.memory?.supersessionState != null,
      note:
        "The current memory Knowledge shape has no explicit supersession metadata.",
    }),
    compareField({
      field: "provenance",
      category: "trust",
      memoryValue: params.memory?.provenance ?? null,
      postgresValue: params.postgres?.provenance ?? null,
      memoryComparable: params.memory?.provenance != null,
      normalize: "json",
      note:
        "The current memory Knowledge shape exposes only a coarse source string, not structured provenance.",
    }),
    compareField({
      field: "sourceAttribution",
      category: "trust",
      memoryValue: params.memory?.sourceAttribution ?? null,
      postgresValue: params.postgres?.sourceAttribution ?? null,
      memoryComparable: params.memory?.sourceAttribution != null,
      normalize: "json",
      note:
        "The current memory Knowledge shape does not expose structured source attribution.",
    }),
    compareField({
      field: "freshnessUpdatedAt",
      category: "freshness",
      memoryValue: params.memory?.freshnessUpdatedAt ?? null,
      postgresValue: params.postgres?.freshnessUpdatedAt ?? null,
    }),
    compareField({
      field: "reviewAt",
      category: "freshness",
      memoryValue: null,
      postgresValue: params.postgres?.reviewAt ?? null,
      memoryComparable: false,
      note:
        "The current memory Knowledge shape does not expose review scheduling metadata.",
    }),
  ];

  const {
    matchedFields,
    mismatches,
    nonComparableFields,
    missingFields,
  } = partitionReadComparisons(comparisons);

  const categories: KnowledgeShadowMismatchCategory[] = [
    ...mismatches.map((item) => classifyMismatch(item.field)),
    ...nonComparableFields.map(
      () => "non-comparable shape" as KnowledgeShadowMismatchCategory,
    ),
    ...missingFields.map((item) =>
      item.status === "missing-memory"
        ? ("missing memory representation" as KnowledgeShadowMismatchCategory)
        : ("missing canonical selection" as KnowledgeShadowMismatchCategory),
    ),
  ];

  const mismatchCategories = [
    ...new Set<KnowledgeShadowMismatchCategory>(categories),
  ];

  return {
    mismatches,
    matchedFields,
    nonComparableFields,
    missingFields,
    mismatchCategories,
  };
}
