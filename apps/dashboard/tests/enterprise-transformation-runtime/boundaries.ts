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
  const runtimeDir = path.resolve(process.cwd(), "src/features/enterprise-transformation-runtime");
  const runtimeFiles = collectFiles(runtimeDir);
  const runtimeContents = runtimeFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  assert.ok(!/crud/i.test(runtimeContents), "enterprise transformation runtime must not import CRUD modules");
  assert.ok(!/\bpostgres\b|\bpg\b/i.test(runtimeContents), "enterprise transformation runtime must not import PostgreSQL");
  assert.ok(!/-mutations\b|node-mutations|workflow-mutations|agent-mutations|memory-mutations/.test(runtimeContents), "enterprise transformation runtime must not use write paths");
  assert.ok(!/\bcreateGoal\b|\bcreatePlan\b|\bcreateTask\b|\bcreateWorkflow\b/.test(runtimeContents), "enterprise transformation runtime must not create downstream entities");

  const directorAiDir = path.resolve(process.cwd(), "src/features/director-ai-runtime");
  const directorAiContents = collectFiles(directorAiDir)
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  assert.ok(!/crud/i.test(directorAiContents), "director ai runtime must not import CRUD modules");

  console.log("enterprise-transformation-runtime boundary checks passed");
}

void main();
