import { getNodeSnapshot } from "@/features/knowledge-crud/node-adapter";
import type { KnowledgeNodeRecord } from "@/features/knowledge-crud/types";
import type { CanonicalReadServices } from "@/features/canonical-read";
import { createKnowledgeCanonicalRepository } from "@/features/knowledge-canonical-repository";
import type { KnowledgeSilentDualReadMetricsSink } from "@/features/knowledge-silent-dual-read";
import type {
  KnowledgeReadRequest,
  KnowledgeReadResult,
  KnowledgeReadWarning,
} from "./types";
import { routeKnowledgeRead } from "./router";

function assertServerSideKnowledgeFacade(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "knowledge-read-facade is server-side only and must not be imported by client components.",
    );
  }
}

function createWarning(
  code: KnowledgeReadWarning["code"],
  message: string,
): KnowledgeReadWarning {
  return { code, message };
}

function baseResult(
  request: KnowledgeReadRequest,
): Omit<KnowledgeReadResult, "status" | "found" | "availability"> {
  return {
    kind: "knowledge-read-facade",
    request,
    source: "memory",
    warnings: [],
    nonComparableFields: [],
    readAt: new Date().toISOString(),
  };
}

export interface ReadKnowledgeFromMemoryFacadeOptions {
  readonly memoryNodes?: readonly KnowledgeNodeRecord[];
  readonly env?: NodeJS.ProcessEnv;
  readonly metricsSink?: KnowledgeSilentDualReadMetricsSink;
  readonly canonicalReadServices?: CanonicalReadServices;
}

export async function readKnowledgeFromMemoryFacade(
  request: KnowledgeReadRequest,
  options: ReadKnowledgeFromMemoryFacadeOptions = {},
): Promise<KnowledgeReadResult> {
  assertServerSideKnowledgeFacade();

  try {
    const memoryNodes = options.memoryNodes ?? getNodeSnapshot();
    const repository = createKnowledgeCanonicalRepository({
      memoryNodes,
      canonicalReadServices: options.canonicalReadServices,
    });

    return routeKnowledgeRead({
      env: options.env,
      memoryNodes,
      metricsSink: options.metricsSink,
      canonicalReadServices: options.canonicalReadServices,
      executeAuthoritative: async () => {
        const match = await repository.authoritative.findOne(request);
        const result = baseResult(request);

        if (match.status === "invalid-input") {
          return {
            ...result,
            status: "invalid-input",
            found: false,
            availability: {
              available: false,
              source: "memory",
              reason: "invalid-input",
            },
            warnings: [...match.warnings],
          };
        }

        if (match.status === "not-found") {
          return {
            ...result,
            status: "not-found",
            found: false,
            availability: {
              available: true,
              source: "memory",
            },
          };
        }

        if (match.status === "tenant-mismatch") {
          return {
            ...result,
            status: "tenant-mismatch",
            found: false,
            availability: {
              available: true,
              source: "memory",
            },
          };
        }

        if (match.status !== "found" || !match.node) {
          const result = baseResult(request);
          return {
            ...result,
            status: "unavailable",
            found: false,
            availability: {
              available: false,
              source: "memory",
              reason: "memory-read-failed",
            },
            warnings: [
              createWarning(
                "memory-read-failed",
                "Memory knowledge facade could not resolve the in-memory knowledge record.",
              ),
            ],
          };
        }

        return {
          ...result,
          status: "found",
          found: true,
          availability: {
            available: true,
            source: "memory",
          },
          node: match.node,
          warnings: [...match.warnings],
          nonComparableFields: [...match.nonComparableFields],
        };
      },
    });
  } catch {
    const result = baseResult(request);
    return {
      ...result,
      status: "unavailable",
      found: false,
      availability: {
        available: false,
        source: "memory",
        reason: "memory-read-failed",
      },
      warnings: [
        createWarning(
          "memory-read-failed",
          "Memory knowledge facade could not read the in-memory knowledge snapshot.",
        ),
      ],
    };
  }
}
