import type { ReadComparableField, ReadFieldComparisonStatus, ReadStatus } from "./types";

export type ReadNormalizeMode =
  | "identifier"
  | "text"
  | "json"
  | "datetime"
  | "exact";

export function normalizeIdentifier(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toLowerCase() : null;
}

export function normalizeText(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function normalizeDatetime(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
}

export function normalizeJson(
  value?: Readonly<Record<string, unknown>> | null,
): string | null {
  if (!value) return null;
  const keys = Object.keys(value).sort();
  const normalized = Object.fromEntries(keys.map((key) => [key, value[key]]));
  return JSON.stringify(normalized);
}

export function compareReadField<Result extends Record<string, unknown>>(params: {
  readonly create: (status: ReadFieldComparisonStatus) => Result;
  readonly memoryValue?: unknown;
  readonly postgresValue?: unknown;
  readonly memoryComparable?: boolean;
  readonly postgresComparable?: boolean;
  readonly normalize?: ReadNormalizeMode;
}): Result {
  const memoryComparable = params.memoryComparable ?? true;
  const postgresComparable = params.postgresComparable ?? true;

  if (!memoryComparable || !postgresComparable) {
    return params.create("non-comparable");
  }

  if (params.memoryValue == null && params.postgresValue == null) {
    return params.create("match");
  }

  if (params.memoryValue == null) {
    return params.create("missing-memory");
  }

  if (params.postgresValue == null) {
    return params.create("missing-postgres");
  }

  let equal = false;
  switch (params.normalize ?? "exact") {
    case "identifier":
      equal =
        normalizeIdentifier(String(params.memoryValue)) ===
        normalizeIdentifier(String(params.postgresValue));
      break;
    case "text":
      equal =
        normalizeText(String(params.memoryValue)) ===
        normalizeText(String(params.postgresValue));
      break;
    case "json":
      equal =
        normalizeJson(
          params.memoryValue as Readonly<Record<string, unknown>> | null | undefined,
        ) ===
        normalizeJson(
          params.postgresValue as Readonly<Record<string, unknown>> | null | undefined,
        );
      break;
    case "datetime":
      equal =
        normalizeDatetime(String(params.memoryValue)) ===
        normalizeDatetime(String(params.postgresValue));
      break;
    case "exact":
    default:
      equal = params.memoryValue === params.postgresValue;
      break;
  }

  return params.create(equal ? "match" : "mismatch");
}

export function partitionReadComparisons<T extends ReadComparableField>(
  comparisons: readonly T[],
): {
  readonly matchedFields: readonly T[];
  readonly mismatches: readonly T[];
  readonly nonComparableFields: readonly T[];
  readonly missingFields: readonly T[];
} {
  return {
    matchedFields: comparisons.filter((item) => item.status === "match"),
    mismatches: comparisons.filter((item) => item.status === "mismatch"),
    nonComparableFields: comparisons.filter(
      (item) => item.status === "non-comparable",
    ),
    missingFields: comparisons.filter(
      (item) =>
        item.status === "missing-memory" || item.status === "missing-postgres",
    ),
  };
}

export function deriveReadMatchStatus(params: {
  readonly mismatches: readonly ReadComparableField[];
  readonly nonComparableFields: readonly ReadComparableField[];
  readonly missingFields: readonly ReadComparableField[];
}): Extract<ReadStatus, "matched" | "partial-match" | "mismatch"> {
  if (params.mismatches.length > 0) {
    return "mismatch";
  }

  if (
    params.nonComparableFields.length > 0 ||
    params.missingFields.length > 0
  ) {
    return "partial-match";
  }

  return "matched";
}
