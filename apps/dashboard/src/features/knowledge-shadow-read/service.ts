import {
  createCanonicalReadServices,
  type CanonicalReadServices,
} from "@/features/canonical-read";
import {
  createReadComparisonResult,
  createReadComparedAt,
  createUnavailableReadAvailability,
  deriveReadMatchStatus,
  deriveReadPresenceStatus,
  isReadUuidLike,
} from "@/features/canonical-read-platform";
import { getNodeSnapshot } from "@/features/knowledge-crud/node-adapter";
import type { KnowledgeNodeRecord } from "@/features/knowledge-crud";
import { readCanonicalReadConfigFromEnv } from "@/features/canonical-read/config";
import { compareKnowledgeShadow } from "./comparator";
import type {
  KnowledgeShadowReadInput,
  KnowledgeShadowReadResult,
  MemoryKnowledgeShadowSummary,
  PostgresKnowledgeShadowSummary,
} from "./types";

function memoryNodeDomainKey(node: KnowledgeNodeRecord): string | undefined {
  return node.tags[0]?.trim().toLowerCase();
}

function memoryNodeScope(
  node: KnowledgeNodeRecord,
): "company-wide" | "department" | "domain" | undefined {
  if (node.ownerType === "organization") return "company-wide";
  if (node.ownerType === "department") return "department";
  return undefined;
}

function summarizeMemoryNode(
  node: KnowledgeNodeRecord,
  lookupKeyType: "id" | "slug",
): MemoryKnowledgeShadowSummary {
  return {
    lookupKey: lookupKeyType === "id" ? node.id : node.slug,
    lookupKeyType,
    nodeId: node.id,
    title: node.title,
    statementSummary: node.description,
    lifecycleStatus: node.lifecycleStatus,
    version: node.version,
    domainKey: memoryNodeDomainKey(node),
    knowledgeScope: memoryNodeScope(node),
    freshnessUpdatedAt: node.updatedAt,
  };
}

function summarizePostgres(
  result: Awaited<ReturnType<CanonicalReadServices["selectCanonicalKnowledgeFact"]>>,
): PostgresKnowledgeShadowSummary | undefined {
  if (!result.fact && !result.activeNode) return undefined;

  return {
    factKey: result.fact?.factKey ?? result.identity.factKey,
    domainKey: result.fact?.domainKey ?? result.identity.domainKey,
    knowledgeScope:
      result.fact?.knowledgeScope ?? result.identity.knowledgeScope,
    nodeId: result.activeNode?.id,
    refId: result.activeNode?.refId,
    title: result.activeNode?.label,
    statementSummary: result.activeNode?.statement ?? null,
    lifecycleStatus: result.activeNode?.lifecycleStatus ?? null,
    health: result.activeNode?.health ?? null,
    authority: result.activeNode?.authority ?? null,
    ratificationPresent: Boolean(
      result.activeNode?.ratificationDecisionId || result.activeNode?.ratifiedAt,
    ),
    version: result.activeNode?.knowledgeVersion,
    provenance: result.activeNode?.provenance ?? null,
    sourceAttribution: result.activeNode?.sourceAttribution ?? null,
    freshnessUpdatedAt: result.activeNode?.freshnessEvaluatedAt ?? null,
    reviewAt: result.activeNode?.nextReviewAt ?? null,
    supersessionState:
      result.activeNode?.lifecycleStatus === "superseded"
        ? "superseded"
        : undefined,
  };
}

function findMemoryNode(
  input: KnowledgeShadowReadInput,
  nodes: readonly KnowledgeNodeRecord[],
): {
  readonly summary?: MemoryKnowledgeShadowSummary;
  readonly warnings: readonly string[];
} {
  const byId = nodes.find((node) => node.id === input.factKey);
  if (byId) {
    return {
      summary: summarizeMemoryNode(byId, "id"),
      warnings: [],
    };
  }

  const bySlug = nodes.find((node) => node.slug === input.factKey);
  if (bySlug) {
    return {
      summary: summarizeMemoryNode(bySlug, "slug"),
      warnings: [
        "Memory-side comparison matched the requested factKey against KnowledgeNodeRecord.slug.",
      ],
    };
  }

  return {
    warnings: [
      "No memory Knowledge node matched the requested factKey by exact id or slug.",
    ],
  };
}

export interface KnowledgeShadowReadServiceOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly canonicalReadServices?: CanonicalReadServices;
  readonly memoryNodes?: readonly KnowledgeNodeRecord[];
}

export async function runKnowledgeShadowRead(
  input: KnowledgeShadowReadInput,
  options: KnowledgeShadowReadServiceOptions = {},
): Promise<KnowledgeShadowReadResult> {
  if (
    !isReadUuidLike(input.tenantId) ||
    !input.factKey.trim() ||
    !input.domainKey.trim() ||
    !["company-wide", "department", "domain"].includes(input.knowledgeScope)
  ) {
    return createReadComparisonResult({
      kind: "knowledge-shadow-read",
      input,
      status: "invalid-input",
      postgresAvailability: createUnavailableReadAvailability(),
      postgresReason: "invalid-input",
      diff: {
        mismatches: [],
        matchedFields: [],
        nonComparableFields: [],
        missingFields: [],
        mismatchCategories: [],
      },
      warnings: ["Knowledge shadow read input is invalid."],
      comparedAt: createReadComparedAt(),
    });
  }

  const ownServices = !options.canonicalReadServices;
  const services =
    options.canonicalReadServices ??
    createCanonicalReadServices(
      readCanonicalReadConfigFromEnv(options.env ?? process.env),
    );
  const memoryNodes = options.memoryNodes ?? getNodeSnapshot();

  try {
    const memoryResult = findMemoryNode(input, memoryNodes);
    const canonical = await services.selectCanonicalKnowledgeFact(input);
    const memorySummary = memoryResult.summary;
    const postgresSummary = summarizePostgres(canonical);
    const diff = compareKnowledgeShadow({
      input,
      memory: memorySummary,
      postgres: postgresSummary,
    });

    const warnings = [...memoryResult.warnings, ...canonical.warnings];
    const comparedAt = createReadComparedAt();

    if (canonical.status === "tenant-mismatch") {
      return createReadComparisonResult({
        kind: "knowledge-shadow-read",
        input,
        status: "tenant-mismatch",
        memorySummary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    if (canonical.status === "unavailable") {
      return createReadComparisonResult({
        kind: "knowledge-shadow-read",
        input,
        status: "unavailable",
        memorySummary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    const presenceStatus = deriveReadPresenceStatus({
      memoryFound: Boolean(memorySummary),
      postgresFound: Boolean(postgresSummary),
    });

    if (presenceStatus === "not-found") {
      return createReadComparisonResult({
        kind: "knowledge-shadow-read",
        input,
        status: "not-found",
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    if (presenceStatus === "memory-only") {
      return createReadComparisonResult({
        kind: "knowledge-shadow-read",
        input,
        status: "memory-only",
        memorySummary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    if (presenceStatus === "postgres-only") {
      return createReadComparisonResult({
        kind: "knowledge-shadow-read",
        input,
        status: "postgres-only",
        postgresAvailability: canonical.availability,
        postgresSummary,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    const status = deriveReadMatchStatus(diff);

    return createReadComparisonResult({
      kind: "knowledge-shadow-read",
      input,
      status,
      memorySummary,
      postgresAvailability: canonical.availability,
      postgresSummary,
      postgresReason: canonical.reason,
      diff,
      warnings,
      comparedAt,
    });
  } finally {
    if (ownServices) {
      await services.dispose();
    }
  }
}
