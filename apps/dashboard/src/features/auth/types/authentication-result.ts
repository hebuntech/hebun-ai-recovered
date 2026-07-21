import type { TenantContext } from "../tenant/tenant-context";
import type { ApplicationSessionAuthority } from "./application-session";
import type { CanonicalIdentity } from "./canonical-identity";
import type { ProviderAuthentication } from "./provider-authentication";

declare const authorizedAuthenticationResult: unique symbol;

export interface AuthorizedAuthenticationResult {
  readonly [authorizedAuthenticationResult]: true;
  readonly status: "authorized";
  readonly providerAuthentication: ProviderAuthentication;
  readonly canonicalIdentity: CanonicalIdentity;
  readonly applicationSession: ApplicationSessionAuthority;
  readonly tenantContext: TenantContext;
}

export interface UnauthenticatedAuthenticationResult {
  readonly status: "unauthenticated";
  readonly reason: "missing" | "invalid" | "expired";
}

export interface OnboardingRequiredAuthenticationResult {
  readonly status: "onboarding-required";
  readonly providerAuthentication: ProviderAuthentication;
}

export interface TenantSelectionRequiredAuthenticationResult {
  readonly status: "tenant-selection-required";
  readonly canonicalIdentity: CanonicalIdentity;
  readonly eligibleTenantIds: readonly string[];
}

export interface ForbiddenAuthenticationResult {
  readonly status: "forbidden";
  readonly reason:
    | "identity"
    | "user"
    | "membership"
    | "tenant"
    | "session"
    | "assurance";
}

export type AuthenticationResult =
  | AuthorizedAuthenticationResult
  | UnauthenticatedAuthenticationResult
  | OnboardingRequiredAuthenticationResult
  | TenantSelectionRequiredAuthenticationResult
  | ForbiddenAuthenticationResult;
