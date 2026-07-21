import type { AuthenticationProviderKey } from "./provider-authentication";

export interface CanonicalIdentity {
  readonly authIdentityId: string;
  readonly userId: string;
  readonly provider: AuthenticationProviderKey;
  readonly issuer: string;
  readonly subject: string;
  readonly identityStatus: "active";
  readonly userLifecycleStatus: "active";
}
