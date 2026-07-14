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

export function ensureRuntimeProjectionRegistry(): void {
  registerRuntimeProjectionBuilders();
  if (bootstrapped) return;

  runtimeProjectionRegistry.refreshAll();
  bootstrapped = true;
}
