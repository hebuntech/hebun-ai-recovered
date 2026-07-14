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

  const dashboardAndDirectorContents = [
    ...collectFiles(path.resolve(process.cwd(), "src/app/(dashboard)")),
    ...collectFiles(path.resolve(process.cwd(), "src/features/director-ai-runtime")),
  ]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(
    dashboardAndDirectorContents,
    /runtime-projection\/builders/,
    "Dashboard and Director AI must not import projection builders",
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
