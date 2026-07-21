import type { AuthenticationAssuranceLevel } from "./provider-authentication";

export interface ApplicationSessionAuthority {
  readonly sessionContextId: string;
  readonly sessionVersion: number;
  readonly authIdentityId: string;
  readonly userId: string;
  readonly activeTenantId: string;
  readonly activeMembershipId: string;
  readonly membershipVersion: number;
  readonly assuranceLevel: AuthenticationAssuranceLevel;
  readonly mfaVerified: boolean;
  readonly authenticatedAt: string;
  readonly absoluteExpiresAt: string;
  readonly inactivityExpiresAt: string;
}
