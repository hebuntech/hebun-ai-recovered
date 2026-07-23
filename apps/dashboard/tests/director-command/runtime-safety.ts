import assert from "node:assert/strict";
import { createRuntimeSafetyPolicy, validateRuntimeSafetyPolicy } from "../../src/features/director-command";
const policy = createRuntimeSafetyPolicy({ classification: "elevated", cancellation: "cancellable", rollback: "manual_recovery" });
assert.equal(Object.isFrozen(policy), true); assert.equal(Object.isFrozen(policy.failClosed), true);
assert.equal(validateRuntimeSafetyPolicy(policy).readiness, "authority_required");
assert.equal(validateRuntimeSafetyPolicy(Object.freeze({ ...policy, rollback: "bad" as never })).status, "invalid");
assert.throws(() => { (policy as unknown as { executable: boolean }).executable = true; });
console.log("runtime safety checks passed");
