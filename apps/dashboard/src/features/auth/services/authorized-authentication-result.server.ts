import {
  AuthenticationError,
} from "../errors";
import type { TenantContext } from "../tenant/tenant-context";
import type {
  ApplicationSessionAuthority,
  AuthorizedAuthenticationResult,
  CanonicalIdentity,
  ProviderAuthentication,
} from "../types";

export interface AuthorizedAuthenticationResultInput {
  readonly providerAuthentication: ProviderAuthentication;
  readonly canonicalIdentity: CanonicalIdentity;
  readonly applicationSession: ApplicationSessionAuthority;
  readonly tenantContext: TenantContext;
}

function assertServerRuntime(): void {
  if (typeof window !== "undefined") {
    throw new AuthenticationError("AUTH_CONFIG_INVALID");
  }
}

function timestamp(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new AuthenticationError("AUTH_IDENTITY_INTEGRITY_FAILURE");
  }
  return parsed;
}

function assertPositiveVersion(value: number): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new AuthenticationError("AUTH_IDENTITY_INTEGRITY_FAILURE");
  }
}

function assertEqual(values: readonly unknown[]): void {
  if (new Set(values).size !== 1) {
    throw new AuthenticationError("AUTH_IDENTITY_INTEGRITY_FAILURE");
  }
}

export function createAuthorizedAuthenticationResult(
  input: AuthorizedAuthenticationResultInput,
  now: Date = new Date(),
): AuthorizedAuthenticationResult {
  assertServerRuntime();

  const { providerAuthentication, canonicalIdentity, applicationSession, tenantContext } = input;
  assertEqual([
    canonicalIdentity.userId,
    applicationSession.userId,
    tenantContext.userId,
  ]);
  assertEqual([
    canonicalIdentity.authIdentityId,
    applicationSession.authIdentityId,
    tenantContext.authIdentityId,
  ]);
  assertEqual([
    applicationSession.activeTenantId,
    tenantContext.tenantId,
  ]);
  assertEqual([
    applicationSession.activeMembershipId,
    tenantContext.membershipId,
  ]);
  assertEqual([
    applicationSession.membershipVersion,
    tenantContext.membershipVersion,
  ]);
  assertEqual([
    providerAuthentication.assuranceLevel,
    applicationSession.assuranceLevel,
    tenantContext.assuranceLevel,
  ]);
  assertEqual([
    providerAuthentication.mfaVerified,
    applicationSession.mfaVerified,
    tenantContext.mfaVerified,
  ]);
  assertEqual([
    providerAuthentication.authenticatedAt,
    applicationSession.authenticatedAt,
    tenantContext.authenticatedAt,
  ]);
  assertEqual([
    providerAuthentication.provider,
    canonicalIdentity.provider,
    tenantContext.provider,
  ]);
  assertEqual([
    providerAuthentication.issuer,
    canonicalIdentity.issuer,
  ]);
  assertEqual([
    providerAuthentication.subject,
    canonicalIdentity.subject,
  ]);
  assertEqual([
    applicationSession.sessionContextId,
    tenantContext.sessionContextId,
  ]);

  assertPositiveVersion(applicationSession.sessionVersion);
  assertPositiveVersion(applicationSession.membershipVersion);
  assertPositiveVersion(providerAuthentication.providerSessionReferenceDigestVersion);

  const authenticatedAt = timestamp(applicationSession.authenticatedAt);
  const inactivityExpiresAt = timestamp(applicationSession.inactivityExpiresAt);
  const absoluteExpiresAt = timestamp(applicationSession.absoluteExpiresAt);
  const nowValue = now.getTime();
  if (!Number.isFinite(nowValue)) {
    throw new AuthenticationError("AUTH_IDENTITY_INTEGRITY_FAILURE");
  }
  if (
    authenticatedAt > inactivityExpiresAt ||
    inactivityExpiresAt > absoluteExpiresAt
  ) {
    throw new AuthenticationError("AUTH_IDENTITY_INTEGRITY_FAILURE");
  }
  if (nowValue >= inactivityExpiresAt || nowValue >= absoluteExpiresAt) {
    throw new AuthenticationError("AUTH_SESSION_CONTEXT_EXPIRED");
  }

  const frozenProvider = Object.freeze({ ...providerAuthentication });
  const frozenIdentity = Object.freeze({ ...canonicalIdentity });
  const frozenSession = Object.freeze({ ...applicationSession });
  const frozenTenantContext = Object.freeze({
    ...tenantContext,
    permissionSummary: tenantContext.permissionSummary
      ? Object.freeze([...tenantContext.permissionSummary])
      : undefined,
  });

  return Object.freeze({
    status: "authorized" as const,
    providerAuthentication: frozenProvider,
    canonicalIdentity: frozenIdentity,
    applicationSession: frozenSession,
    tenantContext: frozenTenantContext,
  }) as AuthorizedAuthenticationResult;
}
