import { createCanonicalReadServices } from "./index";
import {
  CANONICAL_READ_ALLOW_REMOTE_ENV,
  CANONICAL_READ_DATABASE_URL_ENV,
  readCanonicalReadConfigFromEnv,
} from "./config";
import {
  runKnowledgeShadowRead,
  type KnowledgeShadowReadResult,
} from "@/features/knowledge-shadow-read";
import {
  readKnowledgeSilentDualReadConfigFromEnv,
  summarizeKnowledgeSilentDualReadRolloutForDiagnostics,
  type KnowledgeSilentDualReadRolloutDiagnosticsView,
} from "@/features/knowledge-silent-dual-read";
import {
  activeProvider,
  type PersistenceProviderDescriptor,
} from "@/features/persistence";
import { listRegisteredPersistenceProviders } from "@/features/persistence/provider-registry";
import {
  getLatestKnowledgeReadRoutingObservation,
  summarizePlannedKnowledgeReadRouting,
} from "@/features/knowledge-read-facade";
import { describeKnowledgeCanonicalRepository } from "@/features/knowledge-canonical-repository";
import type { CanonicalRepositoryDiagnosticsView } from "@/features/canonical-repository";
import {
  runExecutionShadowRead,
  type ExecutionShadowReadResult,
} from "@/features/execution-shadow-read";
import {
  runActorShadowRead,
  type ActorShadowReadResult,
} from "@/features/actor-shadow-read";
import type {
  ActorResolutionResult,
  CanonicalKnowledgeFactResult,
  CanonicalReadAvailability,
  CanonicalReadError,
  CanonicalReadServices,
  ExecutionLineageResult,
} from "./types";

export const ENABLE_CANONICAL_READ_DIAGNOSTICS_ENV =
  "HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SearchParamValue = string | string[] | undefined;
type SearchParamRecord = Record<string, SearchParamValue>;

type HostClass = "local" | "approved" | "rejected" | "unconfigured";
type AvailabilityState = "available" | "unavailable" | "degraded";
type InspectorKind =
  | "actor"
  | "actor-shadow"
  | "knowledge"
  | "execution"
  | "knowledge-shadow"
  | "execution-shadow";

export interface CanonicalReadDiagnosticsAvailabilityView {
  readonly configured: boolean;
  readonly state: AvailabilityState;
  readonly targetSummary: string;
  readonly hostClass: HostClass;
  readonly localTargetValid: boolean;
  readonly healthCheckResult: "passed" | "failed" | "skipped";
  readonly checkedAt?: string;
  readonly latencyMs?: number;
  readonly queryTimeoutMs: number;
  readonly databaseUrlEnv: string;
  readonly allowRemoteEnv: string;
  readonly diagnosticsEnv: string;
  readonly sanitizedErrorCategory?: string;
  readonly warnings: readonly string[];
}

export interface CanonicalReadDiagnosticsFormField {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly placeholder?: string;
  readonly required?: boolean;
}

export interface CanonicalReadDiagnosticsInspectorView<Result> {
  readonly kind: InspectorKind;
  readonly enabled: boolean;
  readonly title: string;
  readonly description: string;
  readonly fields: readonly CanonicalReadDiagnosticsFormField[];
  readonly inputErrors: readonly string[];
  readonly result?: Result;
}

export interface CanonicalReadDiagnosticsModel {
  readonly access: {
    readonly enabled: boolean;
    readonly nodeEnv: string;
    readonly diagnosticsFlagEnabled: boolean;
  };
  readonly availability: CanonicalReadDiagnosticsAvailabilityView;
  readonly persistence: {
    readonly activeProvider: string;
    readonly providers: readonly PersistenceProviderDescriptor[];
  };
  readonly knowledgeRepository: CanonicalRepositoryDiagnosticsView;
  readonly knowledgeReadRouting: {
    readonly routingDecision: "authoritative-only" | "authoritative-with-shadow";
    readonly authoritativeProvider: string;
    readonly shadowProvider: string;
    readonly comparisonStatus?: string;
    readonly latencyMs?: number;
    readonly rolloutDecision?: string;
    readonly observedAt?: string;
  };
  readonly knowledgeSilentDualReadRollout: KnowledgeSilentDualReadRolloutDiagnosticsView;
  readonly actor: CanonicalReadDiagnosticsInspectorView<ActorResolutionResult>;
  readonly actorShadow: CanonicalReadDiagnosticsInspectorView<ActorShadowReadResult>;
  readonly knowledge: CanonicalReadDiagnosticsInspectorView<CanonicalKnowledgeFactResult>;
  readonly knowledgeShadow: CanonicalReadDiagnosticsInspectorView<KnowledgeShadowReadResult>;
  readonly executionShadow: CanonicalReadDiagnosticsInspectorView<ExecutionShadowReadResult>;
  readonly execution: CanonicalReadDiagnosticsInspectorView<ExecutionLineageResult>;
  readonly lastDiagnosticAttempt?: string;
}

export interface CanonicalReadDiagnosticsOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly services?: CanonicalReadServices;
}

export function isCanonicalReadDiagnosticsEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    env.NODE_ENV !== "production" &&
    env[ENABLE_CANONICAL_READ_DIAGNOSTICS_ENV] === "true"
  );
}

export function getCanonicalReadDiagnosticsAccess(
  env: NodeJS.ProcessEnv = process.env,
): CanonicalReadDiagnosticsModel["access"] {
  return {
    enabled: isCanonicalReadDiagnosticsEnabled(env),
    nodeEnv: env.NODE_ENV ?? "development",
    diagnosticsFlagEnabled:
      env[ENABLE_CANONICAL_READ_DIAGNOSTICS_ENV] === "true",
  };
}

function first(value: SearchParamValue): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function isUuidLike(value: string): boolean {
  return UUID_RE.test(value);
}

function sanitizeAvailabilityWarnings(
  availability: CanonicalReadAvailability,
): readonly string[] {
  if (availability.reason === "connection_failed") {
    return ["PostgreSQL health check failed."];
  }

  return availability.warnings;
}

function sanitizeError(error?: CanonicalReadError): CanonicalReadError | undefined {
  if (!error) return undefined;

  return {
    code: error.code,
    message:
      error.code === "query_failed"
        ? "Canonical PostgreSQL query failed."
        : error.message,
    retryable: error.retryable,
  };
}

function sanitizeActorResult(
  result: ActorResolutionResult,
): ActorResolutionResult {
  return {
    ...result,
    availability: {
      ...result.availability,
      warnings: sanitizeAvailabilityWarnings(result.availability),
    },
    warnings:
      result.status === "unavailable" && result.error?.code === "query_failed"
        ? ["Canonical PostgreSQL query failed."]
        : result.warnings,
    error: sanitizeError(result.error),
  };
}

function sanitizeActorShadowResult(
  result: ActorShadowReadResult,
): ActorShadowReadResult {
  return sanitizeShadowAvailability(result);
}

function sanitizeKnowledgeResult(
  result: CanonicalKnowledgeFactResult,
): CanonicalKnowledgeFactResult {
  return {
    ...result,
    availability: {
      ...result.availability,
      warnings: sanitizeAvailabilityWarnings(result.availability),
    },
    error: sanitizeError(result.error),
  };
}

function sanitizeExecutionResult(
  result: ExecutionLineageResult,
): ExecutionLineageResult {
  return {
    ...result,
    availability: {
      ...result.availability,
      warnings: sanitizeAvailabilityWarnings(result.availability),
    },
    error: sanitizeError(result.error),
  };
}

function sanitizeExecutionShadowResult(
  result: ExecutionShadowReadResult,
): ExecutionShadowReadResult {
  return sanitizeShadowAvailability(result);
}

function sanitizeKnowledgeShadowResult(
  result: KnowledgeShadowReadResult,
): KnowledgeShadowReadResult {
  return sanitizeShadowAvailability(result);
}

function sanitizeShadowAvailability<Result extends {
  readonly postgres: {
    readonly availability: CanonicalReadAvailability;
  };
}>(result: Result): Result {
  return {
    ...result,
    postgres: {
      ...result.postgres,
      ...(result.postgres as Record<string, unknown>),
      availability: {
        ...result.postgres.availability,
        warnings: sanitizeAvailabilityWarnings(result.postgres.availability),
      },
    },
  };
}

export function summarizeAvailability(
  availability: CanonicalReadAvailability,
  env: NodeJS.ProcessEnv = process.env,
): CanonicalReadDiagnosticsAvailabilityView {
  const config = readCanonicalReadConfigFromEnv(env);
  const hostClass: HostClass = !availability.configured
    ? "unconfigured"
    : !availability.target
      ? "unconfigured"
      : availability.target.local
        ? "local"
        : availability.reason === "disallowed_target"
          ? "rejected"
          : "approved";
  const state: AvailabilityState = !availability.configured
    ? "unavailable"
    : availability.available
      ? "available"
      : availability.reason === "connection_failed"
        ? "degraded"
        : "unavailable";

  return {
    configured: availability.configured,
    state,
    targetSummary: availability.target
      ? `${availability.target.host}:${availability.target.port ?? 5432}/${availability.target.database}`
      : "Not configured",
    hostClass,
    localTargetValid:
      hostClass === "local" ||
      (hostClass === "approved" && config.allowRemote === true),
    healthCheckResult: !availability.configured
      ? "skipped"
      : availability.available
        ? "passed"
        : "failed",
    checkedAt: availability.checkedAt,
    latencyMs: availability.latencyMs,
    queryTimeoutMs: config.statementTimeoutMs ?? 5000,
    databaseUrlEnv: CANONICAL_READ_DATABASE_URL_ENV,
    allowRemoteEnv: CANONICAL_READ_ALLOW_REMOTE_ENV,
    diagnosticsEnv: ENABLE_CANONICAL_READ_DIAGNOSTICS_ENV,
    sanitizedErrorCategory: availability.reason,
    warnings: sanitizeAvailabilityWarnings(availability),
  };
}

function parseActorInput(params: SearchParamRecord): {
  readonly fields: readonly CanonicalReadDiagnosticsFormField[];
  readonly errors: readonly string[];
  readonly input?: {
    tenantId: string;
    actorType: "human" | "agent" | "system" | "service";
    actorId: string;
  };
} {
  const tenantId = first(params.actorTenantId);
  const actorType = first(params.actorType);
  const actorId = first(params.actorId);
  const errors: string[] = [];

  if (tenantId && !isUuidLike(tenantId)) {
    errors.push("Actor tenantId must be a UUID.");
  }
  if (
    actorType &&
    !["human", "agent", "system", "service"].includes(actorType)
  ) {
    errors.push("Actor type must be one of human, agent, system or service.");
  }
  if (actorId && !isUuidLike(actorId)) {
    errors.push("Actor actorId must be a UUID.");
  }

  return {
    fields: [
      {
        label: "Tenant ID",
        name: "actorTenantId",
        value: tenantId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
      {
        label: "Actor Type",
        name: "actorType",
        value: actorType,
        placeholder: "human | agent | system | service",
        required: true,
      },
      {
        label: "Actor ID",
        name: "actorId",
        value: actorId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
    ],
    errors,
    input:
      tenantId && actorType && actorId && errors.length === 0
        ? {
            tenantId,
            actorType: actorType as "human" | "agent" | "system" | "service",
            actorId,
          }
        : undefined,
  };
}

function parseKnowledgeInput(params: SearchParamRecord): {
  readonly fields: readonly CanonicalReadDiagnosticsFormField[];
  readonly errors: readonly string[];
  readonly input?: {
    tenantId: string;
    factKey: string;
    domainKey: string;
    knowledgeScope: "company-wide" | "department" | "domain";
  };
} {
  const tenantId = first(params.knowledgeTenantId);
  const factKey = first(params.factKey);
  const domainKey = first(params.domainKey);
  const knowledgeScope = first(params.knowledgeScope);
  const errors: string[] = [];

  if (tenantId && !isUuidLike(tenantId)) {
    errors.push("Knowledge tenantId must be a UUID.");
  }
  if (
    knowledgeScope &&
    !["company-wide", "department", "domain"].includes(knowledgeScope)
  ) {
    errors.push(
      "Knowledge scope must be one of company-wide, department or domain.",
    );
  }

  return {
    fields: [
      {
        label: "Tenant ID",
        name: "knowledgeTenantId",
        value: tenantId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
      {
        label: "Fact Key",
        name: "factKey",
        value: factKey,
        placeholder: "fact.ops.current",
        required: true,
      },
      {
        label: "Domain Key",
        name: "domainKey",
        value: domainKey,
        placeholder: "ops",
        required: true,
      },
      {
        label: "Knowledge Scope",
        name: "knowledgeScope",
        value: knowledgeScope,
        placeholder: "company-wide | department | domain",
        required: true,
      },
    ],
    errors,
    input:
      tenantId &&
      factKey &&
      domainKey &&
      knowledgeScope &&
      errors.length === 0
        ? {
            tenantId,
            factKey,
            domainKey,
            knowledgeScope: knowledgeScope as
              | "company-wide"
              | "department"
              | "domain",
          }
        : undefined,
  };
}

function parseActorShadowInput(params: SearchParamRecord): {
  readonly fields: readonly CanonicalReadDiagnosticsFormField[];
  readonly errors: readonly string[];
  readonly input?: {
    tenantId: string;
    actorType: "human" | "agent" | "system" | "service";
    actorId: string;
  };
} {
  const tenantId = first(params.shadowActorTenantId);
  const actorType = first(params.shadowActorType);
  const actorId = first(params.shadowActorId);
  const errors: string[] = [];

  if (tenantId && !isUuidLike(tenantId)) {
    errors.push("Actor shadow tenantId must be a UUID.");
  }
  if (
    actorType &&
    !["human", "agent", "system", "service"].includes(actorType)
  ) {
    errors.push(
      "Actor shadow type must be one of human, agent, system or service.",
    );
  }
  if (actorId && !isUuidLike(actorId)) {
    errors.push("Actor shadow actorId must be a UUID.");
  }

  return {
    fields: [
      {
        label: "Tenant ID",
        name: "shadowActorTenantId",
        value: tenantId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
      {
        label: "Actor Type",
        name: "shadowActorType",
        value: actorType,
        placeholder: "human | agent | system | service",
        required: true,
      },
      {
        label: "Actor ID",
        name: "shadowActorId",
        value: actorId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
    ],
    errors,
    input:
      tenantId && actorType && actorId && errors.length === 0
        ? {
            tenantId,
            actorType: actorType as "human" | "agent" | "system" | "service",
            actorId,
          }
        : undefined,
  };
}

function parseKnowledgeShadowInput(params: SearchParamRecord): {
  readonly fields: readonly CanonicalReadDiagnosticsFormField[];
  readonly errors: readonly string[];
  readonly input?: {
    tenantId: string;
    factKey: string;
    domainKey: string;
    knowledgeScope: "company-wide" | "department" | "domain";
  };
} {
  const tenantId = first(params.shadowTenantId);
  const factKey = first(params.shadowFactKey);
  const domainKey = first(params.shadowDomainKey);
  const knowledgeScope = first(params.shadowKnowledgeScope);
  const errors: string[] = [];

  if (tenantId && !isUuidLike(tenantId)) {
    errors.push("Shadow tenantId must be a UUID.");
  }
  if (
    knowledgeScope &&
    !["company-wide", "department", "domain"].includes(knowledgeScope)
  ) {
    errors.push(
      "Shadow knowledge scope must be one of company-wide, department or domain.",
    );
  }

  return {
    fields: [
      {
        label: "Tenant ID",
        name: "shadowTenantId",
        value: tenantId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
      {
        label: "Fact Key",
        name: "shadowFactKey",
        value: factKey,
        placeholder: "existing memory node slug or id",
        required: true,
      },
      {
        label: "Domain Key",
        name: "shadowDomainKey",
        value: domainKey,
        placeholder: "goals",
        required: true,
      },
      {
        label: "Knowledge Scope",
        name: "shadowKnowledgeScope",
        value: knowledgeScope,
        placeholder: "company-wide | department | domain",
        required: true,
      },
    ],
    errors,
    input:
      tenantId &&
      factKey &&
      domainKey &&
      knowledgeScope &&
      errors.length === 0
        ? {
            tenantId,
            factKey,
            domainKey,
            knowledgeScope: knowledgeScope as
              | "company-wide"
              | "department"
              | "domain",
          }
        : undefined,
  };
}

function parseExecutionInput(params: SearchParamRecord): {
  readonly fields: readonly CanonicalReadDiagnosticsFormField[];
  readonly errors: readonly string[];
  readonly input?: {
    tenantId: string;
    executionId: string;
  };
} {
  const tenantId = first(params.executionTenantId);
  const executionId = first(params.executionId);
  const errors: string[] = [];

  if (tenantId && !isUuidLike(tenantId)) {
    errors.push("Execution tenantId must be a UUID.");
  }
  if (executionId && !isUuidLike(executionId)) {
    errors.push("Execution executionId must be a UUID.");
  }

  return {
    fields: [
      {
        label: "Tenant ID",
        name: "executionTenantId",
        value: tenantId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
      {
        label: "Execution ID",
        name: "executionId",
        value: executionId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
    ],
    errors,
    input:
      tenantId && executionId && errors.length === 0
        ? { tenantId, executionId }
        : undefined,
  };
}

function parseExecutionShadowInput(params: SearchParamRecord): {
  readonly fields: readonly CanonicalReadDiagnosticsFormField[];
  readonly errors: readonly string[];
  readonly input?: {
    tenantId: string;
    executionId: string;
  };
} {
  const tenantId = first(params.shadowExecutionTenantId);
  const executionId = first(params.shadowExecutionId);
  const errors: string[] = [];

  if (tenantId && !isUuidLike(tenantId)) {
    errors.push("Execution shadow tenantId must be a UUID.");
  }
  if (executionId && !isUuidLike(executionId)) {
    errors.push("Execution shadow executionId must be a UUID.");
  }

  return {
    fields: [
      {
        label: "Tenant ID",
        name: "shadowExecutionTenantId",
        value: tenantId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
      {
        label: "Execution ID",
        name: "shadowExecutionId",
        value: executionId,
        placeholder: "00000000-0000-0000-0000-000000000000",
        required: true,
      },
    ],
    errors,
    input:
      tenantId && executionId && errors.length === 0
        ? { tenantId, executionId }
        : undefined,
  };
}

function firstProvidedTenantId(
  ...values: Array<string | undefined>
): string | undefined {
  return values.find((value) => Boolean(value?.trim()));
}

export async function buildCanonicalReadDiagnosticsModel(
  params: SearchParamRecord = {},
  options: CanonicalReadDiagnosticsOptions = {},
): Promise<CanonicalReadDiagnosticsModel> {
  const env = options.env ?? process.env;
  const access = getCanonicalReadDiagnosticsAccess(env);
  const services =
    options.services ??
    createCanonicalReadServices(readCanonicalReadConfigFromEnv(env));
  const inspector = first(params.inspect) as InspectorKind | "";

  try {
    const availability = await services.availability();
    const sanitizedAvailability = summarizeAvailability(availability, env);

    const actorInput = parseActorInput(params);
    const actorShadowInput = parseActorShadowInput(params);
    const knowledgeInput = parseKnowledgeInput(params);
    const knowledgeShadowInput = parseKnowledgeShadowInput(params);
    const executionInput = parseExecutionInput(params);
    const executionShadowInput = parseExecutionShadowInput(params);
    const rolloutConfig = readKnowledgeSilentDualReadConfigFromEnv(env);
    const rolloutTenantId = firstProvidedTenantId(
      knowledgeShadowInput.input?.tenantId,
      knowledgeInput.input?.tenantId,
      first(params.shadowTenantId),
      first(params.knowledgeTenantId),
    );
    const rolloutSampleKey =
      knowledgeShadowInput.input && knowledgeShadowInput.input.factKey
        ? [
            "knowledge-shadow",
            knowledgeShadowInput.input.tenantId,
            knowledgeShadowInput.input.factKey,
            knowledgeShadowInput.input.domainKey,
            knowledgeShadowInput.input.knowledgeScope,
          ].join(":")
        : knowledgeInput.input && knowledgeInput.input.factKey
          ? [
              "knowledge-shadow",
              knowledgeInput.input.tenantId,
              knowledgeInput.input.factKey,
              knowledgeInput.input.domainKey,
              knowledgeInput.input.knowledgeScope,
          ].join(":")
          : undefined;
    const plannedRouting = summarizePlannedKnowledgeReadRouting({
      request: knowledgeInput.input ?? knowledgeShadowInput.input,
      env,
    });
    const latestRouting = getLatestKnowledgeReadRoutingObservation();

    const actorResult =
      inspector === "actor" && actorInput.input
        ? sanitizeActorResult(await services.resolveActor(actorInput.input))
        : undefined;
    const actorShadowResult =
      inspector === "actor-shadow" && actorShadowInput.input
        ? sanitizeActorShadowResult(
            await runActorShadowRead(actorShadowInput.input, {
              env,
              canonicalReadServices: services,
            }),
          )
        : undefined;
    const knowledgeResult =
      inspector === "knowledge" && knowledgeInput.input
        ? sanitizeKnowledgeResult(
            await services.selectCanonicalKnowledgeFact(knowledgeInput.input),
          )
        : undefined;
    const knowledgeShadowResult =
      inspector === "knowledge-shadow" && knowledgeShadowInput.input
        ? sanitizeKnowledgeShadowResult(
            await runKnowledgeShadowRead(knowledgeShadowInput.input, {
              env,
              canonicalReadServices: services,
            }),
          )
        : undefined;
    const executionResult =
      inspector === "execution" && executionInput.input
        ? sanitizeExecutionResult(
            await services.getExecutionLineage(executionInput.input),
          )
        : undefined;
    const executionShadowResult =
      inspector === "execution-shadow" && executionShadowInput.input
        ? sanitizeExecutionShadowResult(
            await runExecutionShadowRead(executionShadowInput.input, {
              env,
              canonicalReadServices: services,
            }),
          )
        : undefined;

    return {
      access,
      availability: sanitizedAvailability,
      persistence: {
        activeProvider: activeProvider(),
        providers: await listRegisteredPersistenceProviders(env),
      },
      knowledgeRepository: await describeKnowledgeCanonicalRepository({
        memoryNodes: [],
        canonicalReadServices: services,
      }),
      knowledgeReadRouting: {
        routingDecision:
          latestRouting?.routingDecision ?? plannedRouting.routingDecision,
        authoritativeProvider:
          latestRouting?.authoritativeProvider ??
          plannedRouting.authoritativeProvider,
        shadowProvider:
          latestRouting?.shadowProvider ?? plannedRouting.shadowProvider,
        comparisonStatus: latestRouting?.comparisonStatus,
        latencyMs:
          latestRouting?.totalLatencyMs ?? latestRouting?.authoritativeLatencyMs,
        rolloutDecision:
          latestRouting?.rolloutDecision ?? plannedRouting.rolloutDecision,
        observedAt: latestRouting?.recordedAt,
      },
      knowledgeSilentDualReadRollout:
        summarizeKnowledgeSilentDualReadRolloutForDiagnostics({
          config: rolloutConfig,
          tenantId: rolloutTenantId,
          requestSampleKey: rolloutSampleKey,
        }),
      actor: {
        kind: "actor",
        enabled: inspector === "actor",
        title: "Actor Resolution",
        description:
          "Resolve a canonical actor reference without changing identity, permissions or authority.",
        fields: actorInput.fields,
        inputErrors: actorInput.errors,
        result: actorResult,
      },
      actorShadow: {
        kind: "actor-shadow",
        enabled: inspector === "actor-shadow",
        title: "Actor Shadow Read",
        description:
          "Compare the memory-authoritative actor representation against canonical PostgreSQL actor resolution. Shadow only. No authorization effect.",
        fields: actorShadowInput.fields,
        inputErrors: actorShadowInput.errors,
        result: actorShadowResult,
      },
      knowledge: {
        kind: "knowledge",
        enabled: inspector === "knowledge",
        title: "Canonical Knowledge",
        description:
          "Resolve a canonical fact key through knowledge_facts to the active knowledge node.",
        fields: knowledgeInput.fields,
        inputErrors: knowledgeInput.errors,
        result: knowledgeResult,
      },
      knowledgeShadow: {
        kind: "knowledge-shadow",
        enabled: inspector === "knowledge-shadow",
        title: "Knowledge Shadow Read",
        description:
          "Compare the memory-authoritative Knowledge representation against the canonical PostgreSQL fact selection. Shadow only. No runtime effect.",
        fields: knowledgeShadowInput.fields,
        inputErrors: knowledgeShadowInput.errors,
        result: knowledgeShadowResult,
      },
      executionShadow: {
        kind: "execution-shadow",
        enabled: inspector === "execution-shadow",
        title: "Execution Shadow Read",
        description:
          "Compare the current memory-authoritative execution lineage against the canonical PostgreSQL execution lineage. Shadow only. No execution effect.",
        fields: executionShadowInput.fields,
        inputErrors: executionShadowInput.errors,
        result: executionShadowResult,
      },
      execution: {
        kind: "execution",
        enabled: inspector === "execution",
        title: "Execution Lineage",
        description:
          "Inspect the execution to command, workflow, task, plan, goal and mission lineage chain.",
        fields: executionInput.fields,
        inputErrors: executionInput.errors,
        result: executionResult,
      },
      lastDiagnosticAttempt: sanitizedAvailability.checkedAt,
    };
  } finally {
    if (!options.services) {
      await services.dispose();
    }
  }
}
