import { createProjectionContext } from "./projection-context";
import {
  createAvailableProjectionAvailability,
  createHealthyProjectionHealth,
  createUnavailableProjectionAvailability,
} from "./projection-health";
import { createProjectionStatistics } from "./projection-statistics";
import { createProjectionVersion } from "./projection-version";
import type {
  RuntimeProjectionBuilder,
  RuntimeProjectionCollection,
  RuntimeProjectionDiagnosticsView,
  RuntimeProjectionRefreshResult,
  RuntimeProjectionSnapshot,
} from "./types";

type ProjectionState = RuntimeProjectionSnapshot<unknown>;

export class RuntimeProjectionStore {
  private readonly snapshots = new Map<RuntimeProjectionCollection, ProjectionState>();

  constructor(
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  getSnapshot<T>(
    collection: RuntimeProjectionCollection,
  ): RuntimeProjectionSnapshot<T> | undefined {
    const snapshot = this.snapshots.get(collection);
    return snapshot as RuntimeProjectionSnapshot<T> | undefined;
  }

  refresh<T>(
    builder: RuntimeProjectionBuilder<T>,
  ): RuntimeProjectionRefreshResult<T> {
    const startedAt = Date.now();
    const previous = this.getSnapshot<T>(builder.collection);
    const context = createProjectionContext({
      now: this.now,
      getSnapshot: <Value,>(collection: RuntimeProjectionCollection) =>
        this.getSnapshot<Value>(collection),
    });

    const data = immutableClone(builder.build(context));
    const refreshedAt = this.now();
    const count = builder.count?.(data) ?? 1;
    const refreshCount = (previous?.statistics.refreshCount ?? 0) + 1;
    const snapshot: RuntimeProjectionSnapshot<T> = {
      collection: builder.collection,
      data,
      version: createProjectionVersion(
        (previous?.version.value ?? 0) + 1,
        refreshedAt,
      ),
      health: createHealthyProjectionHealth(
        refreshedAt,
        `Projection refreshed successfully by ${builder.owner}.`,
      ),
      availability: createAvailableProjectionAvailability(
        "Projection snapshot is available in memory.",
      ),
      statistics: {
        refreshCount,
        lastDurationMs: Date.now() - startedAt,
        lastRefreshedAt: refreshedAt,
        lastErrorAt: previous?.statistics.lastErrorAt,
        lastRefreshResult: "success",
        lastFailureCategory: previous?.statistics.lastFailureCategory,
        itemCount: count,
      },
      metadata: {
        identity: {
          collection: builder.collection,
          label: builder.collection,
        },
        owner: builder.owner,
        dependencies: builder.dependencies,
      },
    };

    const immutableSnapshot = immutableClone(snapshot);
    this.snapshots.set(builder.collection, immutableSnapshot as ProjectionState);

    return {
      snapshot: immutableSnapshot,
      changed: true,
    };
  }

  replace<T>(snapshot: RuntimeProjectionSnapshot<T>): void {
    this.snapshots.set(snapshot.collection, immutableClone(snapshot) as ProjectionState);
  }

  invalidate(
    collection: RuntimeProjectionCollection,
    detail: string,
    failureCategory = "ProjectionBuildError",
  ): void {
    const previous = this.snapshots.get(collection);
    if (!previous) return;

    const invalidated: ProjectionState = {
      ...previous,
      availability: createUnavailableProjectionAvailability(detail),
      health: {
        status: "stale",
        detail,
        checkedAt: this.now(),
      },
      statistics: {
        ...previous.statistics,
        lastErrorAt: this.now(),
        lastRefreshResult: "failure",
        lastFailureCategory: failureCategory,
      },
    };

    this.snapshots.set(collection, immutableClone(invalidated));
  }

  clear(collection?: RuntimeProjectionCollection): void {
    if (collection) {
      this.snapshots.delete(collection);
      return;
    }

    this.snapshots.clear();
  }

  listDiagnostics(): RuntimeProjectionDiagnosticsView[] {
    return [...this.snapshots.values()].map((snapshot) => ({
      collection: snapshot.collection,
      label: snapshot.metadata.identity.label,
      owner: snapshot.metadata.owner,
      dependencies: snapshot.metadata.dependencies,
      version: snapshot.version,
      health: snapshot.health,
      availability: snapshot.availability,
      statistics: snapshot.statistics,
    }));
  }

  getStatistics(collection: RuntimeProjectionCollection) {
    return this.snapshots.get(collection)?.statistics ?? createProjectionStatistics();
  }
}

function immutableClone<T>(value: T): T {
  return deepFreeze(structuredClone(value));
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object" || seen.has(value)) {
    return value;
  }

  seen.add(value);
  for (const child of Object.values(value)) {
    deepFreeze(child, seen);
  }

  return Object.freeze(value);
}
