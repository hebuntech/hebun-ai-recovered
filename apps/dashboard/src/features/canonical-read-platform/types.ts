export type ReadStatus =
  | "matched"
  | "partial-match"
  | "mismatch"
  | "memory-only"
  | "postgres-only"
  | "not-found"
  | "unavailable"
  | "invalid-input"
  | "tenant-mismatch";

export type ReadFieldComparisonStatus =
  | "match"
  | "mismatch"
  | "missing-memory"
  | "missing-postgres"
  | "non-comparable";

export interface ReadSourceAvailability {
  readonly memory: "available";
  readonly postgres: "available" | "unavailable";
}

export interface ReadComparableField {
  readonly status: ReadFieldComparisonStatus;
}
