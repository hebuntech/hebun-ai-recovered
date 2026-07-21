import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  InMemoryAppendOnlySignalSink,
  type ProducerObservation,
} from "../../src/features/observability";
import {
  canonicalSignalSnapshot,
  createRuntimeSignalPolicyEngine,
  flushRuntimeObservabilityForTests,
  materializeRuntimeEvidence,
  runtimePlatformCorrelation,
} from "../../src/features/runtime-observability";
import { ensureRuntimeProjectionRegistry } from "../../src/features/runtime-projection";

const FEATURE_DIR = "src/features/runtime-observability";
const correlation = runtimePlatformCorrelation([{ type: "command", id: "runtime-projection:organization-runtime" }]);

function pipeline(sink: InMemoryAppendOnlySignalSink) {
  return createCollectionPipeline({
    registry: canonicalSignalSchemaRegistry,
    policyEngine: createRuntimeSignalPolicyEngine(),
    sinks: new Map([["telemetry", sink]]),
    maxCandidatePayloadBytes: 8_192,
    maxClockDriftMs: 60_000,
    now: () => new Date(),
  });
}

function observation(overrides: Partial<ProducerObservation> = {}): ProducerObservation {
  return {
    signalId: `security-probe-${Math.random()}`,
    signalType: "operational-event",
    schemaVersion: 1,
    producer: { id: "runtime-projection", producerClass: "runtime", version: "1.0.0" },
    source: { component: "organization-runtime", operation: "runtime-projection.refresh" },
    timestamp: new Date().toISOString(),
    correlationCandidates: [{ type: "command", id: "runtime-projection:organization-runtime" }],
    severityCandidate: "info",
    payload: { name: "runtime-projection.refresh", component: "organization-runtime", outcome: "succeeded" },
    metadata: { environment: "live" },
    evidenceCompleteness: "FULL",
    ...overrides,
  };
}

/** Metadata outside the canonical allow-list is rejected, not stored. */
async function metadataAllowListIsEnforced(): Promise<void> {
  const sink = new InMemoryAppendOnlySignalSink({ route: "telemetry", capacity: 10 });
  const emitter = pipeline(sink);
  const rejected = await emitter.submit(
    observation({ metadata: { environment: "live", operatorNote: "not allowed" } as never }),
    correlation,
  );
  assert.equal(rejected.status, "rejected_security");
  assert.equal(sink.query({ platformAuthority: "hebun-dashboard" }, correlation.platformScope).length, 0);
}

/** Credentials, tokens, provider payloads, reasoning, memory are all refused. */
async function forbiddenContentIsRefused(): Promise<void> {
  const forbiddenPayloads: readonly Record<string, unknown>[] = [
    { name: "r", component: "organization-runtime", outcome: "succeeded", accessToken: "abc" },
    { name: "r", component: "organization-runtime", outcome: "succeeded", refreshToken: "abc" },
    { name: "r", component: "organization-runtime", outcome: "succeeded", apiKey: "abc" },
    { name: "r", component: "organization-runtime", outcome: "succeeded", password: "abc" },
    { name: "r", component: "organization-runtime", outcome: "succeeded", providerRawResponse: {} },
    { name: "r", component: "organization-runtime", outcome: "succeeded", hiddenReasoning: "chain" },
    { name: "r", component: "organization-runtime", outcome: "succeeded", chainOfThought: "step" },
    { name: "r", component: "organization-runtime", outcome: "succeeded", connectionString: "x" },
    { name: "r", component: "organization-runtime", outcome: "succeeded", note: "Bearer eyJhbGciOiJIUzI1NiJ9.abc" },
    { name: "r", component: "organization-runtime", outcome: "succeeded", dsn: "postgresql://user:pw@host/db" },
  ];
  const sink = new InMemoryAppendOnlySignalSink({ route: "telemetry", capacity: 20 });
  const emitter = pipeline(sink);
  for (const payload of forbiddenPayloads) {
    const result = await emitter.submit(observation({ payload }), correlation);
    assert.notEqual(result.status, "accepted", `payload must be refused: ${Object.keys(payload).at(-1)}`);
  }
  assert.equal(sink.query({ platformAuthority: "hebun-dashboard" }, correlation.platformScope).length, 0);
}

/** Audit-class evidence fails closed when no audit sink is registered. */
async function auditEvidenceFailsClosed(): Promise<void> {
  const sink = new InMemoryAppendOnlySignalSink({ route: "telemetry", capacity: 10 });
  const emitter = pipeline(sink);
  const result = await emitter.submit(
    observation({
      signalType: "audit-event",
      payload: {
        actorType: "system", actorId: "runtime", action: "refresh", entityType: "projection",
        entityId: "organization-runtime", authoritySource: "system", result: "succeeded", simulation: false,
      },
    }),
    correlation,
  );
  assert.equal(result.status, "audit_guarantee_failed");
  assert.equal(result.status === "audit_guarantee_failed" && result.failClosed, true);
}

/** Cross-scope reads are rejected by the sink itself. */
async function crossScopeReadRejected(): Promise<void> {
  const sink = new InMemoryAppendOnlySignalSink({ route: "telemetry", capacity: 10 });
  assert.throws(() => sink.query({ tenantId: "tenant-a" }, correlation.platformScope), TypeError);
  assert.throws(
    () => sink.query({ platformAuthority: "someone-else" }, correlation.platformScope),
    TypeError,
  );
}

/** Nothing sensitive appears in serialized live evidence. */
async function serializedEvidenceIsClean(): Promise<void> {
  ensureRuntimeProjectionRegistry();
  await flushRuntimeObservabilityForTests();
  const serialized = JSON.stringify({
    signals: canonicalSignalSnapshot(),
    evidence: materializeRuntimeEvidence(),
  });
  for (const forbidden of [
    "accessToken", "refreshToken", "apiKey", "password", "Bearer ", "postgresql://",
    "providerRaw", "hiddenReasoning", "chainOfThought", "memoryContent", "connectionString",
    "secret", "Error:", "at Object.", "stack",
  ]) {
    assert.equal(serialized.includes(forbidden), false, `serialized evidence must not contain ${forbidden}`);
  }
  assert.equal(serialized.includes("tenantId"), false, "platform evidence must carry no tenant id");
}

/** This layer must not import Dashboard code or a database driver. */
function noDashboardOrDatabaseImports(): void {
  const forbidden = [
    "director-dashboard", "director-dashboard-data", "director-dashboard-ui",
    "director-dashboard-widget-runtime", "director-dashboard-executive-overview",
    "director-dashboard-executive-insights", "@/components", "@/app",
    "drizzle-orm", "pg", "@/db", "postgres",
  ];
  const files = readdirSync(FEATURE_DIR).filter((name) => name.endsWith(".ts"));
  assert.equal(files.length > 0, true);
  for (const name of files) {
    const source = readFileSync(join(FEATURE_DIR, name), "utf8");
    for (const specifier of forbidden) {
      assert.equal(
        source.includes(`from "${specifier}`) || source.includes(`from "../${specifier}`),
        false,
        `${name} must not import ${specifier}`,
      );
    }
  }
}

/** Runtime Authority is unchanged: persistence provider stays in memory. */
function runtimeAuthorityUnchanged(): void {
  const storage = readFileSync("src/features/persistence/storage-manager.ts", "utf8");
  assert.equal(storage.includes('const ACTIVE_PROVIDER: StorageProvider = "memory"'), true);
  const bootstrap = readFileSync("src/features/runtime-projection/bootstrap.ts", "utf8");
  // Observability is additive and wrapped; the refresh call itself is untouched.
  assert.equal(bootstrap.includes("runtimeProjectionRegistry.refreshAll();"), true);
  assert.equal(bootstrap.includes("function observe("), true);
}

async function main(): Promise<void> {
  await metadataAllowListIsEnforced();
  await forbiddenContentIsRefused();
  await auditEvidenceFailsClosed();
  await crossScopeReadRejected();
  await serializedEvidenceIsClean();
  noDashboardOrDatabaseImports();
  runtimeAuthorityUnchanged();
  console.log("runtime observability security boundary checks passed");
}

void main();
