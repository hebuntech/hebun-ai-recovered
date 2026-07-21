import type {
  AuthenticationAssuranceLevel,
  AuthenticationProviderKey,
} from "../types/provider-authentication";

/** Immutable authority projection for one server request. */
export interface TenantContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly authIdentityId: string;
  readonly membershipId: string;
  readonly membershipVersion: number;
  readonly roleId: string;
  readonly organizationId?: string;
  readonly sessionContextId: string;
  readonly provider: AuthenticationProviderKey;
  readonly assuranceLevel: AuthenticationAssuranceLevel;
  readonly mfaVerified: boolean;
  readonly requestId: string;
  readonly correlationId?: string;
  readonly permissionSummary?: readonly string[];
  readonly authenticatedAt: string;
}
