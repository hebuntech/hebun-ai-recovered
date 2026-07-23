import type { RuntimeAuthorityRequest } from "./runtime-authority";
import type { RuntimeExecutionIdentity } from "./runtime-idempotency";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_AUTHORITY_IDENTITY_VERSION = "runtime-authority-identity/v1";
export const RUNTIME_AUTHORITY_PRINCIPAL_TYPES = ["human", "service", "workflow", "agent_delegate"] as const;
export const RUNTIME_AUTHORITY_IDENTITY_ERROR_CODES = ["INVALID_TENANT", "INVALID_WORKSPACE", "INVALID_PRINCIPAL", "INVALID_DELEGATION", "INVALID_AGENT", "INVALID_EXECUTION_IDENTITY", "IDENTITY_CHAIN_INCOMPLETE", "TENANT_MISMATCH", "WORKSPACE_MISMATCH", "EXECUTION_IDENTITY_MISMATCH", "EXECUTABLE_VALUE_LEAKAGE", "IDENTITY_SERIALIZATION_FAILED"] as const;

type Metadata = string | number | boolean | null | readonly Metadata[] | { readonly [key: string]: Metadata };
type ErrorCode = (typeof RUNTIME_AUTHORITY_IDENTITY_ERROR_CODES)[number];
export interface AuthorityTenant { readonly tenantId: string; readonly tenantType: "organization"; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface AuthorityWorkspace { readonly workspaceId: string; readonly workspaceType: "workspace"; readonly tenantId: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface AuthorityPrincipal { readonly principalId: string; readonly principalType: (typeof RUNTIME_AUTHORITY_PRINCIPAL_TYPES)[number]; readonly tenantId: string; readonly workspaceId: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface AuthoritySubject { readonly subjectId: string; readonly subjectType: "authority_subject"; readonly principalId: string; readonly tenantId: string; readonly workspaceId: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface AuthorityDelegation { readonly delegationId: string; readonly tenantId: string; readonly workspaceId: string; readonly delegatedByType: "human" | "service" | "workflow"; readonly delegatedById: string; readonly agentId: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface AuthorityAgentIdentity { readonly agentId: string; readonly agentType: "agent"; readonly tenantId: string; readonly workspaceId: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface AuthorityExecutionIdentityBinding { readonly executionIdentity: RuntimeExecutionIdentity; readonly authorityRequestId: string; readonly tenantId: string; readonly workspaceId: string; readonly metadata: Readonly<Record<string, Metadata>>; readonly executable: false; readonly authoritative: false; }
export interface AuthorityIdentityChain { readonly tenant: AuthorityTenant; readonly workspace: AuthorityWorkspace; readonly principal: AuthorityPrincipal; readonly subject: AuthoritySubject; readonly delegations: readonly AuthorityDelegation[]; readonly agent: AuthorityAgentIdentity; readonly execution: AuthorityExecutionIdentityBinding; readonly authorityRequest: RuntimeAuthorityRequest; readonly architectureVersion: typeof RUNTIME_AUTHORITY_IDENTITY_VERSION; readonly executable: false; readonly authoritative: false; }
export interface IdentityBindingValidation { readonly status: "bound" | "invalid"; readonly error?: { readonly code: ErrorCode; readonly message: string; }; readonly executable: false; readonly authoritative: false; }
export interface AuthorityIdentityBindingResult { readonly chain: AuthorityIdentityChain; readonly validation: IdentityBindingValidation; readonly executable: false; readonly authoritative: false; }

function copy(value: unknown, seen = new WeakSet<object>()): Metadata {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (!value || typeof value !== "object" || value instanceof Promise || seen.has(value) || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) throw new TypeError("Authority identity metadata must be serializable inert data.");
  seen.add(value);
  if (Array.isArray(value)) return value.map((entry) => copy(entry, seen));
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copy(entry, seen)]));
}
function inert(value: unknown): value is { readonly executable: false; readonly authoritative: false } { return Boolean(value) && typeof value === "object" && Object.isFrozen(value) && (value as { executable?: unknown }).executable === false && (value as { authoritative?: unknown }).authoritative === false; }
function invalid(code: ErrorCode, message: string): IdentityBindingValidation { return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const }); }

/** Copies an entire declarative chain; no identity source or delegation confers authority. */
export function createAuthorityIdentityChain(input: Omit<AuthorityIdentityChain, "architectureVersion">): AuthorityIdentityChain {
  const copied = copy(input) as unknown as Omit<AuthorityIdentityChain, "architectureVersion">;
  const values = [copied, copied.tenant, copied.workspace, copied.principal, copied.subject, copied.agent, copied.execution, copied.execution.executionIdentity, copied.authorityRequest, copied.authorityRequest.subject, copied.authorityRequest.resource, copied.authorityRequest.action, copied.authorityRequest.context, ...copied.delegations];
  if (values.some((value) => !value || (value as { executable?: unknown }).executable !== false || (value as { authoritative?: unknown }).authoritative !== false) || copied.delegations.length === 0 || !(RUNTIME_AUTHORITY_PRINCIPAL_TYPES as readonly string[]).includes(copied.principal.principalType)) throw new TypeError("Invalid Authority identity chain.");
  return deepFreeze({ ...copied, delegations: copied.delegations.map((delegation) => ({ ...delegation, metadata: delegation.metadata })), tenant: { ...copied.tenant, metadata: copied.tenant.metadata }, workspace: { ...copied.workspace, metadata: copied.workspace.metadata }, principal: { ...copied.principal, metadata: copied.principal.metadata }, subject: { ...copied.subject, metadata: copied.subject.metadata }, agent: { ...copied.agent, metadata: copied.agent.metadata }, execution: { ...copied.execution, executionIdentity: { ...copied.execution.executionIdentity }, metadata: copied.execution.metadata }, authorityRequest: { ...copied.authorityRequest, subject: { ...copied.authorityRequest.subject }, resource: { ...copied.authorityRequest.resource }, action: { ...copied.authorityRequest.action }, context: { ...copied.authorityRequest.context, metadata: copied.authorityRequest.context.metadata } }, architectureVersion: RUNTIME_AUTHORITY_IDENTITY_VERSION, executable: false as const, authoritative: false as const });
}

/** Pure identity consistency validation; a bound chain remains non-authoritative. */
export function validateAuthorityIdentityChain(chain: AuthorityIdentityChain): IdentityBindingValidation {
  const values = [chain, chain.tenant, chain.workspace, chain.principal, chain.subject, chain.agent, chain.execution, chain.execution.executionIdentity, chain.authorityRequest, chain.authorityRequest.subject, chain.authorityRequest.resource, chain.authorityRequest.action, chain.authorityRequest.context, ...chain.delegations];
  if (values.some((value) => !inert(value))) return invalid("EXECUTABLE_VALUE_LEAKAGE", "Identity chain must be immutable inert metadata.");
  try { JSON.stringify(chain); } catch { return invalid("IDENTITY_SERIALIZATION_FAILED", "Identity chain is not serializable."); }
  if (!validText(chain.tenant.tenantId) || chain.tenant.tenantType !== "organization") return invalid("INVALID_TENANT", "Tenant identity is invalid.");
  if (!validText(chain.workspace.workspaceId) || chain.workspace.workspaceType !== "workspace") return invalid("INVALID_WORKSPACE", "Workspace identity is invalid.");
  if (!validText(chain.principal.principalId) || !(RUNTIME_AUTHORITY_PRINCIPAL_TYPES as readonly string[]).includes(chain.principal.principalType)) return invalid("INVALID_PRINCIPAL", "Principal identity is invalid.");
  if (!validText(chain.agent.agentId) || chain.agent.agentType !== "agent" || chain.delegations.length === 0) return invalid(chain.delegations.length === 0 ? "IDENTITY_CHAIN_INCOMPLETE" : "INVALID_AGENT", "Agent identity or delegation metadata is missing.");
  if (!chain.delegations.every((delegation) => validText(delegation.delegationId) && validText(delegation.delegatedById) && delegation.agentId === chain.agent.agentId && ["human", "service", "workflow"].includes(delegation.delegatedByType))) return invalid("INVALID_DELEGATION", "Delegation metadata is invalid.");
  if (![chain.workspace.tenantId, chain.principal.tenantId, chain.subject.tenantId, chain.agent.tenantId, chain.execution.tenantId, chain.authorityRequest.subject.tenantScope, chain.authorityRequest.resource.tenantScope].every((tenantId) => tenantId === chain.tenant.tenantId)) return invalid("TENANT_MISMATCH", "Identity chain crosses tenant scopes.");
  if (![chain.principal.workspaceId, chain.subject.workspaceId, chain.agent.workspaceId, chain.execution.workspaceId, ...chain.delegations.map((delegation) => delegation.workspaceId)].every((workspaceId) => workspaceId === chain.workspace.workspaceId)) return invalid("WORKSPACE_MISMATCH", "Identity chain crosses workspace scopes.");
  if (chain.subject.principalId !== chain.principal.principalId || chain.execution.authorityRequestId !== chain.authorityRequest.requestId || !validText(chain.execution.executionIdentity.executionId) || chain.execution.executionIdentity.targetIdentity !== chain.authorityRequest.resource.resourceId) return invalid("EXECUTION_IDENTITY_MISMATCH", "Execution identity does not bind to the Authority Request.");
  return deepFreeze({ status: "bound" as const, executable: false as const, authoritative: false as const });
}

export function bindAuthorityIdentityChain(chain: AuthorityIdentityChain): AuthorityIdentityBindingResult { return deepFreeze({ chain, validation: validateAuthorityIdentityChain(chain), executable: false as const, authoritative: false as const }); }
