import type { RuntimeAdapterSelectionResult } from "./runtime-adapter-framework";
import type { RuntimeExecutionArchitectureValidation } from "./runtime-execution-validator";
import type { RuntimeExecutionIdentity, RuntimeExecutionReadiness, RuntimeIdempotencyIdentity } from "./runtime-idempotency";
import { validateRuntimeExecutionReadiness } from "./runtime-idempotency";
import type { RuntimeOutcomeProjection } from "./runtime-outcome";
import { validateRuntimeOutcomeProjection } from "./runtime-outcome";
import type { RuntimeRecoveryPlan } from "./runtime-recovery";
import { validateRuntimeRecoveryPlan } from "./runtime-recovery";
import type { RuntimeSafetyPolicy, RuntimeSafetyValidation } from "./runtime-safety";
import { validateRuntimeSafetyPolicy } from "./runtime-safety";
import type { RuntimeTargetResolutionResult } from "./runtime-target-resolution";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_EXECUTION_INTEGRATION_VERSION = "runtime-execution-integration/v1";
export const RUNTIME_INTEGRATION_STAGES = ["request_validated", "target_resolved", "adapter_selected", "identity_validated", "idempotency_validated", "safety_validated", "authority_unresolved", "outcome_contract_validated", "recovery_contract_validated", "integration_blocked", "integration_invalid"] as const;
export const RUNTIME_INTEGRATION_GATES = ["runtime_authority", "adapter_unavailable", "invalid_request", "invalid_target", "invalid_identity", "idempotency_conflict", "safety_blocked", "outcome_contract_invalid", "recovery_contract_invalid"] as const;
export const RUNTIME_INTEGRATION_ERROR_CODES = ["INVALID_INTEGRATION_INPUT", "REQUEST_TARGET_MISMATCH", "TARGET_ADAPTER_MISMATCH", "EXECUTION_IDENTITY_MISMATCH", "IDEMPOTENCY_INTEGRATION_CONFLICT", "SAFETY_INTEGRATION_BLOCKED", "AUTHORITY_GATE_MISSING", "OUTCOME_CONTRACT_MISMATCH", "RECOVERY_CONTRACT_MISMATCH", "EXECUTABLE_INTEGRATION_LEAKAGE", "INTEGRATION_SERIALIZATION_FAILED"] as const;

type Gate = (typeof RUNTIME_INTEGRATION_GATES)[number];
type ErrorCode = (typeof RUNTIME_INTEGRATION_ERROR_CODES)[number];
export interface RuntimeExecutionIntegrationInput {
  readonly integrationId: string;
  readonly request: RuntimeExecutionArchitectureValidation;
  readonly target: RuntimeTargetResolutionResult;
  readonly adapter: RuntimeAdapterSelectionResult;
  readonly identity: RuntimeExecutionIdentity;
  readonly idempotency: RuntimeIdempotencyIdentity;
  readonly readiness: RuntimeExecutionReadiness;
  readonly safetyPolicy: RuntimeSafetyPolicy;
  readonly safety: RuntimeSafetyValidation;
  readonly outcome: RuntimeOutcomeProjection;
  readonly recovery: RuntimeRecoveryPlan;
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeExecutionIntegrationResult {
  readonly integrationId: string;
  readonly executionId: string;
  readonly logicalId: string;
  readonly targetId: string;
  readonly adapterFamily: string;
  readonly currentStage: (typeof RUNTIME_INTEGRATION_STAGES)[number];
  readonly status: "invalid" | "blocked" | "authority_required";
  readonly unresolvedGates: readonly Gate[];
  readonly safetyClassification: RuntimeSafetyPolicy["classification"];
  readonly readiness: RuntimeSafetyValidation["readiness"];
  readonly outcomeContractPresent: true;
  readonly recoveryContractPresent: true;
  readonly architectureVersion: typeof RUNTIME_EXECUTION_INTEGRATION_VERSION;
  readonly executable: false;
  readonly authoritative: false;
  readonly error?: { readonly code: ErrorCode; readonly message: string; };
}

function copyInert(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value !== "object" || value instanceof Promise || seen.has(value)) throw new TypeError("Runtime integration accepts only serializable inert metadata.");
  if (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value)) throw new TypeError("Runtime integration accepts plain metadata only.");
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => copyInert(item, seen));
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copyInert(item, seen)]));
}
function inert(value: unknown): value is { readonly executable: false; readonly authoritative: false } { return Boolean(value) && typeof value === "object" && Object.isFrozen(value) && (value as { executable?: unknown }).executable === false && (value as { authoritative?: unknown }).authoritative === false; }
function error(code: ErrorCode, message: string): RuntimeExecutionIntegrationResult["error"] { return deepFreeze({ code, message }); }
function result(input: RuntimeExecutionIntegrationInput, currentStage: RuntimeExecutionIntegrationResult["currentStage"], status: RuntimeExecutionIntegrationResult["status"], gates: readonly Gate[], issue?: RuntimeExecutionIntegrationResult["error"]): RuntimeExecutionIntegrationResult {
  return deepFreeze({ integrationId: input.integrationId, executionId: input.identity.executionId, logicalId: input.outcome.logicalId, targetId: input.outcome.targetId, adapterFamily: input.identity.adapterFamily, currentStage, status, unresolvedGates: [...gates], safetyClassification: input.safetyPolicy.classification, readiness: input.safety.readiness, outcomeContractPresent: true as const, recoveryContractPresent: true as const, architectureVersion: RUNTIME_EXECUTION_INTEGRATION_VERSION, executable: false as const, authoritative: false as const, ...(issue ? { error: { ...issue } } : {}) });
}

/** Copies and deeply freezes every declarative stage; functions, handles, promises and cycles are rejected. */
export function createRuntimeExecutionIntegrationInput(input: RuntimeExecutionIntegrationInput): RuntimeExecutionIntegrationInput {
  if (!validText(input.integrationId) || input.executable !== false || input.authoritative !== false) throw new TypeError("Invalid Runtime execution integration input.");
  return deepFreeze(copyInert({ ...input, executable: false as const, authoritative: false as const }) as RuntimeExecutionIntegrationInput);
}

/** Pure composition of declarative contracts. It cannot authorize, invoke, queue or mutate Runtime. */
export function integrateRuntimeExecution(input: RuntimeExecutionIntegrationInput): RuntimeExecutionIntegrationResult {
  if (!Object.isFrozen(input) || !inert(input)) return result(input, "integration_invalid", "invalid", ["invalid_request"], error("EXECUTABLE_INTEGRATION_LEAKAGE", "Integration input must remain immutable inert metadata."));
  if (!inert(input.target) || input.target.status !== "resolved" || !inert(input.adapter) || !inert(input.identity) || !inert(input.idempotency) || !inert(input.readiness) || !inert(input.safetyPolicy) || !inert(input.safety) || !inert(input.outcome) || !inert(input.recovery)) return result(input, "integration_invalid", "invalid", ["invalid_request"], error("INVALID_INTEGRATION_INPUT", "Every integration contract must be immutable and non-authoritative."));
  if (input.request.status !== "blocked" || input.request.lifecycle !== "authority_required") return result(input, "integration_invalid", "invalid", ["invalid_request"], error("INVALID_INTEGRATION_INPUT", "Request validation must remain blocked on Runtime authority."));
  if (input.target.status !== "resolved") return result(input, "integration_blocked", "blocked", ["invalid_target"], error("REQUEST_TARGET_MISMATCH", "Canonical target is unresolved or invalid."));
  if (input.adapter.status !== "selected") return result(input, "integration_blocked", "blocked", ["adapter_unavailable"], error("TARGET_ADAPTER_MISMATCH", "No inert adapter descriptor is selectable."));
  if (input.adapter.descriptor.adapterFamily !== input.target.target.targetFamily || input.identity.targetIdentity !== input.target.target.canonicalTargetId || input.identity.adapterFamily !== input.target.target.targetFamily) return result(input, "integration_invalid", "invalid", ["invalid_identity"], error("EXECUTION_IDENTITY_MISMATCH", "Target, adapter and identity metadata are inconsistent."));
  if (validateRuntimeExecutionReadiness({ identity: input.identity, idempotency: input.idempotency, readiness: input.readiness }).status !== "blocked") return result(input, "integration_blocked", "blocked", ["idempotency_conflict"], error("IDEMPOTENCY_INTEGRATION_CONFLICT", "Idempotency metadata is inconsistent or blocked."));
  const safety = validateRuntimeSafetyPolicy(input.safetyPolicy);
  if (safety.status !== "blocked" || safety.readiness !== "authority_required" || input.safety.status !== "blocked" || input.safety.readiness !== "authority_required") return result(input, "integration_blocked", "blocked", ["safety_blocked"], error("SAFETY_INTEGRATION_BLOCKED", "Safety metadata cannot be escalated beyond authority-required."));
  if (input.outcome.executionId !== input.identity.executionId || input.outcome.targetId !== input.identity.targetIdentity || validateRuntimeOutcomeProjection(input.outcome).status !== "valid" || input.outcome.outcome !== "blocked") return result(input, "integration_invalid", "invalid", ["outcome_contract_invalid"], error("OUTCOME_CONTRACT_MISMATCH", "Outcome projection is incompatible or implies execution."));
  const recovery = validateRuntimeRecoveryPlan(input.recovery);
  if (input.recovery.executionId !== input.identity.executionId || input.recovery.targetId !== input.identity.targetIdentity || !["not_required", "authority_required"].includes(recovery.status)) return result(input, "integration_invalid", "invalid", ["recovery_contract_invalid"], error("RECOVERY_CONTRACT_MISMATCH", "Recovery metadata is incompatible or cannot remain declarative."));
  return result(input, "authority_unresolved", "authority_required", ["runtime_authority"]);
}
