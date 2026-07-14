import {
  createCanonicalReadServices,
  type ActorResolutionResult,
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
import { readCanonicalReadConfigFromEnv } from "@/features/canonical-read/config";
import { getSnapshot as getAgentSnapshot } from "@/features/agent-crud/agent-adapter";
import { compareActorShadow } from "./comparator";
import type {
  ActorShadowReadInput,
  ActorShadowReadResult,
  MemoryActorShadowSummary,
  PostgresActorShadowSummary,
} from "./types";

function summarizePostgresActor(
  result: ActorResolutionResult,
): PostgresActorShadowSummary | undefined {
  if (
    result.status === "unavailable" ||
    result.status === "not-found" ||
    result.status === "tenant-mismatch"
  ) {
    return undefined;
  }

  return {
    source: "canonical-actor-resolution",
    actorType: result.actorRef.actorType,
    actorId: result.actorRef.actorId,
    tenantId: result.actorRef.tenantId,
    resolved: result.resolved,
    displayLabel: result.displayLabel ?? null,
    lifecycleStatus: result.lifecycleStatus ?? null,
    active: result.active,
    suspended: result.suspended,
    archived: result.archived,
    sourceTable: result.sourceTable,
    membership: result.membershipSummary
      ? {
          membershipExists: true,
          membershipId: result.membershipSummary.membershipId,
          tenantId: result.membershipSummary.tenantId,
          roleId: result.membershipSummary.roleId ?? null,
          roleName: result.membershipSummary.roleName ?? null,
          roleType: result.membershipSummary.roleType ?? null,
          authorityScope: result.membershipSummary.authorityScope ?? null,
          delegatedByActorType:
            result.membershipSummary.delegatedByActorType ?? null,
          delegatedByActorId:
            result.membershipSummary.delegatedByActorId ?? null,
          authorityRank: result.membershipSummary.authorityRank ?? null,
          effectiveFrom: result.membershipSummary.effectiveFrom ?? null,
          effectiveUntil: result.membershipSummary.effectiveUntil ?? null,
          suspendedAt: result.membershipSummary.suspendedAt ?? null,
          membershipVersion: result.membershipSummary.membershipVersion ?? null,
        }
      : result.actorRef.actorType === "human"
        ? { membershipExists: false }
        : null,
    ownership:
      result.humanOwnerSummary ||
      result.managerActorSummary ||
      result.replacementActorId != null
        ? {
            humanOwnerActorType: result.humanOwnerSummary?.actorType ?? null,
            humanOwnerActorId: result.humanOwnerSummary?.actorId ?? null,
            humanOwnerDisplayLabel:
              result.humanOwnerSummary?.displayLabel ?? null,
            managerActorType: result.managerActorSummary?.actorType ?? null,
            managerActorId: result.managerActorSummary?.actorId ?? null,
            managerDisplayLabel:
              result.managerActorSummary?.displayLabel ?? null,
            replacementActorId: result.replacementActorId ?? null,
          }
        : null,
    department: result.department ?? null,
    agentType: result.agentType ?? null,
    health: result.health ?? null,
    riskLevel: result.riskLevel ?? null,
    authority:
      result.membershipSummary ||
      result.authorityCeilingSummary != null ||
      result.configProfileVersion != null
        ? {
            roleRank: result.membershipSummary?.authorityRank ?? null,
            authorityScope: result.membershipSummary?.authorityScope ?? null,
            delegatedByActorType:
              result.membershipSummary?.delegatedByActorType ?? null,
            delegatedByActorId:
              result.membershipSummary?.delegatedByActorId ?? null,
            authorityCeilingSummary: result.authorityCeilingSummary ?? null,
            configProfileVersion: result.configProfileVersion ?? null,
          }
        : null,
    unresolvedReason: result.reason ?? null,
  };
}

function summarizeMemoryActor(
  input: ActorShadowReadInput,
): {
  readonly summary?: MemoryActorShadowSummary;
  readonly warnings: readonly string[];
} {
  if (input.actorType === "human") {
    return {
      warnings: [
        "The current memory runtime has no stable in-memory human registry or membership repository to compare against canonical PostgreSQL actor resolution.",
      ],
    };
  }

  if (input.actorType === "system" || input.actorType === "service") {
    return {
      summary: {
        source: "machine-actor-reference",
        actorType: input.actorType,
        actorId: input.actorId,
      },
      warnings: [
        "System and service actors are represented only as actor references in the current runtime. No memory registry row exists for comparison.",
      ],
    };
  }

  const agent = getAgentSnapshot().find((candidate) => candidate.id === input.actorId);
  if (!agent) {
    return {
      warnings: ["No memory agent record matched the requested actorId."],
    };
  }

  return {
    summary: {
      source: "agent-crud",
      actorType: "agent",
      actorId: agent.id,
      displayLabel: agent.name,
      lifecycleStatus: agent.lifecycleStatus,
      active: agent.lifecycleStatus === "active",
      suspended: false,
      archived: agent.lifecycleStatus === "archived",
      department: agent.department,
      authority: {
        configProfileVersion: agent.version,
      },
    },
    warnings: [
      "The current memory agent record is not tenant-scoped and does not expose canonical human-owner, manager, health, type, risk, or authority-ceiling fields.",
    ],
  };
}

export interface ActorShadowReadServiceOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly canonicalReadServices?: CanonicalReadServices;
  readonly memorySummary?: MemoryActorShadowSummary;
}

export async function runActorShadowRead(
  input: ActorShadowReadInput,
  options: ActorShadowReadServiceOptions = {},
): Promise<ActorShadowReadResult> {
  if (
    !isReadUuidLike(input.tenantId) ||
    !isReadUuidLike(input.actorId) ||
    !["human", "agent", "system", "service"].includes(input.actorType)
  ) {
    return createReadComparisonResult({
      kind: "actor-shadow-read",
      input,
      status: "invalid-input",
      postgresAvailability: createUnavailableReadAvailability(),
      postgresReason: "invalid-input",
      diff: {
        mismatches: [],
        matchedFields: [],
        nonComparableFields: [],
        missingFields: [],
        membershipDifferences: [],
        authorityDifferences: [],
        mismatchCategories: [],
      },
      warnings: ["Actor shadow read input is invalid."],
      comparedAt: createReadComparedAt(),
    });
  }

  const ownServices = !options.canonicalReadServices;
  const services =
    options.canonicalReadServices ??
    createCanonicalReadServices(
      readCanonicalReadConfigFromEnv(options.env ?? process.env),
    );

  try {
    const memoryResult = options.memorySummary
      ? { summary: options.memorySummary, warnings: [] as string[] }
      : summarizeMemoryActor(input);
    const canonical = await services.resolveActor(input);
    const postgresSummary = summarizePostgresActor(canonical);
    const diff = compareActorShadow({
      input,
      memory: memoryResult.summary,
      postgres: postgresSummary,
    });
    const comparedAt = createReadComparedAt();
    const warnings = [...memoryResult.warnings, ...canonical.warnings];

    if (input.actorType === "system" || input.actorType === "service") {
      return createReadComparisonResult({
        kind: "actor-shadow-read",
        input,
        status: "unresolved-actor-type",
        memorySummary: memoryResult.summary,
        postgresAvailability: canonical.availability,
        postgresSummary,
        postgresReason: canonical.reason,
        diff: {
          ...diff,
          mismatchCategories: [
            ...diff.mismatchCategories,
            "unresolved system/service actor",
          ],
        },
        warnings,
        comparedAt,
      });
    }

    if (canonical.status === "tenant-mismatch") {
      return createReadComparisonResult({
        kind: "actor-shadow-read",
        input,
        status: "tenant-mismatch",
        memorySummary: memoryResult.summary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    if (canonical.status === "unavailable") {
      return createReadComparisonResult({
        kind: "actor-shadow-read",
        input,
        status: "unavailable",
        memorySummary: memoryResult.summary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff: {
          ...diff,
          mismatchCategories: [
            ...diff.mismatchCategories,
            "unavailable source",
          ],
        },
        warnings,
        comparedAt,
      });
    }

    const presenceStatus = deriveReadPresenceStatus({
      memoryFound: Boolean(memoryResult.summary),
      postgresFound: Boolean(postgresSummary),
    });

    if (presenceStatus === "memory-only") {
      return createReadComparisonResult({
        kind: "actor-shadow-read",
        input,
        status: "memory-only",
        memorySummary: memoryResult.summary,
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    if (presenceStatus === "postgres-only") {
      return createReadComparisonResult({
        kind: "actor-shadow-read",
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

    if (presenceStatus === "not-found") {
      return createReadComparisonResult({
        kind: "actor-shadow-read",
        input,
        status: "not-found",
        postgresAvailability: canonical.availability,
        postgresReason: canonical.reason,
        diff,
        warnings,
        comparedAt,
      });
    }

    const status = deriveReadMatchStatus(diff);

    return createReadComparisonResult({
      kind: "actor-shadow-read",
      input,
      status,
      memorySummary: memoryResult.summary,
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
