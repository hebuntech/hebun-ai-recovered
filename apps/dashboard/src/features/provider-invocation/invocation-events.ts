/*
 * invocation-events.ts — deterministic invocation event stream. Offline
 * invocations emit Created → Validated → Prepared → Started(prepare) events up
 * to Ready; failed contracts emit a Failed event. Fixed timestamps keep the
 * stream reproducible.
 */

import type { InvocationEvent } from "@/features/provider-invocation/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

export function buildEvents(valid: boolean, requestId: string): InvocationEvent[] {
  const events: InvocationEvent[] = [
    { type: "Invocation Created", label: "Created", at: EPOCH, note: `Invocation created for ${requestId}.` },
    { type: "Validated", label: "Validated", at: EPOCH, note: valid ? "Contract validated." : "Contract validation failed." },
  ];

  if (valid) {
    events.push(
      { type: "Prepared", label: "Prepared", at: EPOCH, note: "Request, response and policies prepared." },
      { type: "Started", label: "Ready", at: EPOCH, note: "Invocation is ready; live execution deferred to future phase." }
    );
  } else {
    events.push({ type: "Failed", label: "Failed", at: EPOCH, note: "Invocation could not be prepared." });
  }

  return events;
}
