import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Evaluator } from "../../src/features/evaluation";
import type { CanonicalSignalSink, SignalPolicyEngine } from "../../src/features/observability";

function collect(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) return collect(resolved);
    return entry.isFile() && entry.name.endsWith(".ts") ? [resolved] : [];
  });
}

function main(): void {
  const root = path.resolve(process.cwd(), "src/features/evaluation");
  const contents = collect(root).map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(contents, /@opentelemetry|from ["'](?:pg|drizzle-orm|@supabase\/)|@\/components|@\/app\//);
  assert.doesNotMatch(contents, /DATABASE_URL|process\.env|executeCommand|authorizeExecution|authorizeDeployment|mutateRuntime|monitoring|SLO|alert/i);

  if (false) {
    const evaluator = {} as Evaluator;
    const policy = {} as SignalPolicyEngine;
    const sink = {} as CanonicalSignalSink;
    // @ts-expect-error Evaluators have no runtime execution authority.
    evaluator.executeCommand();
    // @ts-expect-error Evaluators cannot override policy.
    evaluator.policyEngine = policy;
    // @ts-expect-error Evaluators cannot emit directly to sinks.
    evaluator.sink = sink;
  }

  console.log("evaluation authority boundary checks passed");
}

main();
