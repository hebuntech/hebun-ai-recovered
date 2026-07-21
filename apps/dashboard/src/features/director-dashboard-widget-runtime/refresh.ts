import type { DashboardWidgetId, WidgetRefreshRequest, WidgetRuntimeSnapshot, WidgetRuntimeState } from "./types";
import { DASHBOARD_WIDGET_IDS } from "./types";
import type { WidgetRegistry } from "./registry";
import { bindWidget } from "./binding";
import { deepFreeze } from "./validation";

function statesWith(state: WidgetRuntimeState["state"]): Readonly<Record<DashboardWidgetId, WidgetRuntimeState>> {
  return deepFreeze(Object.fromEntries(DASHBOARD_WIDGET_IDS.map((widgetId) => [widgetId, { widgetId, state }])) as unknown as Record<DashboardWidgetId, WidgetRuntimeState>);
}

export class WidgetRefreshEngine {
  readonly #registry: WidgetRegistry;
  readonly #version: string;
  #current: WidgetRuntimeSnapshot;

  constructor(registry: WidgetRegistry, version: string) {
    this.#registry = registry;
    this.#version = version;
    this.#current = deepFreeze({ states: statesWith("unavailable") });
  }

  current(): WidgetRuntimeSnapshot {
    return this.#current;
  }

  beginRefresh(): WidgetRuntimeSnapshot {
    this.#current = deepFreeze({ sourceSnapshotId: this.#current.sourceSnapshotId, states: statesWith("loading") });
    return this.#current;
  }

  manualRefresh(request: WidgetRefreshRequest): WidgetRuntimeSnapshot {
    return this.refresh(request);
  }

  switchSnapshot(request: WidgetRefreshRequest): WidgetRuntimeSnapshot {
    return this.refresh(request);
  }

  private refresh(request: WidgetRefreshRequest): WidgetRuntimeSnapshot {
    const states = Object.fromEntries(DASHBOARD_WIDGET_IDS.map((widgetId) => {
      const result = bindWidget({ registry: this.#registry, widgetId, version: this.#version, snapshot: request.snapshot, authorityScope: request.authorityScope });
      return [widgetId, result.state === "ready" || result.state === "empty"
        ? { widgetId, state: result.state, viewModel: result.viewModel }
        : { widgetId, state: result.state, reason: result.reason }];
    })) as unknown as Record<DashboardWidgetId, WidgetRuntimeState>;
    this.#current = deepFreeze({
      sourceSnapshotId: request.snapshot?.snapshotId,
      refreshedAt: request.snapshot?.generatedAt,
      states,
    });
    return this.#current;
  }
}
