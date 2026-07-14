import assert from "node:assert/strict";
import { createCanonicalReadServices } from "../../src/features/canonical-read";

async function main(): Promise<void> {
  const missing = createCanonicalReadServices({ connectionString: undefined });
  const missingAvailability = await missing.availability();
  assert.equal(missingAvailability.available, false);
  assert.equal(missingAvailability.configured, false);
  assert.equal(missingAvailability.reason, "missing_database_url");
  await missing.dispose();

  const remote = createCanonicalReadServices({
    connectionString: "postgresql://reader@example.com:5432/hebun_read",
  });
  const remoteAvailability = await remote.availability();
  assert.equal(remoteAvailability.available, false);
  assert.equal(remoteAvailability.reason, "disallowed_target");

  const unresolvedSystem = await remote.resolveActor({
    tenantId: "tenant-1",
    actorType: "system",
    actorId: "system-1",
  });
  assert.equal(unresolvedSystem.status, "unavailable");
  await remote.dispose();

  const allowedRemote = createCanonicalReadServices({
    connectionString: "postgresql://reader@example.com:5432/hebun_read",
    allowRemote: true,
  });
  const allowedRemoteAvailability = allowedRemote["availability"];
  assert.equal(typeof allowedRemoteAvailability, "function");
  await allowedRemote.dispose();

  console.log("canonical-read unit checks passed");
}

void main();
