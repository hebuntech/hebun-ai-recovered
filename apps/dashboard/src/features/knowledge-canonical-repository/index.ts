import type { CanonicalReadServices } from "@/features/canonical-read";
import {
  createReadRepository,
  createShadowRepository,
  type CanonicalRepositoryDiagnosticsView,
  type ReadRepository,
  type ShadowRepository,
} from "@/features/canonical-repository";
import type { KnowledgeNodeRecord } from "@/features/knowledge-crud/types";
import type {
  KnowledgeReadNodeSummary,
  KnowledgeReadRequest,
  KnowledgeReadWarning,
} from "@/features/knowledge-read-facade/types";

function createWarning(
  code: KnowledgeReadWarning["code"],
  message: string,
): KnowledgeReadWarning {
  return { code, message };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidLike(value: string): boolean {
  return UUID_RE.test(value);
}

function cloneTags(tags: readonly string[]): string[] {
  return [...tags];
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function isTenantTag(tag: string): boolean {
  return normalizeTag(tag).startsWith("tenant:");
}

function memoryNodeTenantId(node: KnowledgeNodeRecord): string | undefined {
  const tag = node.tags.find((entry) => isTenantTag(entry));
  if (!tag) return undefined;
  const candidate = normalizeTag(tag).slice("tenant:".length).trim();
  return candidate || undefined;
}

function memoryNodeDomainKey(node: KnowledgeNodeRecord): string | undefined {
  const domainTag = node.tags.find((tag) => !isTenantTag(tag));
  return domainTag ? normalizeTag(domainTag) : undefined;
}

function memoryNodeScope(
  node: KnowledgeNodeRecord,
): "company-wide" | "department" | "domain" | undefined {
  if (node.ownerType === "organization") return "company-wide";
  if (node.ownerType === "department") return "department";
  return undefined;
}

function findMemoryNode(
  request: KnowledgeReadRequest,
  nodes: readonly KnowledgeNodeRecord[],
): {
  readonly node?: KnowledgeNodeRecord;
  readonly lookupKeyType?: "id" | "slug";
  readonly warnings: readonly KnowledgeReadWarning[];
} {
  const byId = nodes.find((node) => node.id === request.factKey);
  if (byId) {
    return { node: byId, lookupKeyType: "id", warnings: [] };
  }

  const bySlug = nodes.find((node) => node.slug === request.factKey);
  if (bySlug) {
    return {
      node: bySlug,
      lookupKeyType: "slug",
      warnings: [
        createWarning(
          "slug-match",
          "Memory knowledge facade matched the requested factKey against KnowledgeNodeRecord.slug.",
        ),
      ],
    };
  }

  return { warnings: [] };
}

function summarizeMemoryNode(params: {
  readonly request: KnowledgeReadRequest;
  readonly node: KnowledgeNodeRecord;
  readonly lookupKeyType: "id" | "slug";
}): {
  readonly node: KnowledgeReadNodeSummary;
  readonly warnings: readonly KnowledgeReadWarning[];
  readonly nonComparableFields: readonly string[];
} {
  const domainKey = memoryNodeDomainKey(params.node);
  const knowledgeScope = memoryNodeScope(params.node);
  const memoryTenantId = memoryNodeTenantId(params.node);
  const warnings: KnowledgeReadWarning[] = [];
  const nonComparableFields: string[] = [];

  if (!memoryTenantId) {
    warnings.push(
      createWarning(
        "memory-tenant-unavailable",
        "The current memory Knowledge shape does not consistently encode tenant identity, so tenant verification is partial.",
      ),
    );
    nonComparableFields.push("tenantId");
  }

  if (!domainKey) {
    warnings.push(
      createWarning(
        "memory-domain-unavailable",
        "The current memory Knowledge shape does not expose a stable domainKey for this node.",
      ),
    );
    nonComparableFields.push("domainKey");
  }

  if (!knowledgeScope) {
    warnings.push(
      createWarning(
        "memory-scope-unavailable",
        "The current memory Knowledge shape does not expose a stable knowledgeScope for this node.",
      ),
    );
    nonComparableFields.push("knowledgeScope");
  }

  return {
    node: {
      source: "memory",
      logicalIdentity: {
        tenantId: params.request.tenantId,
        factKey: params.request.factKey,
        domainKey,
        knowledgeScope,
        lookupKeyType: params.lookupKeyType,
        nodeId: params.node.id,
      },
      title: params.node.title,
      statementSummary: params.node.description,
      lifecycleStatus: params.node.lifecycleStatus,
      version: params.node.version,
      sourceMetadata: {
        source: params.node.source,
        tags: cloneTags(params.node.tags),
        createdAt: params.node.createdAt,
        updatedAt: params.node.updatedAt,
        createdBy: params.node.createdBy,
        updatedBy: params.node.updatedBy,
      },
      tenantBoundary: {
        requestedTenantId: params.request.tenantId,
        verification: memoryTenantId ? "verified" : "partial",
        memoryTenantId,
      },
    },
    warnings,
    nonComparableFields,
  };
}

export type KnowledgeRepositoryReadStatus =
  | "found"
  | "not-found"
  | "tenant-mismatch"
  | "invalid-input"
  | "unavailable";

export interface KnowledgeRepositoryReadResult {
  readonly status: KnowledgeRepositoryReadStatus;
  readonly node?: KnowledgeReadNodeSummary;
  readonly warnings: readonly KnowledgeReadWarning[];
  readonly nonComparableFields: readonly string[];
}

export interface CreateKnowledgeCanonicalRepositoryOptions {
  readonly memoryNodes: readonly KnowledgeNodeRecord[];
  readonly canonicalReadServices?: CanonicalReadServices;
}

function createMemoryKnowledgeRepository(
  memoryNodes: readonly KnowledgeNodeRecord[],
): ReadRepository<KnowledgeReadRequest, KnowledgeRepositoryReadResult> {
  return createReadRepository({
    descriptor: {
      repository: "knowledge",
      provider: "memory",
      capabilities: {
        read: true,
        write: false,
        shadow: false,
      },
      authoritative: true,
    },
    findOne: async (request) => {
      if (!isUuidLike(request.tenantId) || !request.factKey.trim()) {
        return {
          status: "invalid-input",
          warnings: [
            createWarning(
              "memory-read-failed",
              "Knowledge read facade input is invalid.",
            ),
          ],
          nonComparableFields: [],
        };
      }

      const matched = findMemoryNode(request, memoryNodes);
      if (!matched.node || !matched.lookupKeyType) {
        return {
          status: "not-found",
          warnings: [],
          nonComparableFields: [],
        };
      }

      const memoryTenantId = memoryNodeTenantId(matched.node);
      if (
        memoryTenantId &&
        normalizeTag(memoryTenantId) !== normalizeTag(request.tenantId)
      ) {
        return {
          status: "tenant-mismatch",
          warnings: [],
          nonComparableFields: [],
        };
      }

      const domainKey = memoryNodeDomainKey(matched.node);
      if (
        request.domainKey &&
        domainKey &&
        normalizeTag(request.domainKey) !== domainKey
      ) {
        return {
          status: "not-found",
          warnings: [],
          nonComparableFields: [],
        };
      }

      const knowledgeScope = memoryNodeScope(matched.node);
      if (
        request.knowledgeScope &&
        knowledgeScope &&
        request.knowledgeScope !== knowledgeScope
      ) {
        return {
          status: "not-found",
          warnings: [],
          nonComparableFields: [],
        };
      }

      const summary = summarizeMemoryNode({
        request,
        node: matched.node,
        lookupKeyType: matched.lookupKeyType,
      });

      return {
        status: "found",
        node: summary.node,
        warnings: [...matched.warnings, ...summary.warnings],
        nonComparableFields: [...summary.nonComparableFields],
      };
    },
  });
}

function createPostgresKnowledgeShadowRepository(
  canonicalReadServices?: CanonicalReadServices,
): ShadowRepository<KnowledgeReadRequest, KnowledgeRepositoryReadResult> {
  return createShadowRepository({
    descriptor: {
      repository: "knowledge",
      provider: "postgres",
      capabilities: {
        read: true,
        write: false,
        shadow: true,
      },
      authoritative: false,
    },
    isAvailable: async () => {
      if (!canonicalReadServices) return false;
      const availability = await canonicalReadServices.availability();
      return availability.available;
    },
    findShadow: async (request) => {
      if (!canonicalReadServices) {
        return {
          status: "unavailable",
          warnings: [],
          nonComparableFields: [],
        };
      }

      const result = await canonicalReadServices.selectCanonicalKnowledgeFact({
        tenantId: request.tenantId,
        factKey: request.factKey,
        domainKey: request.domainKey ?? "",
        knowledgeScope: request.knowledgeScope ?? "company-wide",
      });

      if (result.status === "tenant-mismatch") {
        return {
          status: "tenant-mismatch",
          warnings: [],
          nonComparableFields: [],
        };
      }

      if (result.status === "not-found") {
        return {
          status: "not-found",
          warnings: [],
          nonComparableFields: [],
        };
      }

      if (result.status === "unavailable") {
        return {
          status: "unavailable",
          warnings: [],
          nonComparableFields: [],
        };
      }

      if (!result.activeNode) {
        return {
          status: "not-found",
          warnings: [],
          nonComparableFields: [],
        };
      }

      return {
        status: "found",
        node: {
          source: "memory",
          logicalIdentity: {
            tenantId: result.identity.tenantId,
            factKey: result.identity.factKey,
            domainKey: result.identity.domainKey,
            knowledgeScope: result.identity.knowledgeScope,
            lookupKeyType: "id",
            nodeId: result.activeNode.refId ?? result.activeNode.id,
          },
          title: result.activeNode.label,
          statementSummary: result.activeNode.statement ?? "",
          lifecycleStatus: result.activeNode.lifecycleStatus ?? "active",
          version: String(result.activeNode.knowledgeVersion),
          sourceMetadata: {
            source: "canonical-postgres",
            tags: [],
            createdAt: "",
            updatedAt: "",
            createdBy: "",
            updatedBy: "",
          },
          tenantBoundary: {
            requestedTenantId: request.tenantId,
            verification: "verified",
            memoryTenantId: result.identity.tenantId,
          },
        },
        warnings: [],
        nonComparableFields: [],
      };
    },
  });
}

export function createKnowledgeCanonicalRepository(
  options: CreateKnowledgeCanonicalRepositoryOptions,
): {
  readonly authoritative: ReadRepository<
    KnowledgeReadRequest,
    KnowledgeRepositoryReadResult
  >;
  readonly shadow: ShadowRepository<
    KnowledgeReadRequest,
    KnowledgeRepositoryReadResult
  >;
} {
  return {
    authoritative: createMemoryKnowledgeRepository(options.memoryNodes),
    shadow: createPostgresKnowledgeShadowRepository(
      options.canonicalReadServices,
    ),
  };
}

export async function describeKnowledgeCanonicalRepository(
  options: CreateKnowledgeCanonicalRepositoryOptions,
): Promise<CanonicalRepositoryDiagnosticsView> {
  const repositories = createKnowledgeCanonicalRepository(options);

  return {
    repository: repositories.authoritative.descriptor.repository,
    authoritativeProvider: repositories.authoritative.descriptor.provider,
    authoritativeCapabilities:
      repositories.authoritative.descriptor.capabilities,
    shadowProvider: repositories.shadow.descriptor.provider,
    shadowCapabilities: repositories.shadow.descriptor.capabilities,
    readSource: repositories.authoritative.descriptor.provider,
    shadowAvailable: await repositories.shadow.isAvailable(),
  };
}
