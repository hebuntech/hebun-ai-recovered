import assert from "node:assert/strict";
import {
  AUTHENTICATION_ENV_KEYS,
  resolveAuthenticationEnvironment,
} from "../../src/features/auth/server";

function main(): void {
  assert.deepEqual(resolveAuthenticationEnvironment({}), {
    status: "disabled",
    enabled: false,
  });

  const invalid = resolveAuthenticationEnvironment({
    HEBUN_AUTH_ENABLED: "true",
  });
  assert.equal(invalid.status, "invalid");
  if (invalid.status === "invalid") {
    assert.deepEqual(invalid.missingKeys, [
      "DATABASE_URL",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "HEBUN_AUTH_SESSION_DIGEST_CURRENT_VERSION",
      "HEBUN_AUTH_SESSION_DIGEST_SECRET",
    ]);
    assert.deepEqual(invalid.invalidKeys, []);
  }

  const configured = resolveAuthenticationEnvironment({
    HEBUN_AUTH_ENABLED: "true",
    DATABASE_URL: "postgresql://localhost/hebun",
    SUPABASE_URL: "https://identity.example.test",
    SUPABASE_ANON_KEY: "publishable-test-key",
    HEBUN_AUTH_SESSION_DIGEST_CURRENT_VERSION: "2",
    HEBUN_AUTH_SESSION_DIGEST_SECRET: "test-only-digest-secret",
    HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_VERSION: "1",
    HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_SECRET: "test-only-previous-secret",
    SUPABASE_SERVICE_ROLE: "must-not-be-consumed",
  });
  assert.equal(configured.status, "configured");
  assert.equal(Object.isFrozen(configured), true);
  assert.equal("serviceRole" in configured, false);
  if (configured.status === "configured") {
    assert.deepEqual(configured.sessionDigestCurrentKey, {
      version: 2,
      secret: "test-only-digest-secret",
    });
    assert.deepEqual(configured.sessionDigestPreviousKey, {
      version: 1,
      secret: "test-only-previous-secret",
    });
    assert.equal(Object.isFrozen(configured.sessionDigestCurrentKey), true);
    assert.equal(Object.isFrozen(configured.sessionDigestPreviousKey), true);
  }
  assert.equal(
    new Set<string>(Object.values(AUTHENTICATION_ENV_KEYS)).has(
      "SUPABASE_SERVICE_ROLE",
    ),
    false,
  );

  const partialRotation = resolveAuthenticationEnvironment({
    HEBUN_AUTH_ENABLED: "true",
    DATABASE_URL: "postgresql://localhost/hebun",
    SUPABASE_URL: "https://identity.example.test",
    SUPABASE_ANON_KEY: "publishable-test-key",
    HEBUN_AUTH_SESSION_DIGEST_CURRENT_VERSION: "2",
    HEBUN_AUTH_SESSION_DIGEST_SECRET: "test-only-digest-secret",
    HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_VERSION: "1",
  });
  assert.deepEqual(partialRotation, {
    status: "invalid",
    enabled: true,
    missingKeys: [],
    invalidKeys: ["HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_SECRET"],
  });

  const duplicateVersion = resolveAuthenticationEnvironment({
    HEBUN_AUTH_ENABLED: "true",
    DATABASE_URL: "postgresql://localhost/hebun",
    SUPABASE_URL: "https://identity.example.test",
    SUPABASE_ANON_KEY: "publishable-test-key",
    HEBUN_AUTH_SESSION_DIGEST_CURRENT_VERSION: "2",
    HEBUN_AUTH_SESSION_DIGEST_SECRET: "test-only-digest-secret",
    HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_VERSION: "2",
    HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_SECRET: "test-only-previous-secret",
  });
  assert.equal(duplicateVersion.status, "invalid");
  if (duplicateVersion.status === "invalid") {
    assert.deepEqual(duplicateVersion.invalidKeys, [
      "HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_VERSION",
    ]);
  }

  console.log("authentication environment checks passed");
}

main();
