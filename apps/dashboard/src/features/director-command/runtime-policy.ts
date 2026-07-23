import type { AuthorityIdentityChain } from "./runtime-authority-identity";
import { validateAuthorityIdentityChain } from "./runtime-authority-identity";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_POLICY_VERSION = "runtime-policy/v1";
export const RUNTIME_POLICY_EFFECTS = ["allow", "deny", "approval_required", "not_applicable"] as const;
export const RUNTIME_POLICY_ERROR_CODES = ["INVALID_POLICY", "INVALID_POLICY_SUBJECT", "INVALID_POLICY_RESOURCE", "INVALID_POLICY_ACTION", "INVALID_POLICY_EFFECT", "INVALID_POLICY_CONDITION", "INVALID_POLICY_OBLIGATION", "INVALID_POLICY_ENVIRONMENT", "EXECUTABLE_VALUE_LEAKAGE", "POLICY_SERIALIZATION_FAILED"] as const;

type Metadata = string | number | boolean | null | readonly Metadata[] | { readonly [key: string]: Metadata };
type ErrorCode = (typeof RUNTIME_POLICY_ERROR_CODES)[number];
export interface PolicyVersion { readonly value: string; readonly executable: false; readonly authoritative: false; }
export interface PolicySubject { readonly identity: AuthorityIdentityChain; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface PolicyAction { readonly actionId: string; readonly actionType: string; readonly executionId: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface PolicyResource { readonly resourceId: string; readonly resourceType: "crm" | "finance" | "email" | "storage" | "calendar" | "github" | "runtime_target"; readonly targetIdentity: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface PolicyEnvironment { readonly environment: "production" | "staging" | "development"; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface PolicyCondition { readonly conditionId: string; readonly expression: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface PolicyObligation { readonly obligationId: string; readonly obligationType: "audit_required" | "human_approval" | "dual_control" | "retention_required"; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface PolicyMetadata { readonly policyId: string; readonly version: PolicyVersion; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface Policy { readonly metadata: PolicyMetadata; readonly subject: PolicySubject; readonly action: PolicyAction; readonly resource: PolicyResource; readonly environment: PolicyEnvironment; readonly conditions: readonly PolicyCondition[]; readonly effect: (typeof RUNTIME_POLICY_EFFECTS)[number]; readonly obligations: readonly PolicyObligation[]; readonly architectureVersion: typeof RUNTIME_POLICY_VERSION; readonly executable: false; readonly authoritative: false; }
export interface PolicyValidation { readonly status: "valid" | "invalid"; readonly error?: { readonly code: ErrorCode; readonly message: string; }; readonly executable: false; readonly authoritative: false; }
export interface PolicyValidationResult { readonly policy: Policy; readonly validation: PolicyValidation; readonly executable: false; readonly authoritative: false; }

function copy(value: unknown, seen = new WeakSet<object>()): Metadata {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (!value || typeof value !== "object" || value instanceof Promise || seen.has(value) || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) throw new TypeError("Policy metadata must be serializable inert data.");
  seen.add(value);
  if (Array.isArray(value)) return value.map((entry) => copy(entry, seen));
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copy(entry, seen)]));
}
function inert(value: unknown): value is { readonly executable: false; readonly authoritative: false } { return Boolean(value) && typeof value === "object" && Object.isFrozen(value) && (value as { executable?: unknown }).executable === false && (value as { authoritative?: unknown }).authoritative === false; }
function invalid(code: ErrorCode, message: string): PolicyValidation { return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const }); }

/** Copies immutable policy metadata; an effect describes a future rule and never decides a request. */
export function createRuntimePolicy(input: Omit<Policy, "architectureVersion">): Policy {
  const copied = copy(input) as unknown as Omit<Policy, "architectureVersion">;
  const values = [copied, copied.metadata, copied.metadata.version, copied.subject, copied.subject.identity, copied.action, copied.resource, copied.environment, ...copied.conditions, ...copied.obligations];
  if (values.some((value) => !value || (value as { executable?: unknown }).executable !== false || (value as { authoritative?: unknown }).authoritative !== false)) throw new TypeError("Invalid Runtime policy.");
  return deepFreeze({ ...copied, metadata: { ...copied.metadata, version: { ...copied.metadata.version }, metadata: copied.metadata.metadata }, subject: { ...copied.subject, identity: copied.subject.identity, metadata: copied.subject.metadata }, action: { ...copied.action, metadata: copied.action.metadata }, resource: { ...copied.resource, metadata: copied.resource.metadata }, environment: { ...copied.environment, metadata: copied.environment.metadata }, conditions: copied.conditions.map((condition) => ({ ...condition, metadata: condition.metadata })), obligations: copied.obligations.map((obligation) => ({ ...obligation, metadata: obligation.metadata })), architectureVersion: RUNTIME_POLICY_VERSION, executable: false as const, authoritative: false as const });
}

/** Pure policy-shape validation. It does not interpret an effect or a condition. */
export function validateRuntimePolicy(policy: Policy): PolicyValidation {
  const values = [policy, policy.metadata, policy.metadata.version, policy.subject, policy.subject.identity, policy.action, policy.resource, policy.environment, ...policy.conditions, ...policy.obligations];
  if (values.some((value) => !inert(value))) return invalid("EXECUTABLE_VALUE_LEAKAGE", "Policy must be immutable inert metadata.");
  try { JSON.stringify(policy); } catch { return invalid("POLICY_SERIALIZATION_FAILED", "Policy is not serializable."); }
  if (!validText(policy.metadata.policyId) || !validText(policy.metadata.version.value)) return invalid("INVALID_POLICY", "Policy metadata is invalid.");
  if (validateAuthorityIdentityChain(policy.subject.identity).status !== "bound") return invalid("INVALID_POLICY_SUBJECT", "Policy subject must reference a bound identity chain.");
  if (!validText(policy.action.actionId) || !validText(policy.action.actionType) || policy.action.executionId !== policy.subject.identity.execution.executionIdentity.executionId) return invalid("INVALID_POLICY_ACTION", "Policy action is invalid.");
  if (!validText(policy.resource.resourceId) || !["crm", "finance", "email", "storage", "calendar", "github", "runtime_target"].includes(policy.resource.resourceType) || policy.resource.targetIdentity !== policy.subject.identity.execution.executionIdentity.targetIdentity) return invalid("INVALID_POLICY_RESOURCE", "Policy resource is invalid.");
  if (!(RUNTIME_POLICY_EFFECTS as readonly string[]).includes(policy.effect)) return invalid("INVALID_POLICY_EFFECT", "Policy effect is invalid.");
  if (!["production", "staging", "development"].includes(policy.environment.environment)) return invalid("INVALID_POLICY_ENVIRONMENT", "Policy environment is invalid.");
  if (!policy.conditions.every((condition) => validText(condition.conditionId) && validText(condition.expression))) return invalid("INVALID_POLICY_CONDITION", "Policy condition is invalid.");
  if (!policy.obligations.every((obligation) => validText(obligation.obligationId) && ["audit_required", "human_approval", "dual_control", "retention_required"].includes(obligation.obligationType))) return invalid("INVALID_POLICY_OBLIGATION", "Policy obligation is invalid.");
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}
export function validateRuntimePolicyResult(policy: Policy): PolicyValidationResult { return deepFreeze({ policy, validation: validateRuntimePolicy(policy), executable: false as const, authoritative: false as const }); }
