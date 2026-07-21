import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function collect(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) return collect(resolved);
    return entry.isFile() && entry.name.endsWith(".ts") ? [resolved] : [];
  });
}

function main(): void {
  const root = path.resolve(process.cwd(), "src/features/observability");
  const contents = collect(root).map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(contents, /@opentelemetry|from ["'](?:pg|drizzle-orm|@supabase\/)|@\/components|@\/app\//);
  assert.doesNotMatch(contents, /process\.env|DATABASE_URL|HEBUN_PERSISTENCE|HEBUN_CANONICAL_READ/);
  console.log("observability foundation boundary checks passed");
}

main();
