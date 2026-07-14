/*
 * Task Planning — dependency engine.
 *
 * Stage 3. Resolves ordering over the generated tasks: which tasks block which,
 * which may run in parallel, and the critical path. The task layers are fixed
 * (preparation → information → core → validation → handoff), so dependencies
 * are a deterministic function of the task categories.
 *
 * Rules:
 *   - preparation is the single root (no dependencies).
 *   - every information task depends on preparation; they are parallel siblings.
 *   - every core task depends on the whole information layer (or preparation
 *     when there are no information tasks); core tasks are parallel siblings.
 *   - validation depends on the whole core layer.
 *   - handoff depends on validation.
 */

import type { DependencyGraph, PlannedTask, TaskCategory, TaskDependency } from "./types";

const LAYER_ORDER: TaskCategory[] = [
  "preparation",
  "information",
  "core",
  "validation",
  "handoff",
];

function idsIn(tasks: PlannedTask[], category: TaskCategory): string[] {
  return tasks.filter((t) => t.category === category).map((t) => t.id);
}

export function resolveDependencies(tasks: PlannedTask[]): DependencyGraph {
  // Bucket task ids by layer, preserving generation order.
  const layers = LAYER_ORDER.map((category) => ({
    category,
    ids: idsIn(tasks, category),
  })).filter((layer) => layer.ids.length > 0);

  const dependsMap = new Map<string, string[]>();
  for (const t of tasks) dependsMap.set(t.id, []);

  // Each non-first layer depends on the entire previous non-empty layer.
  for (let i = 1; i < layers.length; i++) {
    const prev = layers[i - 1].ids;
    for (const id of layers[i].ids) dependsMap.set(id, [...prev]);
  }

  // Invert to build `blocks`.
  const blocksMap = new Map<string, string[]>();
  for (const t of tasks) blocksMap.set(t.id, []);
  for (const [id, deps] of dependsMap) {
    for (const dep of deps) blocksMap.get(dep)!.push(id);
  }

  const dependencies: TaskDependency[] = tasks.map((t) => {
    const layer = layers.find((l) => l.category === t.category)!;
    // A task is parallel when it has siblings in the same layer.
    const kind = layer.ids.length > 1 ? "parallel" : "sequential";
    return {
      taskId: t.id,
      dependsOn: dependsMap.get(t.id) ?? [],
      blocks: blocksMap.get(t.id) ?? [],
      kind,
    };
  });

  // Parallel groups: any layer with more than one task.
  const parallelGroups = layers
    .filter((layer) => layer.ids.length > 1)
    .map((layer) => layer.ids);

  // Critical path: pick the longest-duration task from each layer, tie-broken
  // by id ascending (deterministic). The layers are strictly sequential.
  const durationById = new Map(tasks.map((t) => [t.id, t.estimatedDuration]));
  const criticalPath: string[] = [];
  let criticalPathDuration = 0;
  for (const layer of layers) {
    const heaviest = layer.ids
      .slice()
      .sort((a, b) => {
        const d = (durationById.get(b) ?? 0) - (durationById.get(a) ?? 0);
        return d !== 0 ? d : a < b ? -1 : 1;
      })[0];
    criticalPath.push(heaviest);
    criticalPathDuration += durationById.get(heaviest) ?? 0;
  }

  const parallelCount = dependencies.filter((d) => d.kind === "parallel").length;
  const sequentialCount = dependencies.length - parallelCount;

  return {
    dependencies,
    parallelGroups,
    criticalPath,
    criticalPathDuration,
    parallelCount,
    sequentialCount,
  };
}
