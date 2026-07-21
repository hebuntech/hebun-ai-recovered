export type AuthenticationProviderKey = string;

export type AuthenticationAssuranceLevel = "aal1" | "aal2" | "aal3";

/** Token-free evidence produced after a provider validates its own session. */
export interface ProviderAuthentication {
  readonly provider: AuthenticationProviderKey;
  readonly issuer: string;
  readonly subject: string;
  readonly verifiedEmail?: string;
  readonly authenticatedAt: string;
  readonly assuranceLevel: AuthenticationAssuranceLevel;
  readonly mfaVerified: boolean;
  readonly providerSessionReferenceHash: string;
  readonly providerSessionReferenceDigestVersion: number;
}
