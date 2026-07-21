import type { ExecutiveReasonCode } from "../director-dashboard-executive-overview";

interface NarrativeRule {
  /** Builds the explanation from the section label and its observed record count. */
  readonly summary: (label: string, evidenceCount: number) => string;
  readonly recommendedAction: (label: string) => string;
}

function records(count: number): string {
  return `${count} observed ${count === 1 ? "record" : "records"}`;
}

/**
 * Fixed narrative templates, one per canonical reason code. Every sentence is
 * built from facts the Executive Overview already established — the section
 * label, its reason code, and its record count. Nothing else is asserted, so
 * an insight can never claim more than the platform observed.
 */
export const NARRATIVE_RULES: Readonly<Record<ExecutiveReasonCode, NarrativeRule>> = Object.freeze({
  SECTION_CRITICAL: Object.freeze<NarrativeRule>({
    summary: (label, count) => `${label} reports a critical state across ${records(count)}.`,
    recommendedAction: (label) => `Open the ${label} widget and review the records reporting a critical state.`,
  }),
  SECTION_WARNING: Object.freeze<NarrativeRule>({
    summary: (label, count) => `${label} reports a degraded state across ${records(count)}.`,
    recommendedAction: (label) => `Review ${label} before the degraded state escalates.`,
  }),
  SECTION_UNKNOWN: Object.freeze<NarrativeRule>({
    summary: (label, count) => `${label} reports an unknown state across ${records(count)}.`,
    recommendedAction: (label) => `Confirm the ${label} source is reporting a definite state.`,
  }),
  SECTION_EMPTY: Object.freeze<NarrativeRule>({
    summary: (label) => `${label} returned no records in the current snapshot, so its health cannot be judged.`,
    recommendedAction: (label) => `Confirm whether ${label} is expected to report records.`,
  }),
  SECTION_LOADING: Object.freeze<NarrativeRule>({
    summary: (label) => `${label} has not resolved in the current snapshot yet.`,
    recommendedAction: () => "Wait for the current refresh to finish, then re-read this section.",
  }),
  SECTION_UNAVAILABLE: Object.freeze<NarrativeRule>({
    summary: (label) => `${label} could not be read from the current snapshot.`,
    recommendedAction: () => "Refresh the dashboard; if the state persists, check the dashboard snapshot source.",
  }),
  SECTION_HEALTHY: Object.freeze<NarrativeRule>({
    summary: (label, count) => `${label} reports no issues across ${records(count)}.`,
    recommendedAction: () => "No action required.",
  }),
});

export type { NarrativeRule };
