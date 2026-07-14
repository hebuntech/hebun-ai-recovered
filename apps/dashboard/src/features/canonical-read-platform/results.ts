import type { CanonicalReadAvailability } from "@/features/canonical-read";
import { buildReadSourceAvailability } from "./availability";
import type { ReadSourceAvailability } from "./types";

export interface ReadComparisonEnvelope<
  Kind extends string,
  Input,
  Status extends string,
  MemorySummary,
  PostgresSummary,
  Diff,
> {
  readonly kind: Kind;
  readonly input: Input;
  readonly status: Status;
  readonly memory: {
    readonly found: boolean;
    readonly summary?: MemorySummary;
  };
  readonly postgres: {
    readonly found: boolean;
    readonly availability: CanonicalReadAvailability;
    readonly summary?: PostgresSummary;
    readonly reason?: string;
  };
  readonly sourceAvailability: ReadSourceAvailability;
  readonly diff: Diff;
  readonly warnings: readonly string[];
  readonly comparedAt: string;
}

export function createReadComparisonResult<
  Kind extends string,
  Input,
  Status extends string,
  MemorySummary,
  PostgresSummary,
  Diff,
>(params: {
  readonly kind: Kind;
  readonly input: Input;
  readonly status: Status;
  readonly memorySummary?: MemorySummary;
  readonly postgresAvailability: CanonicalReadAvailability;
  readonly postgresSummary?: PostgresSummary;
  readonly postgresReason?: string;
  readonly diff: Diff;
  readonly warnings: readonly string[];
  readonly comparedAt: string;
}): ReadComparisonEnvelope<
  Kind,
  Input,
  Status,
  MemorySummary,
  PostgresSummary,
  Diff
> {
  return {
    kind: params.kind,
    input: params.input,
    status: params.status,
    memory: params.memorySummary
      ? { found: true, summary: params.memorySummary }
      : { found: false },
    postgres: params.postgresSummary
      ? {
          found: true,
          availability: params.postgresAvailability,
          summary: params.postgresSummary,
          reason: params.postgresReason,
        }
      : {
          found: false,
          availability: params.postgresAvailability,
          reason: params.postgresReason,
        },
    sourceAvailability: buildReadSourceAvailability(params.postgresAvailability),
    diff: params.diff,
    warnings: params.warnings,
    comparedAt: params.comparedAt,
  };
}
