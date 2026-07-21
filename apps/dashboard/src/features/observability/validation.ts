import { SignalContractError } from "./errors";
import type {
  CanonicalSignalMetadata,
  CanonicalSignalType,
  EvidenceCompleteness,
  PlatformScope,
  SignalCorrelation,
  SignalSeverity,
  SignalSource,
  SignalProducer,
  TenantScope,
} from "./types";

const allowedMetadataKeys = new Set<keyof CanonicalSignalMetadata>([
  "environment",
  "deploymentVersion",
  "buildVersion",
  "region",
  "runtimeVersion",
  "featureFlag",
  "samplingDecisionId",
  "redactionCode",
  "supersededSignalId",
  "diagnosticClassification",
  "dataClassification",
]);

const forbiddenKey = /access.?token|refresh.?token|jwt|password|cookie|authorization|raw.?response|raw.?request|hidden.?reason|chain.?of.?thought|secret|api.?key|connection.?string/i;
const forbiddenValue = /\bBearer\s+[A-Za-z0-9._~+\/-]+=*|postgres(?:ql)?:\/\/[^\s]+|-----BEGIN [A-Z ]+PRIVATE KEY-----/i;

function assertNoCredential(value: unknown): void {
  if (typeof value === "string" && forbiddenValue.test(value)) {
    throw new SignalContractError("FORBIDDEN_CREDENTIAL");
  }
  if (Array.isArray(value)) {
    for (const item of value) assertNoCredential(item);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (forbiddenKey.test(key)) throw new SignalContractError("FORBIDDEN_CREDENTIAL");
      assertNoCredential(nested);
    }
  }
}

export function validateMetadata(value: unknown): CanonicalSignalMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SignalContractError("FORBIDDEN_METADATA");
  }
  assertNoCredential(value);
  for (const key of Object.keys(value)) {
    if (!allowedMetadataKeys.has(key as keyof CanonicalSignalMetadata)) {
      throw new SignalContractError("FORBIDDEN_METADATA");
    }
  }
  for (const metadataValue of Object.values(value)) {
    if (typeof metadataValue !== "string") {
      throw new SignalContractError("FORBIDDEN_METADATA");
    }
  }
  const metadata = value as Record<string, string>;
  if (
    metadata.environment &&
    !["simulation", "dry-run", "live"].includes(metadata.environment)
  ) {
    throw new SignalContractError("FORBIDDEN_METADATA");
  }
  if (
    metadata.dataClassification &&
    !["public", "internal", "confidential", "restricted"].includes(
      metadata.dataClassification,
    )
  ) {
    throw new SignalContractError("FORBIDDEN_METADATA");
  }
  return value as CanonicalSignalMetadata;
}

export function validateCandidateIdentity(input: {
  readonly signalId: string;
  readonly producer: SignalProducer;
  readonly source: SignalSource;
  readonly policyVersion: number;
  readonly severity: SignalSeverity;
  readonly evidenceCompleteness: EvidenceCompleteness;
}): void {
  if (
    !input.signalId.trim() ||
    !input.producer.id.trim() ||
    !input.producer.version.trim() ||
    !input.source.component.trim() ||
    !input.source.operation.trim() ||
    !Number.isSafeInteger(input.policyVersion) ||
    input.policyVersion <= 0 ||
    !["debug", "info", "warning", "error", "critical"].includes(input.severity) ||
    !["FULL", "PARTIAL", "UNKNOWN", "MISSING"].includes(input.evidenceCompleteness)
  ) {
    throw new SignalContractError("INVALID_SIGNAL");
  }
}

export function validateScope(tenantScope: TenantScope, platformScope: PlatformScope): void {
  const tenantActive = tenantScope.kind === "tenant";
  const platformActive = platformScope.kind === "platform";
  if (tenantActive === platformActive) throw new SignalContractError("INVALID_SCOPE");
  if (tenantActive && (!tenantScope.tenantId.trim() || tenantScope.resolvedBy !== "server")) {
    throw new SignalContractError("INVALID_SCOPE");
  }
  if (platformActive && (!platformScope.authority.trim() || platformScope.resolvedBy !== "server")) {
    throw new SignalContractError("INVALID_SCOPE");
  }
}

export function validateCorrelation(
  correlation: SignalCorrelation,
  tenantScope: TenantScope,
  platformScope: PlatformScope,
): void {
  const seen = new Set<string>();
  for (const relationship of correlation.relationships) {
    if (relationship.resolvedBy !== "server" || !relationship.id.trim()) {
      throw new SignalContractError("UNRESOLVED_CORRELATION");
    }
    const key = `${relationship.type}:${relationship.id}`;
    if (seen.has(key) || relationship.parentId === relationship.id) {
      throw new SignalContractError("UNRESOLVED_CORRELATION");
    }
    seen.add(key);
    if (tenantScope.kind === "tenant" && relationship.tenantId !== tenantScope.tenantId) {
      throw new SignalContractError("CROSS_TENANT_CORRELATION");
    }
    if (platformScope.kind === "platform" && relationship.tenantId !== undefined) {
      throw new SignalContractError("CROSS_TENANT_CORRELATION");
    }
  }
}

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SignalContractError("INVALID_PAYLOAD");
  }
}

function requireFields(value: Record<string, unknown>, fields: readonly string[]): void {
  for (const field of fields) {
    if (!(field in value) || value[field] === undefined || value[field] === null) {
      throw new SignalContractError("INVALID_PAYLOAD");
    }
  }
}

const requiredPayloadFields: Readonly<Record<CanonicalSignalType, readonly string[]>> = {
  metric: ["name", "value", "unit", "kind"],
  trace: ["traceId", "spanId", "operation", "startedAt", "durationMs", "status"],
  "operational-event": ["name", "component", "outcome"],
  "audit-event": ["actorType", "actorId", "action", "entityType", "entityId", "authoritySource", "result", "simulation"],
  diagnostic: ["code", "component", "status", "summary"],
  "evaluation-result": ["evaluationRunId", "evaluatorId", "evaluatorVersion", "subjectType", "subjectId", "outcome", "evidenceReferences"],
  "health-signal": ["subjectType", "subjectId", "dimension", "state", "evidenceReferences", "derivationVersion"],
  "business-signal": ["name", "domain", "subjectType", "subjectId", "state", "evidenceReferences"],
};

const allowedPayloadFields: Readonly<Record<CanonicalSignalType, readonly string[]>> = {
  metric: ["name", "value", "unit", "kind", "dimensions"],
  trace: ["traceId", "spanId", "operation", "startedAt", "durationMs", "status", "parentSpanId"],
  "operational-event": ["name", "component", "outcome", "reasonCode"],
  "audit-event": ["actorType", "actorId", "action", "entityType", "entityId", "authoritySource", "result", "simulation"],
  diagnostic: ["code", "component", "status", "summary", "operatorAction"],
  "evaluation-result": ["evaluationRunId", "evaluatorId", "evaluatorVersion", "subjectType", "subjectId", "outcome", "score", "evidenceReferences"],
  "health-signal": ["subjectType", "subjectId", "dimension", "state", "evidenceReferences", "derivationVersion"],
  "business-signal": ["name", "domain", "subjectType", "subjectId", "state", "evidenceReferences"],
};

function assertString(value: unknown): void {
  if (typeof value !== "string" || !value.trim()) {
    throw new SignalContractError("INVALID_PAYLOAD");
  }
}

function assertStringArray(value: unknown): void {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry.trim())) {
    throw new SignalContractError("INVALID_PAYLOAD");
  }
}

function validatePayloadTypes(signalType: CanonicalSignalType, value: Record<string, unknown>): void {
  switch (signalType) {
    case "metric":
      assertString(value.name);
      assertString(value.unit);
      if (typeof value.value !== "number" || !Number.isFinite(value.value)) throw new SignalContractError("INVALID_PAYLOAD");
      if (!["counter", "gauge", "histogram-observation", "rate-input"].includes(String(value.kind))) throw new SignalContractError("INVALID_PAYLOAD");
      break;
    case "trace":
      for (const field of ["traceId", "spanId", "operation", "startedAt"]) assertString(value[field]);
      if (typeof value.durationMs !== "number" || !Number.isFinite(value.durationMs) || value.durationMs < 0) throw new SignalContractError("INVALID_PAYLOAD");
      if (!Number.isFinite(Date.parse(String(value.startedAt)))) throw new SignalContractError("INVALID_PAYLOAD");
      break;
    case "operational-event":
      for (const field of ["name", "component", "outcome"]) assertString(value[field]);
      break;
    case "audit-event":
      for (const field of ["actorType", "actorId", "action", "entityType", "entityId", "authoritySource", "result"]) assertString(value[field]);
      if (typeof value.simulation !== "boolean") throw new SignalContractError("INVALID_PAYLOAD");
      break;
    case "diagnostic":
      for (const field of ["code", "component", "status", "summary"]) assertString(value[field]);
      break;
    case "evaluation-result":
      for (const field of ["evaluationRunId", "evaluatorId", "evaluatorVersion", "subjectType", "subjectId", "outcome"]) assertString(value[field]);
      assertStringArray(value.evidenceReferences);
      if (value.score !== undefined && (typeof value.score !== "number" || !Number.isFinite(value.score))) throw new SignalContractError("INVALID_PAYLOAD");
      break;
    case "health-signal":
      for (const field of ["subjectType", "subjectId", "dimension", "state", "derivationVersion"]) assertString(value[field]);
      assertStringArray(value.evidenceReferences);
      break;
    case "business-signal":
      for (const field of ["name", "domain", "subjectType", "subjectId", "state"]) assertString(value[field]);
      assertStringArray(value.evidenceReferences);
      break;
  }
}

export function validatePayload(
  signalType: CanonicalSignalType,
  value: unknown,
  evidenceCompleteness: EvidenceCompleteness,
  maxPayloadBytes: number,
): void {
  assertObject(value);
  assertNoCredential(value);
  requireFields(value, requiredPayloadFields[signalType]);
  for (const field of Object.keys(value)) {
    if (!allowedPayloadFields[signalType].includes(field)) {
      throw new SignalContractError("INVALID_PAYLOAD");
    }
  }
  validatePayloadTypes(signalType, value);

  const size = new TextEncoder().encode(JSON.stringify(value)).byteLength;
  if (size > maxPayloadBytes) throw new SignalContractError("PAYLOAD_TOO_LARGE");

  if (
    evidenceCompleteness === "MISSING" &&
    ((signalType === "evaluation-result" && value.outcome === "passed") ||
      (signalType === "health-signal" && value.state === "healthy") ||
      (signalType === "operational-event" && value.outcome === "succeeded"))
  ) {
    throw new SignalContractError("INVALID_PAYLOAD");
  }
}
