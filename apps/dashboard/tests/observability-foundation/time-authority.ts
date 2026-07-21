import assert from "node:assert/strict";
import {
  assertSignalNotReplay,
  resolveTimeAuthority,
  SignalContractError,
} from "../../src/features/observability";

function main(): void {
  const resolved = resolveTimeAuthority({
    producerTimestamp: "2026-07-21T12:00:00.000Z",
    receivedAt: new Date("2026-07-21T12:00:01.000Z"),
    maxClockDriftMs: 5_000,
    previousCanonicalEventTime: "2026-07-21T12:00:02.000Z",
  });
  assert.equal(resolved.canonicalEventTime, "2026-07-21T12:00:01.000Z");
  assert.equal(resolved.ordering, "out-of-order");
  assert.equal(Object.isFrozen(resolved), true);

  assert.throws(
    () => resolveTimeAuthority({ producerTimestamp: "invalid", receivedAt: new Date(), maxClockDriftMs: 1_000 }),
    (error: unknown) => error instanceof SignalContractError && error.code === "INVALID_TIME",
  );
  assert.throws(
    () => resolveTimeAuthority({ producerTimestamp: "2026-07-21T11:00:00.000Z", receivedAt: new Date("2026-07-21T12:00:00.000Z"), maxClockDriftMs: 1_000 }),
    (error: unknown) => error instanceof SignalContractError && error.code === "CLOCK_DRIFT_EXCEEDED",
  );
  assert.throws(
    () => assertSignalNotReplay("signal-1", new Set(["signal-1"])),
    (error: unknown) => error instanceof SignalContractError && error.code === "SIGNAL_REPLAY",
  );

  console.log("signal time authority checks passed");
}

main();
