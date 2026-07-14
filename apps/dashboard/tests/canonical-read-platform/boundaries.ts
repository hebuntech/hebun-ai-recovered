import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function collectFiles(dir: string): string[] {
  const matches: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      matches.push(fullPath.replace(`${process.cwd()}/`, ""));
    }
  }
  return matches.sort();
}

async function main() {
  const files = collectFiles(join(process.cwd(), "src/features/canonical-read-platform"));
  assert.deepEqual(files, [
    "src/features/canonical-read-platform/availability.ts",
    "src/features/canonical-read-platform/comparison.ts",
    "src/features/canonical-read-platform/errors.ts",
    "src/features/canonical-read-platform/index.ts",
    "src/features/canonical-read-platform/metrics.ts",
    "src/features/canonical-read-platform/results.ts",
    "src/features/canonical-read-platform/rollout.ts",
    "src/features/canonical-read-platform/types.ts",
  ]);

  for (const file of files) {
    const content = readFileSync(join(process.cwd(), file), "utf8");
    assert.doesNotMatch(content, /knowledge-crud|agent-crud|workflow-crud|execution-queries/);
    assert.doesNotMatch(content, /command bus|reasoning|learning/i);
    assert.doesNotMatch(content, /from "pg"|from 'pg'/);
    assert.doesNotMatch(content, /insert |update |delete |upsert |create table/i);
  }

  console.log("canonical-read-platform boundary checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
