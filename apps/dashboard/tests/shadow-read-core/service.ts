import assert from "node:assert/strict";
import {
  deriveShadowMatchStatus,
  deriveShadowPresenceStatus,
} from "../../src/features/shadow-read-core";

async function main() {
  assert.equal(
    deriveShadowPresenceStatus({ memoryFound: true, postgresFound: true }),
    null,
  );
  assert.equal(
    deriveShadowPresenceStatus({ memoryFound: true, postgresFound: false }),
    "memory-only",
  );
  assert.equal(
    deriveShadowPresenceStatus({ memoryFound: false, postgresFound: true }),
    "postgres-only",
  );
  assert.equal(
    deriveShadowPresenceStatus({ memoryFound: false, postgresFound: false }),
    "not-found",
  );

  assert.equal(
    deriveShadowMatchStatus({
      mismatches: [{ status: "mismatch" }],
      nonComparableFields: [],
      missingFields: [],
    }),
    "mismatch",
  );
  assert.equal(
    deriveShadowMatchStatus({
      mismatches: [],
      nonComparableFields: [{ status: "non-comparable" }],
      missingFields: [],
    }),
    "partial-match",
  );
  assert.equal(
    deriveShadowMatchStatus({
      mismatches: [],
      nonComparableFields: [],
      missingFields: [],
    }),
    "matched",
  );

  console.log("shadow-read-core service checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
