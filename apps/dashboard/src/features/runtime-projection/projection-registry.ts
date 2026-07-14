import { RuntimeProjectionStore } from "./projection-store";
import type {
  RuntimeProjectionBuilder,
  RuntimeProjectionCollection,
  RuntimeProjectionDiagnosticsView,
  RuntimeProjectionRefreshResult,
  RuntimeProjectionSnapshot,
} from "./types";

export class RuntimeProjectionRegistry {
  private readonly builders = new Map<
    RuntimeProjectionCollection,
    RuntimeProjectionBuilder<unknown>
  >();
  private readonly store = new RuntimeProjectionStore();
  private readonly refreshing = new Set<RuntimeProjectionCollection>();
  private readonly failures = new Map<
    RuntimeProjectionCollection,
    { readonly at: string; readonly category: string }
  >();

  register<T>(builder: RuntimeProjectionBuilder<T>): void {
    this.builders.set(builder.collection, builder as RuntimeProjectionBuilder<unknown>);
  }

  getSnapshot<T>(
    collection: RuntimeProjectionCollection,
  ): RuntimeProjectionSnapshot<T> | undefined {
    return this.store.getSnapshot<T>(collection);
  }

  refresh<T>(
    collection: RuntimeProjectionCollection,
  ): RuntimeProjectionRefreshResult<T> {
    const builder = this.builders.get(collection);
    if (!builder) {
      throw new Error(`No runtime projection builder registered for ${collection}.`);
    }

    if (this.refreshing.has(collection)) {
      throw new Error(`Circular runtime projection dependency detected at ${collection}.`);
    }

    this.refreshing.add(collection);
    try {
      for (const dependency of builder.dependencies) {
        const snapshot = this.getSnapshot(dependency);
        if (
          !snapshot ||
          !snapshot.availability.available ||
          snapshot.health.status !== "healthy"
        ) {
          this.refresh(dependency);
        }
      }

      const result = this.store.refresh(builder as RuntimeProjectionBuilder<T>);
      this.failures.delete(collection);
      return result;
    } catch (error) {
      const category = sanitizeFailureCategory(error);
      const at = new Date().toISOString();
      this.failures.set(collection, { at, category });
      this.store.invalidate(
        collection,
        `Projection refresh failed (${category}).`,
        category,
      );
      throw error;
    } finally {
      this.refreshing.delete(collection);
    }
  }

  refreshAll(): void {
    for (const collection of this.builders.keys()) {
      this.refresh(collection);
    }
  }

  ensure<T>(collection: RuntimeProjectionCollection): RuntimeProjectionSnapshot<T> {
    const existing = this.getSnapshot<T>(collection);
    if (
      existing?.availability.available &&
      existing.health.status === "healthy"
    ) {
      return existing;
    }
    return this.refresh<T>(collection).snapshot;
  }

  invalidate(collection: RuntimeProjectionCollection, detail: string): void {
    this.store.invalidate(collection, detail);
  }

  clear(collection?: RuntimeProjectionCollection): void {
    this.store.clear(collection);
  }

  listDiagnostics(): RuntimeProjectionDiagnosticsView[] {
    const snapshots = new Map(
      this.store.listDiagnostics().map((entry) => [entry.collection, entry]),
    );
    const now = Date.now();

    return [...this.builders.values()].map((builder) => {
      const snapshot = snapshots.get(builder.collection);
      const failure = this.failures.get(builder.collection);
      if (snapshot) {
        return {
          ...snapshot,
          ageMs: snapshot.statistics.lastRefreshedAt
            ? Math.max(0, now - Date.parse(snapshot.statistics.lastRefreshedAt))
            : undefined,
        };
      }

      return {
        collection: builder.collection,
        label: builder.collection,
        owner: builder.owner,
        dependencies: builder.dependencies,
        version: { value: 0, updatedAt: failure?.at ?? "never" },
        health: {
          status: failure ? "error" : "uninitialized",
          detail: failure
            ? `Projection build failed (${failure.category}).`
            : "Projection is registered but has not been built.",
          checkedAt: failure?.at ?? "never",
        },
        availability: {
          available: false,
          detail: "No runtime projection snapshot is available.",
        },
        statistics: {
          refreshCount: 0,
          lastDurationMs: 0,
          lastErrorAt: failure?.at,
          lastRefreshResult: failure ? "failure" : "never",
          lastFailureCategory: failure?.category,
          itemCount: 0,
        },
      } satisfies RuntimeProjectionDiagnosticsView;
    });
  }
}

function sanitizeFailureCategory(error: unknown): string {
  if (error instanceof Error && /^[A-Za-z][A-Za-z0-9]*$/.test(error.name)) {
    return error.name;
  }
  return "ProjectionBuildError";
}
