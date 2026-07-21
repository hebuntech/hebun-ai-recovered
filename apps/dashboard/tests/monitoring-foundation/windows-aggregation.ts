import assert from "node:assert/strict";
import {
  aggregateMonitoringSignals,
  resolveEvaluationWindow,
  selectSignalsInWindow,
} from "../../src/features/monitoring";
import { canonicalMetric } from "../helpers/monitoring";

function main(): void {
  const now = new Date("2026-07-21T12:00:30.000Z");
  const rolling = resolveEvaluationWindow({ kind: "rolling", durationMs: 60_000 }, now);
  const fixed = resolveEvaluationWindow({ kind: "fixed", durationMs: 60_000 }, now);
  const sliding = resolveEvaluationWindow({ kind: "sliding", durationMs: 60_000, slideMs: 10_000 }, now);
  assert.equal(rolling?.start, "2026-07-21T11:59:30.000Z");
  assert.equal(fixed?.end, "2026-07-21T12:00:00.000Z");
  assert.equal(sliding?.end, "2026-07-21T12:00:30.000Z");
  if (!rolling) return;

  const lateProducerTimestamp = canonicalMetric({ signalId: "late", value: 1, canonicalEventTime: "2026-07-21T12:00:00.000Z" });
  const outside = canonicalMetric({ signalId: "outside", value: 1, canonicalEventTime: "2026-07-21T11:58:00.000Z" });
  assert.deepEqual(selectSignalsInWindow([outside, lateProducerTimestamp], rolling).map(({ signalId }) => signalId), ["late"]);

  const authority = { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" } as const;
  const aggregate = aggregateMonitoringSignals({ monitorId: "monitor", signals: [lateProducerTimestamp], authorityScope: authority, window: rolling });
  assert.equal(aggregate?.length, 1);
  assert.equal(aggregate?.[0]?.count, 1);
  assert.equal(Object.isFrozen(aggregate), true);
  assert.equal(aggregateMonitoringSignals({ monitorId: "monitor", signals: [canonicalMetric({ signalId: "foreign", value: 1, canonicalEventTime: "2026-07-21T12:00:00.000Z", tenantId: "tenant-b" })], authorityScope: authority, window: rolling }), undefined);

  console.log("fixed, rolling, sliding window and aggregation checks passed");
}

main();
