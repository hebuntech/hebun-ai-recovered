import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CanonicalSignal, ProducerObservation } from "../../src/features/observability";
import { projectCanonicalSignals } from "../../src/features/diagnostics-read-models";

function collect(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(resolved) : entry.isFile() && entry.name.endsWith(".ts") ? [resolved] : [];
  });
}

function main(): void {
  const contents = collect(path.resolve(process.cwd(), "src/features/diagnostics-read-models")).map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(contents, /@opentelemetry|from ["'](?:pg|drizzle-orm|@supabase\/)|@\/components|@\/app\//);
  assert.doesNotMatch(contents, /DATABASE_URL|process\.env|mutateRuntime|authorizeExecution|producerObservation|rawProvider|hiddenReasoning/i);

  if (false) {
    const observation = {} as ProducerObservation;
    // @ts-expect-error Projection accepts canonical signals, never producer observations.
    const source: CanonicalSignal = observation;
    // @ts-expect-error Projection engine has no runtime mutation API.
    projectCanonicalSignals.mutateRuntime();
    void source;
  }

  console.log("diagnostics read model authority boundary checks passed");
}

main();
