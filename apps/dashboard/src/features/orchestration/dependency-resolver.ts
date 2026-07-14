import type { GeneratedPlan } from "@/features/planning";

export function resolveDependencyMap(plan: GeneratedPlan) {
  return plan.dependencies;
}

export function hasCircularDependencies(plan: GeneratedPlan) {
  const graph = new Map(plan.dependencies.map((dep) => [dep.taskId, dep.dependsOn]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(node: string): boolean {
    if (visited.has(node)) return false;
    if (visiting.has(node)) return true;
    visiting.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (visit(neighbor)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  }

  return plan.dependencies.some((dep) => visit(dep.taskId));
}
