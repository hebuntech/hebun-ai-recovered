export type RuntimeProjectionCollection =
  | "organization-runtime"
  | "agent-runtime"
  | "workflow-runtime"
  | "goal-runtime"
  | "mission-runtime"
  | "knowledge-runtime"
  | "memory-runtime"
  | "decision-runtime"
  | "executive-timeline-runtime";

export interface RuntimeProjectionIdentity {
  readonly collection: RuntimeProjectionCollection;
  readonly label: string;
}

export interface RuntimeProjectionVersion {
  readonly value: number;
  readonly updatedAt: string;
}

export interface RuntimeProjectionHealth {
  readonly status: "healthy" | "stale" | "uninitialized" | "error";
  readonly detail: string;
  readonly checkedAt: string;
}

export interface RuntimeProjectionAvailability {
  readonly available: boolean;
  readonly detail: string;
}

export interface RuntimeProjectionStatistics {
  readonly refreshCount: number;
  readonly lastDurationMs: number;
  readonly lastRefreshedAt?: string;
  readonly lastErrorAt?: string;
  readonly lastRefreshResult: "never" | "success" | "failure";
  readonly lastFailureCategory?: string;
  readonly itemCount: number;
}

export interface RuntimeProjectionMetadata {
  readonly identity: RuntimeProjectionIdentity;
  readonly owner: string;
  readonly dependencies: readonly RuntimeProjectionCollection[];
}

export interface RuntimeProjectionSnapshot<T> {
  readonly collection: RuntimeProjectionCollection;
  readonly data: T;
  readonly version: RuntimeProjectionVersion;
  readonly health: RuntimeProjectionHealth;
  readonly availability: RuntimeProjectionAvailability;
  readonly statistics: RuntimeProjectionStatistics;
  readonly metadata: RuntimeProjectionMetadata;
}

export interface RuntimeProjectionRefreshResult<T> {
  readonly snapshot: RuntimeProjectionSnapshot<T>;
  readonly changed: boolean;
}

export interface RuntimeProjectionContext {
  readonly now: () => string;
  getSnapshot<T>(collection: RuntimeProjectionCollection): RuntimeProjectionSnapshot<T> | undefined;
}

export interface RuntimeProjectionBuilder<T> {
  readonly collection: RuntimeProjectionCollection;
  readonly owner: string;
  readonly dependencies: readonly RuntimeProjectionCollection[];
  readonly build: (context: RuntimeProjectionContext) => T;
  readonly count?: (projection: T) => number;
}

export interface RuntimeProjectionDiagnosticsView {
  readonly collection: RuntimeProjectionCollection;
  readonly label: string;
  readonly owner: string;
  readonly dependencies: readonly RuntimeProjectionCollection[];
  readonly version: RuntimeProjectionVersion;
  readonly health: RuntimeProjectionHealth;
  readonly availability: RuntimeProjectionAvailability;
  readonly statistics: RuntimeProjectionStatistics;
  readonly ageMs?: number;
}
