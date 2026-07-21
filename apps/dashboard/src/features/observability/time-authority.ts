import { SignalContractError } from "./errors";

export interface TimeAuthorityResolution {
  readonly timestamp: string;
  readonly canonicalEventTime: string;
  readonly ordering: "in-order" | "out-of-order";
}

function parseTimestamp(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new SignalContractError("INVALID_TIME");
  return parsed;
}

export function assertSignalNotReplay(
  signalId: string,
  knownSignalIds: ReadonlySet<string> = new Set(),
): void {
  if (knownSignalIds.has(signalId)) throw new SignalContractError("SIGNAL_REPLAY");
}

export function resolveTimeAuthority(input: {
  readonly producerTimestamp: string;
  readonly receivedAt: Date;
  readonly maxClockDriftMs: number;
  readonly previousCanonicalEventTime?: string;
}): TimeAuthorityResolution {
  const producerTime = parseTimestamp(input.producerTimestamp);
  const receivedTime = input.receivedAt.getTime();
  if (!Number.isFinite(receivedTime)) throw new SignalContractError("INVALID_TIME");
  if (!Number.isSafeInteger(input.maxClockDriftMs) || input.maxClockDriftMs < 0) {
    throw new SignalContractError("INVALID_TIME");
  }
  if (Math.abs(receivedTime - producerTime) > input.maxClockDriftMs) {
    throw new SignalContractError("CLOCK_DRIFT_EXCEEDED");
  }

  const canonicalEventTime = input.receivedAt.toISOString();
  const previousTime = input.previousCanonicalEventTime
    ? parseTimestamp(input.previousCanonicalEventTime)
    : undefined;

  return Object.freeze({
    timestamp: new Date(producerTime).toISOString(),
    canonicalEventTime,
    ordering:
      previousTime !== undefined && producerTime < previousTime
        ? "out-of-order"
        : "in-order",
  });
}
