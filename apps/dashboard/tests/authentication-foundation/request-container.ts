import assert from "node:assert/strict";
import type { AuthenticationService } from "../../src/features/auth";
import { createRequestAuthenticationContainer } from "../../src/features/auth/server";

const service: AuthenticationService = {
  async authenticate(request, context) {
    assert.deepEqual(request, { requestedTenantId: "tenant-id" });
    assert.deepEqual(context, {
      requestId: "request-id",
      correlationId: "correlation-id",
    });
    return { status: "unauthenticated", reason: "missing" };
  },
};

async function main(): Promise<void> {
  const container = createRequestAuthenticationContainer({
    requestId: "  request-id  ",
    correlationId: "  correlation-id  ",
    authenticationService: service,
  });

  assert.equal(container.scope, "request");
  assert.equal(container.requestId, "request-id");
  assert.equal(container.correlationId, "correlation-id");
  assert.equal(Object.isFrozen(container), true);
  assert.equal("authenticationService" in container, false);
  assert.deepEqual(await container.authenticate({
    requestedTenantId: "tenant-id",
  }), { status: "unauthenticated", reason: "missing" });

  assert.throws(
    () => createRequestAuthenticationContainer({
      requestId: "  ",
      authenticationService: service,
    }),
    /requestId must not be empty/,
  );

  console.log("request authentication container checks passed");
}

void main();
