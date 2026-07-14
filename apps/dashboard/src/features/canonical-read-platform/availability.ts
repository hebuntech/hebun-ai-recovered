import type { CanonicalReadAvailability } from "@/features/canonical-read";
import type { ReadSourceAvailability, ReadStatus } from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isReadUuidLike(value: string): boolean {
  return UUID_RE.test(value);
}

export function createUnavailableReadAvailability(): CanonicalReadAvailability {
  return {
    available: false,
    configured: false,
    source: "postgres",
    warnings: [],
  };
}

export function createReadComparedAt(): string {
  return new Date().toISOString();
}

export function buildReadSourceAvailability(
  availability: CanonicalReadAvailability,
): ReadSourceAvailability {
  return {
    memory: "available",
    postgres: availability.available ? "available" : "unavailable",
  };
}

export function deriveReadPresenceStatus(params: {
  readonly memoryFound: boolean;
  readonly postgresFound: boolean;
}): Extract<ReadStatus, "memory-only" | "postgres-only" | "not-found"> | null {
  if (params.memoryFound && !params.postgresFound) {
    return "memory-only";
  }

  if (!params.memoryFound && params.postgresFound) {
    return "postgres-only";
  }

  if (!params.memoryFound && !params.postgresFound) {
    return "not-found";
  }

  return null;
}
