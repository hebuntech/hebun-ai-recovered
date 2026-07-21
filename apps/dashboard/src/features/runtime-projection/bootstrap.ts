import {
  INSTRUMENTED_COMPONENTS,
  observeProjectionRefresh,
  observeRuntimeStartup,
} from "../runtime-observability";
import { runtimeProjectionRegistry } from "./index";
import {
  AgentProjectionBuilder,
  DecisionProjectionBuilder,
  ExecutiveTimelineProjectionBuilder,
  GoalProjectionBuilder,
  KnowledgeProjectionBuilder,
  MemoryProjectionBuilder,
  MissionProjectionBuilder,
  OrganizationProjectionBuilder,
  WorkflowProjectionBuilder,
} from "./builders";

let bootstrapped = false;
let registered = false;

export function registerRuntimeProjectionBuilders(): void {
  if (registered) return;

  runtimeProjectionRegistry.register(OrganizationProjectionBuilder);
  runtimeProjectionRegistry.register(AgentProjectionBuilder);
  runtimeProjectionRegistry.register(WorkflowProjectionBuilder);
  runtimeProjectionRegistry.register(GoalProjectionBuilder);
  runtimeProjectionRegistry.register(MissionProjectionBuilder);
  runtimeProjectionRegistry.register(KnowledgeProjectionBuilder);
  runtimeProjectionRegistry.register(MemoryProjectionBuilder);
  runtimeProjectionRegistry.register(DecisionProjectionBuilder);
  runtimeProjectionRegistry.register(ExecutiveTimelineProjectionBuilder);
  registered = true;
}

/*
 * Observability is passive here: every emission is wrapped so that a rejected
 * signal, a failed dispatch, or an unavailable sink can never fail runtime
 * bootstrap. Runtime stays fail-open; observability stays fail-closed inside
 * its own pipeline.
 */
function observe(emit: () => void): void {
  try {
    emit();
  } catch {
    // Observability must never affect runtime authority.
  }
}

function observeRefreshOutcomes(): void {
  for (const component of INSTRUMENTED_COMPONENTS) {
    const snapshot = runtimeProjectionRegistry.getSnapshot(component);
    if (!snapshot) continue;
    observe(() => observeProjectionRefresh({
      component,
      outcome: snapshot.statistics.lastRefreshResult === "success" ? "succeeded" : "failed",
      version: snapshot.version.value,
      observedAt: snapshot.health.checkedAt,
      ...(snapshot.health.status === "healthy" ? {} : { reasonCode: snapshot.health.status }),
    }));
  }
}

export function ensureRuntimeProjectionRegistry(): void {
  registerRuntimeProjectionBuilders();
  if (bootstrapped) return;

  runtimeProjectionRegistry.refreshAll();
  bootstrapped = true;

  observe(() => observeRuntimeStartup({
    bootstrapId: String(runtimeProjectionRegistry.getSnapshot("organization-runtime")?.version.value ?? 0),
    observedAt: new Date().toISOString(),
  }));
  observeRefreshOutcomes();
}
