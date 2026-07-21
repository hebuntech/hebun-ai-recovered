import type { CanonicalSignal } from "../observability";
import type { EvaluationWindow, WindowDefinition } from "./types";

export function resolveEvaluationWindow(definition: WindowDefinition, now: Date): EvaluationWindow | undefined {
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs) || !Number.isSafeInteger(definition.durationMs) || definition.durationMs <= 0) return undefined;
  let end = nowMs;
  if (definition.kind === "fixed") end = Math.floor(nowMs / definition.durationMs) * definition.durationMs;
  if (definition.kind === "sliding") {
    if (!Number.isSafeInteger(definition.slideMs) || definition.slideMs <= 0) return undefined;
    end = Math.floor(nowMs / definition.slideMs) * definition.slideMs;
  }
  return Object.freeze({ kind: definition.kind, start: new Date(end - definition.durationMs).toISOString(), end: new Date(end).toISOString() });
}

export function selectSignalsInWindow(signals: readonly CanonicalSignal[], window: EvaluationWindow): readonly CanonicalSignal[] {
  const start = Date.parse(window.start);
  const end = Date.parse(window.end);
  return Object.freeze(signals.filter((signal) => {
    const canonicalTime = Date.parse(signal.canonicalEventTime);
    return Number.isFinite(canonicalTime) && canonicalTime >= start && canonicalTime <= end;
  }).sort((left, right) => left.canonicalEventTime.localeCompare(right.canonicalEventTime) || left.signalId.localeCompare(right.signalId)));
}
