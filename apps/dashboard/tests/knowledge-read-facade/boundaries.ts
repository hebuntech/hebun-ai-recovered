import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function collectImports(dir: string, pattern: string): string[] {
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
      const content = readFileSync(fullPath, "utf8");
      if (content.includes(pattern)) {
        matches.push(fullPath.replace(`${process.cwd()}/`, ""));
      }
    }
  }
  return matches.sort();
}

async function main() {
  const facadeImports = collectImports(
    join(process.cwd(), "src"),
    'from "@/features/knowledge-read-facade"',
  );
  assert.deepEqual(facadeImports, [
    "src/features/canonical-read/diagnostics.ts",
    "src/features/knowledge-silent-dual-read/hook.ts",
  ]);

  const routeImports = collectImports(
    join(process.cwd(), "src/app"),
    'knowledge-read-facade',
  );
  assert.deepEqual(routeImports, []);

  const facadeFiles = collectImports(
    join(process.cwd(), "src/features/knowledge-read-facade"),
    "",
  );
  assert.deepEqual(facadeFiles, [
    "src/features/knowledge-read-facade/index.ts",
    "src/features/knowledge-read-facade/router.ts",
    "src/features/knowledge-read-facade/service.ts",
    "src/features/knowledge-read-facade/types.ts",
  ]);

  for (const file of facadeFiles) {
    const content = readFileSync(join(process.cwd(), file), "utf8");
    if (!file.endsWith("/service.ts") && !file.endsWith("/router.ts")) {
      assert.doesNotMatch(content, /canonical-read/);
    }
    if (!file.endsWith("/service.ts") && !file.endsWith("/router.ts")) {
      assert.doesNotMatch(content, /knowledge-silent-dual-read/);
    }
    assert.doesNotMatch(content, /knowledge-shadow-read/);
    assert.doesNotMatch(content, /from "pg"|from 'pg'/);
  }

  const clientImports = collectImports(
    join(process.cwd(), "src/components"),
    'knowledge-read-facade',
  );
  assert.deepEqual(clientImports, []);

  console.log("knowledge-read-facade boundary checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
