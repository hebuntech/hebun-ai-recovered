export type AuthenticationErrorCategory =
  | "provider"
  | "identity"
  | "membership"
  | "tenant"
  | "session"
  | "configuration"
  | "security"
  | "operational";

export type AuthenticationErrorCode =
  | "AUTH_DISABLED"
  | "AUTH_CONFIG_MISSING"
  | "AUTH_CONFIG_INVALID"
  | "AUTH_PROVIDER_SESSION_MISSING"
  | "AUTH_PROVIDER_SESSION_INVALID"
  | "AUTH_PROVIDER_SESSION_EXPIRED"
  | "AUTH_PROVIDER_UNAVAILABLE"
  | "AUTH_IDENTITY_NOT_FOUND"
  | "AUTH_IDENTITY_PENDING"
  | "AUTH_IDENTITY_SUSPENDED"
  | "AUTH_IDENTITY_REVOKED"
  | "AUTH_IDENTITY_INTEGRITY_FAILURE"
  | "AUTH_USER_DISABLED"
  | "AUTH_NO_ELIGIBLE_MEMBERSHIP"
  | "AUTH_TENANT_SELECTION_REQUIRED"
  | "AUTH_MEMBERSHIP_REVOKED"
  | "AUTH_MEMBERSHIP_VERSION_MISMATCH"
  | "AUTH_ROLE_MISSING"
  | "AUTH_TENANT_INVALID"
  | "AUTH_TENANT_INACTIVE"
  | "AUTH_TENANT_AUTHENTICATION_DISABLED"
  | "AUTH_SESSION_CONTEXT_MISSING"
  | "AUTH_SESSION_CONTEXT_EXPIRED"
  | "AUTH_SESSION_CONTEXT_REVOKED"
  | "AUTH_SESSION_CONFLICT"
  | "AUTH_INVITATION_INVALID"
  | "AUTH_INVITATION_REPLAY"
  | "AUTH_ORIGIN_INVALID"
  | "AUTH_ASSURANCE_INSUFFICIENT"
  | "AUTH_DATABASE_UNAVAILABLE"
  | "AUTH_TRANSACTION_FAILED"
  | "AUTH_OPERATION_TIMEOUT";

export interface AuthenticationErrorDescriptor {
  readonly category: AuthenticationErrorCategory;
  readonly httpStatus: 401 | 403 | 409 | 503;
  readonly retryable: boolean;
  readonly auditSeverity: "info" | "warning" | "critical";
  readonly safeMessage: string;
}

const descriptor = (
  category: AuthenticationErrorCategory,
  httpStatus: AuthenticationErrorDescriptor["httpStatus"],
  retryable: boolean,
  auditSeverity: AuthenticationErrorDescriptor["auditSeverity"],
  safeMessage: string,
): AuthenticationErrorDescriptor =>
  Object.freeze({
    category,
    httpStatus,
    retryable,
    auditSeverity,
    safeMessage,
  });

export const AUTHENTICATION_ERROR_DESCRIPTORS: Readonly<
  Record<AuthenticationErrorCode, AuthenticationErrorDescriptor>
> = Object.freeze({
  AUTH_DISABLED: descriptor("configuration", 503, false, "info", "Authentication is not available."),
  AUTH_CONFIG_MISSING: descriptor("configuration", 503, false, "critical", "Authentication is not available."),
  AUTH_CONFIG_INVALID: descriptor("configuration", 503, false, "critical", "Authentication is not available."),
  AUTH_PROVIDER_SESSION_MISSING: descriptor("provider", 401, true, "info", "Authentication is required."),
  AUTH_PROVIDER_SESSION_INVALID: descriptor("provider", 401, true, "warning", "The authentication session is invalid."),
  AUTH_PROVIDER_SESSION_EXPIRED: descriptor("provider", 401, true, "info", "The authentication session has expired."),
  AUTH_PROVIDER_UNAVAILABLE: descriptor("provider", 503, true, "warning", "Authentication is temporarily unavailable."),
  AUTH_IDENTITY_NOT_FOUND: descriptor("identity", 409, false, "info", "Account onboarding is required."),
  AUTH_IDENTITY_PENDING: descriptor("identity", 409, false, "info", "Account onboarding is incomplete."),
  AUTH_IDENTITY_SUSPENDED: descriptor("identity", 403, false, "warning", "Access is not permitted."),
  AUTH_IDENTITY_REVOKED: descriptor("identity", 403, false, "critical", "Access is not permitted."),
  AUTH_IDENTITY_INTEGRITY_FAILURE: descriptor("identity", 503, false, "critical", "Authentication could not be completed."),
  AUTH_USER_DISABLED: descriptor("identity", 403, false, "warning", "Access is not permitted."),
  AUTH_NO_ELIGIBLE_MEMBERSHIP: descriptor("membership", 403, false, "warning", "No eligible organization membership is available."),
  AUTH_TENANT_SELECTION_REQUIRED: descriptor("membership", 409, true, "info", "An organization must be selected."),
  AUTH_MEMBERSHIP_REVOKED: descriptor("membership", 403, false, "critical", "Access is not permitted."),
  AUTH_MEMBERSHIP_VERSION_MISMATCH: descriptor("membership", 403, true, "warning", "Access authority has changed."),
  AUTH_ROLE_MISSING: descriptor("membership", 403, false, "critical", "Access is not permitted."),
  AUTH_TENANT_INVALID: descriptor("tenant", 403, false, "warning", "The organization is not available."),
  AUTH_TENANT_INACTIVE: descriptor("tenant", 403, false, "warning", "The organization is not active."),
  AUTH_TENANT_AUTHENTICATION_DISABLED: descriptor("tenant", 403, false, "warning", "Authentication is disabled for this organization."),
  AUTH_SESSION_CONTEXT_MISSING: descriptor("session", 401, true, "warning", "Authentication is required."),
  AUTH_SESSION_CONTEXT_EXPIRED: descriptor("session", 401, true, "info", "The application session has expired."),
  AUTH_SESSION_CONTEXT_REVOKED: descriptor("session", 401, true, "critical", "The application session is no longer active."),
  AUTH_SESSION_CONFLICT: descriptor("session", 409, true, "warning", "The application session has changed."),
  AUTH_INVITATION_INVALID: descriptor("security", 403, false, "warning", "The invitation is invalid."),
  AUTH_INVITATION_REPLAY: descriptor("security", 409, false, "critical", "The invitation has already been used."),
  AUTH_ORIGIN_INVALID: descriptor("security", 403, false, "critical", "The request is not permitted."),
  AUTH_ASSURANCE_INSUFFICIENT: descriptor("security", 403, true, "warning", "Additional authentication is required."),
  AUTH_DATABASE_UNAVAILABLE: descriptor("operational", 503, true, "critical", "Authentication is temporarily unavailable."),
  AUTH_TRANSACTION_FAILED: descriptor("operational", 503, true, "critical", "Authentication could not be completed."),
  AUTH_OPERATION_TIMEOUT: descriptor("operational", 503, true, "warning", "Authentication is temporarily unavailable."),
});

export class AuthenticationError extends Error {
  readonly descriptor: AuthenticationErrorDescriptor;

  constructor(
    readonly code: AuthenticationErrorCode,
    options?: { readonly cause?: unknown },
  ) {
    const errorDescriptor = AUTHENTICATION_ERROR_DESCRIPTORS[code];
    super(errorDescriptor.safeMessage, options);
    this.name = "AuthenticationError";
    this.descriptor = errorDescriptor;
  }
}
