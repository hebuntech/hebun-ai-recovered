import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  emitHealthSignal,
  evaluateMonitor,
  MonitoringRegistry,
} from "../../src/features/monitoring";
import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  createRequestCorrelationContext,
  InMemoryAppendOnlySignalSink,
  type CanonicalSignalType,
  type HealthSignalPayload,
  type SignalPolicyDecision,
  type SignalPolicyEngine,
} from "../../src/features/observability";
import { canonicalMetric, monitorDefinition } from "../helpers/monitoring";

function collect(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(resolved) : entry.isFile() && entry.name.endsWith(".ts") ? [resolved] : [];
  });
}

async function main(): Promise<void> {
  const root = path.resolve(process.cwd(), "src/features/monitoring");
  const contents = collect(root).map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(contents, /@opentelemetry|from ["'](?:pg|drizzle-orm|@supabase\/)|@\/components|@\/app\//);
  assert.doesNotMatch(contents, /sendEmail|webhook|pagerduty|slack|teams|executeCommand|authorizeExecution|mutateRuntime/i);

  const definition = monitorDefinition();
  const registry = new MonitoringRegistry([{ monitorId: definition.monitorId, version: definition.version, lifecycle: definition.lifecycle, owner: definition.owner, compatibility: definition.compatibility, compatibleSignalSchemaVersions: [1] }]);
  const authority = { kind: "tenant", tenantId: "tenant-a", resolvedBy: "server" } as const;
  const result = evaluateMonitor({ registry, definition, signals: [canonicalMetric({ signalId: "metric-1", value: 700, canonicalEventTime: "2026-07-21T11:59:30.000Z" })], authorityScope: authority, now: new Date("2026-07-21T12:00:00.000Z") });
  assert.equal(result.status, "critical");
  if (result.status !== "critical") return;

  const context = createRequestCorrelationContext({ tenantScope: authority, platformScope: { kind: "none" }, relationships: [{ type: "incident", id: "incident-1", tenantId: "tenant-a" }] });
  const sink = new InMemoryAppendOnlySignalSink({ route: "telemetry", capacity: 10 });
  const policyEngine: SignalPolicyEngine = {
    evaluate<T extends CanonicalSignalType>(candidate: Parameters<SignalPolicyEngine["evaluate"]>[0]): SignalPolicyDecision<T> {
      return { decision: "accept", signalType: candidate.candidateSignalType as T, schemaVersion: 1, policyVersion: 1, disposition: "telemetry", retention: "operational", severity: candidate.candidateSeverity, tenantScope: candidate.tenantScope, platformScope: candidate.platformScope, maxPayloadBytes: 8_192, sampled: true, redactionApplied: true, approvedRoutes: ["telemetry"] };
    },
  };
  const emitter = createCollectionPipeline({ registry: canonicalSignalSchemaRegistry, policyEngine, sinks: new Map([["telemetry", sink]]), maxCandidatePayloadBytes: 8_192, maxClockDriftMs: 5_000, now: () => new Date("2026-07-21T12:00:01.000Z") });
  const emitted = await emitHealthSignal({ snapshot: result.snapshot, dependencies: { emitter, correlationContext: context, now: () => new Date("2026-07-21T12:00:00.000Z") } });
  assert.equal(emitted.status, "emitted");
  const stored = sink.query({ tenantId: "tenant-a", signalType: "health-signal" }, authority);
  assert.equal(stored.length, 1);
  assert.equal((stored[0]?.payload as HealthSignalPayload | undefined)?.state, "critical");

  console.log("canonical health signal and monitoring authority boundary checks passed");
}

void main();
