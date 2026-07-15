import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(resolved));
      continue;
    }
    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
    files.push(resolved);
  }
  return files.sort();
}

async function main(): Promise<void> {
  const runtimeDirs = [
    "src/features/organization-runtime",
    "src/features/agent-runtime",
    "src/features/workflow-runtime",
    "src/features/mission-runtime",
    "src/features/goal-runtime",
    "src/features/knowledge-runtime",
    "src/features/memory-runtime",
    "src/features/decision-runtime",
    "src/features/executive-timeline-runtime",
  ];

  const runtimeContents = runtimeDirs
    .flatMap((dir) => collectFiles(path.resolve(process.cwd(), dir)))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(
    runtimeContents,
    /from "@\/features\/(agent-crud|workflow-crud|memory-crud|knowledge-crud|registry-crud)|from "@\/features\/.+-(queries|repository)"/,
    "runtime services must not import CRUD or repository layers directly",
  );

  assert.doesNotMatch(
    runtimeContents,
    /runtime-projection\/builders/,
    "runtime services must consume the projection store, not projection builders",
  );

  assert.doesNotMatch(
    runtimeContents,
    /from "@\/components|from "@\/app\//,
    "runtime services must not import UI or Dashboard routes",
  );

  const projectionDir = path.resolve(process.cwd(), "src/features/runtime-projection");
  const projectionContents = collectFiles(projectionDir)
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(
    projectionContents,
    /from "@\/components|from "@\/app\//,
    "runtime projection layer must not import UI or app routes",
  );

  assert.doesNotMatch(
    projectionContents,
    /setInterval|setTimeout|\.subscribe\(/,
    "runtime projection layer must not start timers or subscriptions",
  );

  // Mutation workspaces and live operational diagnostics intentionally retain
  // their command/subscription boundaries. They are not executive read models.
  const dashboardLowLevelAllowlist = new Set([
    "src/components/agents/agent-registry-workspace.tsx",
    "src/components/knowledge-graph/knowledge-registry-workspace.tsx",
    "src/components/memory/memory-registry-workspace.tsx",
    "src/components/registries/registry-manager.tsx",
    "src/components/workflows/workflow-registry-workspace.tsx",
    "src/components/canonical-read/diagnostics-page.tsx",
    "src/components/agent-context/agent-context-overview.tsx",
    "src/components/agent-context/agent-context-panel.tsx",
    "src/components/agent-reasoning/agent-reasoning-panel.tsx",
    "src/components/agent-reasoning/executive-reasoning-overview.tsx",
    "src/components/execution-queue/execution-queue-panel.tsx",
    "src/components/execution-queue/queue-monitor.tsx",
    "src/components/live-dispatch/dispatch-monitor.tsx",
    "src/components/live-dispatch/live-dispatch-panel.tsx",
    "src/components/memory-engine/memory-engine-panel.tsx",
    "src/components/task-planning/planning-overview.tsx",
    "src/components/task-planning/task-planning-panel.tsx",
  ]);
  const dashboardFiles = [
    ...collectFiles(path.resolve(process.cwd(), "src/app/(dashboard)")),
    ...collectFiles(path.resolve(process.cwd(), "src/components")),
    ...collectFiles(path.resolve(process.cwd(), "src/features/director-dashboard")),
  ];
  const dashboardReadContents = dashboardFiles
    .filter((file) => {
      const relative = path.relative(process.cwd(), file);
      return !dashboardLowLevelAllowlist.has(relative);
    })
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(
    dashboardReadContents,
    /from "@\/features\/(agent-crud|workflow-crud|memory-crud|knowledge-crud|registry-crud)|from "@\/features\/.+-(queries|repository)"|from "@\/features\/persistence(?:\/[^"]+)?"|from "@\/features\/memory-engine"|runtime-projection\/builders|persistence\/storage-manager|persistence\/provider-registry/,
    "Dashboard read surfaces must use runtime or approved diagnostics boundaries",
  );

  const directorContents = collectFiles(
    path.resolve(process.cwd(), "src/features/director-ai-runtime"),
  )
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(
    `${dashboardReadContents}\n${directorContents}`,
    /runtime-projection\/builders/,
    "Dashboard and Director AI must not import projection builders",
  );

  const intelligenceContents = collectFiles(
    path.resolve(process.cwd(), "src/features/organizational-intelligence"),
  )
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  assert.doesNotMatch(
    intelligenceContents,
    /from "@\/features\/memory-engine"/,
    "Organizational Intelligence must consume Memory Runtime",
  );

  const storeContents = readFileSync(
    path.resolve(process.cwd(), "src/features/runtime-projection/projection-store.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    storeContents,
    /@\/features\/.+-runtime|@\/components|@\/app\//,
    "projection store must not import runtime consumers or UI",
  );

  console.log("runtime-projection boundary checks passed");
}

void main();
