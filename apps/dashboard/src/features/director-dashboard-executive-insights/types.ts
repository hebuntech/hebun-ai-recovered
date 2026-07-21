import type {
  ExecutiveHealthState,
  ExecutiveReasonCode,
  ExecutiveSectionId,
} from "../director-dashboard-executive-overview";
import type { DashboardWidgetId } from "../director-dashboard-widget-runtime";

/**
 * Insight severity reuses the canonical Executive Overview health states, so
 * an insight can never disagree with the section it explains.
 */
export type InsightSeverity = ExecutiveHealthState;

/**
 * Where the insight's evidence came from. This is the canonical widget
 * identifier only — never a record, payload, or runtime object.
 */
export type InsightEvidenceSource = DashboardWidgetId;

export interface ExecutiveInsight {
  readonly sectionId: ExecutiveSectionId;
  readonly title: string;
  readonly severity: InsightSeverity;
  /** Sanitized explanation built from a fixed template. Never free-form runtime text. */
  readonly summary: string;
  /** Number of records the section observed. Zero when nothing was readable. */
  readonly evidenceCount: number;
  readonly evidenceSource: InsightEvidenceSource;
  readonly recommendedAction: string;
  /** Stable code the summary and action were derived from. */
  readonly reasonCode: ExecutiveReasonCode;
  /** When the underlying runtime snapshot was refreshed. Absent when unknown. */
  readonly snapshotTimestamp?: string;
  /** When the overview this insight derives from was evaluated. */
  readonly evaluatedAt: string;
  readonly authoritative: false;
}
