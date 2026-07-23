import assert from "node:assert/strict";
import { createRuntimeRecoveryPlan, validateRuntimeRecoveryPlan } from "../../src/features/director-command";
function plan(overrides = {}) { return createRuntimeRecoveryPlan({ executionId: "execution-4c7", logicalId: "logical-4c7", targetId: "target-4c7", outcome: "failed" as const, failure: "transient" as const, eligibility: "authority_required" as const, strategy: "retry" as const, compensation: "none" as const, rollback: "none" as const, manualIntervention: { required: false, reasonCode: "retry-metadata", operatorRole: "director", escalationClass: "none", instructions: ["No action is performed."], acknowledgmentRequired: false }, terminality: "non_terminal" as const, executable: false as const, authoritative: false as const, ...overrides } as never); }
const retry = plan(); assert.equal(Object.isFrozen(retry), true); assert.equal(Object.isFrozen(retry.manualIntervention.instructions), true); assert.equal(validateRuntimeRecoveryPlan(retry).status, "authority_required");
assert.equal(validateRuntimeRecoveryPlan(plan({ outcome: "completed", strategy: "none" })).status, "not_required");
assert.equal(validateRuntimeRecoveryPlan(plan({ outcome: "blocked", failure: "policy_blocked", strategy: "none" })).status, "blocked");
assert.equal(validateRuntimeRecoveryPlan(plan({ failure: "non_recoverable", strategy: "retry" })).status, "invalid");
assert.equal(validateRuntimeRecoveryPlan(plan({ strategy: "manual_recovery", manualIntervention: { ...retry.manualIntervention, required: true } })).status, "manual_intervention_required");
assert.equal(validateRuntimeRecoveryPlan(plan({ strategy: "compensate", compensation: "transactional_reversal", rollback: "none" })).status, "invalid");
assert.throws(() => createRuntimeRecoveryPlan({ ...retry, manualIntervention: { ...retry.manualIntervention, callback: () => undefined } } as never));
assert.throws(() => { (retry as unknown as { executable: boolean }).executable = true; });
console.log("runtime recovery checks passed");
