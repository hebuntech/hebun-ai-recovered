import assert from "node:assert/strict";
import {
  AUTHENTICATION_ERROR_DESCRIPTORS,
  AuthenticationError,
  type AuthenticationErrorCode,
} from "../../src/features/auth";

const expectedCodes: readonly AuthenticationErrorCode[] = [
  "AUTH_DISABLED",
  "AUTH_CONFIG_MISSING",
  "AUTH_CONFIG_INVALID",
  "AUTH_PROVIDER_SESSION_MISSING",
  "AUTH_PROVIDER_SESSION_INVALID",
  "AUTH_PROVIDER_SESSION_EXPIRED",
  "AUTH_PROVIDER_UNAVAILABLE",
  "AUTH_IDENTITY_NOT_FOUND",
  "AUTH_IDENTITY_PENDING",
  "AUTH_IDENTITY_SUSPENDED",
  "AUTH_IDENTITY_REVOKED",
  "AUTH_IDENTITY_INTEGRITY_FAILURE",
  "AUTH_USER_DISABLED",
  "AUTH_NO_ELIGIBLE_MEMBERSHIP",
  "AUTH_TENANT_SELECTION_REQUIRED",
  "AUTH_MEMBERSHIP_REVOKED",
  "AUTH_MEMBERSHIP_VERSION_MISMATCH",
  "AUTH_ROLE_MISSING",
  "AUTH_TENANT_INVALID",
  "AUTH_TENANT_INACTIVE",
  "AUTH_TENANT_AUTHENTICATION_DISABLED",
  "AUTH_SESSION_CONTEXT_MISSING",
  "AUTH_SESSION_CONTEXT_EXPIRED",
  "AUTH_SESSION_CONTEXT_REVOKED",
  "AUTH_SESSION_CONFLICT",
  "AUTH_INVITATION_INVALID",
  "AUTH_INVITATION_REPLAY",
  "AUTH_ORIGIN_INVALID",
  "AUTH_ASSURANCE_INSUFFICIENT",
  "AUTH_DATABASE_UNAVAILABLE",
  "AUTH_TRANSACTION_FAILED",
  "AUTH_OPERATION_TIMEOUT",
];

function main(): void {
  assert.deepEqual(Object.keys(AUTHENTICATION_ERROR_DESCRIPTORS), expectedCodes);
  assert.equal(Object.isFrozen(AUTHENTICATION_ERROR_DESCRIPTORS), true);

  for (const code of expectedCodes) {
    const error = new AuthenticationError(code, {
      cause: new Error("private provider detail"),
    });
    assert.equal(error.name, "AuthenticationError");
    assert.equal(error.code, code);
    assert.equal(error.message, error.descriptor.safeMessage);
    assert.match(error.message, /^(?!.*private provider detail)/);
    assert.ok([401, 403, 409, 503].includes(error.descriptor.httpStatus));
    assert.equal(Object.isFrozen(error.descriptor), true);
  }

  assert.equal(
    AUTHENTICATION_ERROR_DESCRIPTORS.AUTH_PROVIDER_SESSION_MISSING.httpStatus,
    401,
  );
  assert.equal(
    AUTHENTICATION_ERROR_DESCRIPTORS.AUTH_IDENTITY_REVOKED.retryable,
    false,
  );
  assert.equal(
    AUTHENTICATION_ERROR_DESCRIPTORS.AUTH_DATABASE_UNAVAILABLE.retryable,
    true,
  );

  console.log("authentication error checks passed");
}

main();
