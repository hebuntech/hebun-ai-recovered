import type {
  ActorAuthorityComparison,
  ActorFieldComparison,
  ActorMembershipComparison,
  ActorShadowMismatchCategory,
  ActorShadowReadDiff,
  MemoryActorShadowSummary,
  PostgresActorShadowSummary,
} from "./types";
import {
  compareReadField,
  partitionReadComparisons,
} from "@/features/canonical-read-platform";

function classifyMismatch(
  field: ActorFieldComparison["field"],
): ActorShadowMismatchCategory {
  switch (field) {
    case "actorType":
    case "actorId":
      return "identity mismatch";
    case "tenantId":
      return "tenant mismatch";
    case "displayLabel":
      return "display-label mismatch";
    case "lifecycleStatus":
    case "active":
    case "archived":
      return "lifecycle mismatch";
    case "suspended":
    case "membershipSuspendedAt":
      return "suspension mismatch";
    case "membershipExists":
    case "effectiveFrom":
    case "effectiveUntil":
    case "membershipVersion":
      return "membership mismatch";
    case "roleId":
    case "roleName":
    case "roleType":
      return "role mismatch";
    case "humanOwner":
    case "replacementActorId":
      return "ownership mismatch";
    case "managerActor":
      return "manager mismatch";
    case "department":
      return "department mismatch";
    case "agentType":
      return "agent-type mismatch";
    case "health":
      return "health mismatch";
    case "riskLevel":
      return "risk mismatch";
    case "roleRank":
    case "authorityScope":
    case "delegatedBy":
    case "authorityCeilingSummary":
    case "configProfileVersion":
      return "authority-metadata mismatch";
  }
}

function compareField(params: {
  field: ActorFieldComparison["field"];
  section: ActorFieldComparison["section"];
  memoryValue?: string | number | boolean | null;
  postgresValue?: string | number | boolean | null;
  memoryComparable?: boolean;
  postgresComparable?: boolean;
  normalize?: "identifier" | "text" | "datetime" | "exact";
  note?: string;
}): ActorFieldComparison {
  return compareReadField({
    memoryValue: params.memoryValue,
    postgresValue: params.postgresValue,
    memoryComparable: params.memoryComparable,
    postgresComparable: params.postgresComparable,
    normalize: params.normalize,
    create: (status) => ({
      field: params.field,
      section: params.section,
      status,
      memoryValue: params.memoryValue ?? null,
      postgresValue: params.postgresValue ?? null,
      note: params.note,
    }),
  });
}

function ownerRef(
  owner?:
    | MemoryActorShadowSummary["ownership"]
    | PostgresActorShadowSummary["ownership"]
    | null,
): string | null {
  if (!owner) return null;
  if (!owner.humanOwnerActorType && !owner.humanOwnerActorId) return null;
  return `${owner.humanOwnerActorType ?? "unknown"}:${owner.humanOwnerActorId ?? "unknown"}`;
}

function managerRef(
  owner?:
    | MemoryActorShadowSummary["ownership"]
    | PostgresActorShadowSummary["ownership"]
    | null,
): string | null {
  if (!owner) return null;
  if (!owner.managerActorType && !owner.managerActorId) return null;
  return `${owner.managerActorType ?? "unknown"}:${owner.managerActorId ?? "unknown"}`;
}

function delegatedByRef(
  authority?:
    | MemoryActorShadowSummary["authority"]
    | PostgresActorShadowSummary["authority"]
    | null,
  membership?:
    | MemoryActorShadowSummary["membership"]
    | PostgresActorShadowSummary["membership"]
    | null,
): string | null {
  const actorType =
    authority?.delegatedByActorType ?? membership?.delegatedByActorType;
  const actorId = authority?.delegatedByActorId ?? membership?.delegatedByActorId;
  if (!actorType && !actorId) return null;
  return `${actorType ?? "unknown"}:${actorId ?? "unknown"}`;
}

export function compareActorShadow(params: {
  input: { tenantId: string; actorType: string; actorId: string };
  memory?: MemoryActorShadowSummary;
  postgres?: PostgresActorShadowSummary;
}): ActorShadowReadDiff {
  const memory = params.memory;
  const postgres = params.postgres;

  const comparisons: ActorFieldComparison[] = [
    compareField({
      field: "actorType",
      section: "identity",
      memoryValue: memory?.actorType ?? null,
      postgresValue: postgres?.actorType ?? params.input.actorType,
      normalize: "identifier",
    }),
    compareField({
      field: "actorId",
      section: "identity",
      memoryValue: memory?.actorId ?? null,
      postgresValue: postgres?.actorId ?? params.input.actorId,
      normalize: "identifier",
    }),
    compareField({
      field: "tenantId",
      section: "identity",
      memoryValue: memory?.tenantId ?? null,
      postgresValue: postgres?.tenantId ?? params.input.tenantId,
      normalize: "identifier",
      memoryComparable: memory?.tenantId != null,
      note:
        "The current memory actor shapes are not consistently tenant-scoped.",
    }),
    compareField({
      field: "displayLabel",
      section: "identity",
      memoryValue: memory?.displayLabel ?? null,
      postgresValue: postgres?.displayLabel ?? null,
      normalize: "text",
    }),
    compareField({
      field: "lifecycleStatus",
      section: "lifecycle",
      memoryValue: memory?.lifecycleStatus ?? null,
      postgresValue: postgres?.lifecycleStatus ?? null,
      normalize: "identifier",
    }),
    compareField({
      field: "active",
      section: "lifecycle",
      memoryValue: memory?.active ?? null,
      postgresValue: postgres?.active ?? null,
    }),
    compareField({
      field: "suspended",
      section: "lifecycle",
      memoryValue: memory?.suspended ?? null,
      postgresValue: postgres?.suspended ?? null,
    }),
    compareField({
      field: "archived",
      section: "lifecycle",
      memoryValue: memory?.archived ?? null,
      postgresValue: postgres?.archived ?? null,
    }),
    compareField({
      field: "membershipExists",
      section: "membership",
      memoryValue: memory?.membership?.membershipExists ?? null,
      postgresValue: postgres?.membership?.membershipExists ?? null,
      memoryComparable: memory?.membership?.membershipExists != null,
      postgresComparable: postgres?.membership?.membershipExists != null,
      note:
        "Membership comparisons apply only when the actor shape actually exposes membership metadata.",
    }),
    compareField({
      field: "roleId",
      section: "membership",
      memoryValue: memory?.membership?.roleId ?? null,
      postgresValue: postgres?.membership?.roleId ?? null,
      memoryComparable: memory?.membership?.roleId != null,
      postgresComparable: postgres?.membership?.roleId != null,
      normalize: "identifier",
    }),
    compareField({
      field: "roleName",
      section: "membership",
      memoryValue: memory?.membership?.roleName ?? null,
      postgresValue: postgres?.membership?.roleName ?? null,
      memoryComparable: memory?.membership?.roleName != null,
      postgresComparable: postgres?.membership?.roleName != null,
      normalize: "text",
    }),
    compareField({
      field: "roleType",
      section: "membership",
      memoryValue: memory?.membership?.roleType ?? null,
      postgresValue: postgres?.membership?.roleType ?? null,
      memoryComparable: memory?.membership?.roleType != null,
      postgresComparable: postgres?.membership?.roleType != null,
      normalize: "identifier",
    }),
    compareField({
      field: "effectiveFrom",
      section: "membership",
      memoryValue: memory?.membership?.effectiveFrom ?? null,
      postgresValue: postgres?.membership?.effectiveFrom ?? null,
      memoryComparable: memory?.membership?.effectiveFrom != null,
      postgresComparable: postgres?.membership?.effectiveFrom != null,
      normalize: "datetime",
    }),
    compareField({
      field: "effectiveUntil",
      section: "membership",
      memoryValue: memory?.membership?.effectiveUntil ?? null,
      postgresValue: postgres?.membership?.effectiveUntil ?? null,
      memoryComparable: memory?.membership?.effectiveUntil != null,
      postgresComparable: postgres?.membership?.effectiveUntil != null,
      normalize: "datetime",
    }),
    compareField({
      field: "membershipSuspendedAt",
      section: "membership",
      memoryValue: memory?.membership?.suspendedAt ?? null,
      postgresValue: postgres?.membership?.suspendedAt ?? null,
      memoryComparable: memory?.membership?.suspendedAt != null,
      postgresComparable: postgres?.membership?.suspendedAt != null,
      normalize: "datetime",
    }),
    compareField({
      field: "membershipVersion",
      section: "membership",
      memoryValue: memory?.membership?.membershipVersion ?? null,
      postgresValue: postgres?.membership?.membershipVersion ?? null,
      memoryComparable: memory?.membership?.membershipVersion != null,
      postgresComparable: postgres?.membership?.membershipVersion != null,
    }),
    compareField({
      field: "department",
      section: "ownership",
      memoryValue: memory?.department ?? null,
      postgresValue: postgres?.department ?? null,
      memoryComparable: memory?.department != null,
      postgresComparable: postgres?.department != null,
      normalize: "text",
    }),
    compareField({
      field: "humanOwner",
      section: "ownership",
      memoryValue: ownerRef(memory?.ownership ?? null),
      postgresValue: ownerRef(postgres?.ownership ?? null),
      memoryComparable: memory?.ownership != null,
      postgresComparable: postgres?.ownership != null,
      normalize: "identifier",
    }),
    compareField({
      field: "managerActor",
      section: "ownership",
      memoryValue: managerRef(memory?.ownership ?? null),
      postgresValue: managerRef(postgres?.ownership ?? null),
      memoryComparable: memory?.ownership?.managerActorId != null,
      postgresComparable: postgres?.ownership?.managerActorId != null,
      normalize: "identifier",
    }),
    compareField({
      field: "replacementActorId",
      section: "ownership",
      memoryValue: memory?.ownership?.replacementActorId ?? null,
      postgresValue: postgres?.ownership?.replacementActorId ?? null,
      memoryComparable: memory?.ownership?.replacementActorId != null,
      postgresComparable: postgres?.ownership?.replacementActorId != null,
      normalize: "identifier",
    }),
    compareField({
      field: "agentType",
      section: "ownership",
      memoryValue: memory?.agentType ?? null,
      postgresValue: postgres?.agentType ?? null,
      memoryComparable: memory?.agentType != null,
      postgresComparable: postgres?.agentType != null,
      normalize: "identifier",
    }),
    compareField({
      field: "health",
      section: "ownership",
      memoryValue: memory?.health ?? null,
      postgresValue: postgres?.health ?? null,
      memoryComparable: memory?.health != null,
      postgresComparable: postgres?.health != null,
      normalize: "identifier",
    }),
    compareField({
      field: "riskLevel",
      section: "ownership",
      memoryValue: memory?.riskLevel ?? null,
      postgresValue: postgres?.riskLevel ?? null,
      memoryComparable: memory?.riskLevel != null,
      postgresComparable: postgres?.riskLevel != null,
      normalize: "identifier",
    }),
    compareField({
      field: "roleRank",
      section: "authority",
      memoryValue: memory?.authority?.roleRank ?? null,
      postgresValue: postgres?.authority?.roleRank ?? null,
      memoryComparable: memory?.authority?.roleRank != null,
      postgresComparable: postgres?.authority?.roleRank != null,
    }),
    compareField({
      field: "authorityScope",
      section: "authority",
      memoryValue:
        memory?.authority?.authorityScope ??
        memory?.membership?.authorityScope ??
        null,
      postgresValue:
        postgres?.authority?.authorityScope ??
        postgres?.membership?.authorityScope ??
        null,
      memoryComparable:
        memory?.authority?.authorityScope != null ||
        memory?.membership?.authorityScope != null,
      postgresComparable:
        postgres?.authority?.authorityScope != null ||
        postgres?.membership?.authorityScope != null,
      normalize: "identifier",
    }),
    compareField({
      field: "delegatedBy",
      section: "authority",
      memoryValue: delegatedByRef(memory?.authority ?? null, memory?.membership ?? null),
      postgresValue: delegatedByRef(
        postgres?.authority ?? null,
        postgres?.membership ?? null,
      ),
      memoryComparable:
        memory?.authority?.delegatedByActorId != null ||
        memory?.membership?.delegatedByActorId != null,
      postgresComparable:
        postgres?.authority?.delegatedByActorId != null ||
        postgres?.membership?.delegatedByActorId != null,
      normalize: "identifier",
    }),
    compareField({
      field: "authorityCeilingSummary",
      section: "authority",
      memoryValue: memory?.authority?.authorityCeilingSummary ?? null,
      postgresValue: postgres?.authority?.authorityCeilingSummary ?? null,
      memoryComparable: memory?.authority?.authorityCeilingSummary != null,
      postgresComparable: postgres?.authority?.authorityCeilingSummary != null,
      normalize: "text",
    }),
    compareField({
      field: "configProfileVersion",
      section: "authority",
      memoryValue: memory?.authority?.configProfileVersion ?? null,
      postgresValue: postgres?.authority?.configProfileVersion ?? null,
      memoryComparable: memory?.authority?.configProfileVersion != null,
      postgresComparable: postgres?.authority?.configProfileVersion != null,
      normalize: "text",
    }),
  ];

  const {
    matchedFields,
    mismatches,
    nonComparableFields,
    missingFields,
  } = partitionReadComparisons(comparisons);
  const membershipDifferences = comparisons.filter(
    (item) =>
      item.section === "membership" &&
      item.status !== "match",
  ) as ActorMembershipComparison[];
  const authorityDifferences = comparisons.filter(
    (item) =>
      item.section === "authority" &&
      item.status !== "match",
  ) as ActorAuthorityComparison[];

  const categories: ActorShadowMismatchCategory[] = [
    ...mismatches.map((item) => classifyMismatch(item.field)),
    ...nonComparableFields.map(
      () => "non-comparable field" as ActorShadowMismatchCategory,
    ),
    ...missingFields.map((item) =>
      item.status === "missing-memory"
        ? ("missing memory actor" as ActorShadowMismatchCategory)
        : ("missing canonical actor" as ActorShadowMismatchCategory),
    ),
  ];

  return {
    mismatches,
    matchedFields,
    nonComparableFields,
    missingFields,
    membershipDifferences,
    authorityDifferences,
    mismatchCategories: [...new Set(categories)],
  };
}
