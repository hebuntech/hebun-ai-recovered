import assert from "node:assert/strict";
import {
  createRuntimeCompensationPlan,
  createRuntimeRetryPolicy,
  deriveRetryEligibility,
  RUNTIME_COMPENSATION_STATUSES,
  RUNTIME_COMPENSATION_STEP_KINDS,
  RUNTIME_RECOVERY_CLASSES,
  RUNTIME_RETRY_BACKOFF_STRATEGIES,
  RUNTIME_RETRY_COMPENSATION_VERSION,
  RUNTIME_RETRY_ELIGIBILITY_REASONS,
  validateRuntimeCompensationPlan,
  validateRuntimeRetryPolicy,
  type RuntimeCompensationPlan,
  type RuntimeRetryPolicy,
} from "../../src/features/director-command";

const inert = { executable: false as const, authoritative: false as const };

function limits(overrides: Record<string, unknown> = {}) {
  return { maxAttempts: 3, attemptsMade: 1, attemptsRemaining: 2, maxTotalDurationMs: 60_000, ...inert, ...overrides };
}
function backoff(overrides: Record<string, unknown> = {}) {
  return { strategy: "EXPONENTIAL" as const, baseDelayMs: 100, maxDelayMs: 5_000, multiplier: 2, jitter: true, descriptorId: "bo-1", ...inert, ...overrides };
}
function attempt(overrides: Record<string, unknown> = {}) {
  return { attemptNumber: 1, observedStatus: "FAILED" as const, recordedAt: "2026-01-01T00:00:00Z", resultReference: "r-1", ...inert, ...overrides };
}
function policyInput(overrides: Record<string, unknown> = {}): Omit<RuntimeRetryPolicy, "architectureVersion"> {
  const eligibility = deriveRetryEligibility({
    observedStatus: "FAILED", retryableStatuses: ["FAILED", "TIMEOUT"],
    permissionGranted: true, attemptsRemaining: 2, requiresManualApproval: false,
  });
  return {
    policyId: "p-1", executionId: "e-1", correlationId: "c-1",
    observedStatus: "FAILED", retryableStatuses: ["FAILED", "TIMEOUT"], permissionGranted: true,
    limits: limits(), backoff: backoff(), attempts: [attempt()], eligibility, ...inert, ...overrides,
  } as Omit<RuntimeRetryPolicy, "architectureVersion">;
}
function reference(overrides: Record<string, unknown> = {}) {
  return { executionId: "e-1", correlationId: "c-1", targetId: "t-1", resultReference: "r-1", ...inert, ...overrides };
}
function step(overrides: Record<string, unknown> = {}) {
  return { stepId: "s-1", order: 0, kind: "rollback" as const, description: "Undo the write.", required: true, reference: reference(), ...inert, ...overrides };
}
function planInput(overrides: Record<string, unknown> = {}): Omit<RuntimeCompensationPlan, "architectureVersion"> {
  return {
    planId: "cp-1", executionId: "e-1", correlationId: "c-1", status: "PLANNED" as const,
    steps: [step()], recovery: { recoveryClass: "compensation-only" as const, rationale: "The write failed.", requiresManualApproval: false, ...inert },
    ...inert, ...overrides,
  } as Omit<RuntimeCompensationPlan, "architectureVersion">;
}

/* ── Retry policy construction ─────────────────────────────────── */
function retryPolicyConstruction(): void {
  const policy = createRuntimeRetryPolicy(policyInput());
  assert.equal(policy.architectureVersion, RUNTIME_RETRY_COMPENSATION_VERSION);
  assert.equal(policy.executable, false);
  assert.equal(policy.authoritative, false);
  assert.equal(validateRuntimeRetryPolicy(policy).status, "valid");
}

/* ── Retry eligibility ─────────────────────────────────────────── */
function retryEligibility(): void {
  const allowed = deriveRetryEligibility({ observedStatus: "FAILED", retryableStatuses: ["FAILED"], permissionGranted: true, attemptsRemaining: 2, requiresManualApproval: false });
  assert.equal(allowed.reason, "RETRY_ALLOWED");
  assert.equal(allowed.retryable, true);

  assert.equal(deriveRetryEligibility({ observedStatus: "FAILED", retryableStatuses: ["FAILED"], permissionGranted: false, attemptsRemaining: 2, requiresManualApproval: false }).reason, "PERMISSION_DENIED");
  assert.equal(deriveRetryEligibility({ observedStatus: "SUCCESS", retryableStatuses: ["FAILED"], permissionGranted: true, attemptsRemaining: 2, requiresManualApproval: false }).reason, "NON_RETRYABLE_FAILURE");
  assert.equal(deriveRetryEligibility({ observedStatus: "FAILED", retryableStatuses: ["FAILED"], permissionGranted: true, attemptsRemaining: 0, requiresManualApproval: false }).reason, "MAX_ATTEMPTS_REACHED");
  assert.equal(deriveRetryEligibility({ observedStatus: "FAILED", retryableStatuses: ["FAILED"], permissionGranted: true, attemptsRemaining: 2, requiresManualApproval: true }).reason, "MANUAL_APPROVAL_REQUIRED");
  // Order: permission is judged before failure retryability.
  assert.equal(deriveRetryEligibility({ observedStatus: "SUCCESS", retryableStatuses: ["FAILED"], permissionGranted: false, attemptsRemaining: 2, requiresManualApproval: false }).reason, "PERMISSION_DENIED");
  // Every reason is a canonical vocabulary member.
  for (const reason of RUNTIME_RETRY_ELIGIBILITY_REASONS) assert.equal(typeof reason, "string");
  // A non-retryable eligibility must not be flagged retryable.
  assert.equal(allowed.retryable && deriveRetryEligibility({ observedStatus: "SUCCESS", retryableStatuses: ["FAILED"], permissionGranted: true, attemptsRemaining: 2, requiresManualApproval: false }).retryable, false);
}

/* ── Retry limits ──────────────────────────────────────────────── */
function retryLimits(): void {
  assert.equal(validateRuntimeRetryPolicy(createRuntimeRetryPolicy(policyInput())).status, "valid");
  for (const bad of [
    limits({ maxAttempts: 0 }),
    limits({ maxAttempts: 2.5 }),
    limits({ attemptsRemaining: -1 }),
    limits({ maxTotalDurationMs: -1 }),
    limits({ attemptsMade: 3, attemptsRemaining: 3 }), // 3 + 3 > maxAttempts 3
  ]) {
    const result = validateRuntimeRetryPolicy(createRuntimeRetryPolicy(policyInput({
      limits: bad,
      eligibility: deriveRetryEligibility({ observedStatus: "FAILED", retryableStatuses: ["FAILED", "TIMEOUT"], permissionGranted: true, attemptsRemaining: (bad as { attemptsRemaining: number }).attemptsRemaining, requiresManualApproval: false }),
    })));
    assert.equal(result.status, "invalid");
    assert.equal(result.error?.code, "INVALID_RETRY_LIMIT");
  }
}

/* ── Retry attempts ────────────────────────────────────────────── */
function retryAttempts(): void {
  for (const bad of [
    attempt({ attemptNumber: 0 }),
    attempt({ attemptNumber: 1.5 }),
    attempt({ recordedAt: "" }),
    attempt({ resultReference: "  " }),
    attempt({ observedStatus: "NOT_A_STATUS" }),
  ]) {
    const result = validateRuntimeRetryPolicy(createRuntimeRetryPolicy(policyInput({ attempts: [bad] })));
    assert.equal(result.status, "invalid");
    assert.equal(result.error?.code, "INVALID_RETRY_ATTEMPT");
  }
  // Attempts recorded cannot exceed the attempt count.
  const tooMany = validateRuntimeRetryPolicy(createRuntimeRetryPolicy(policyInput({
    limits: limits({ attemptsMade: 1, attemptsRemaining: 2 }),
    attempts: [attempt({ attemptNumber: 1 }), attempt({ attemptNumber: 2, stepId: "x" })],
  })));
  assert.equal(tooMany.error?.code, "INVALID_RETRY_ATTEMPT");
  // An empty attempt list is valid.
  assert.equal(validateRuntimeRetryPolicy(createRuntimeRetryPolicy(policyInput({ limits: limits({ attemptsMade: 0, attemptsRemaining: 2 }), attempts: [], eligibility: deriveRetryEligibility({ observedStatus: "FAILED", retryableStatuses: ["FAILED", "TIMEOUT"], permissionGranted: true, attemptsRemaining: 2, requiresManualApproval: false }) }))).status, "valid");
}

/* ── Backoff descriptors ───────────────────────────────────────── */
function backoffDescriptors(): void {
  for (const strategy of RUNTIME_RETRY_BACKOFF_STRATEGIES) {
    assert.equal(validateRuntimeRetryPolicy(createRuntimeRetryPolicy(policyInput({ backoff: backoff({ strategy }) }))).status, "valid");
  }
  for (const bad of [
    backoff({ strategy: "SPIN" }),
    backoff({ descriptorId: "" }),
    backoff({ baseDelayMs: -1 }),
    backoff({ maxDelayMs: 50, baseDelayMs: 100 }), // max < base
    backoff({ multiplier: -1 }),
    backoff({ jitter: "yes" }),
  ]) {
    const result = validateRuntimeRetryPolicy(createRuntimeRetryPolicy(policyInput({ backoff: bad })));
    assert.equal(result.status, "invalid");
    assert.equal(result.error?.code, "INVALID_BACKOFF_DESCRIPTOR");
  }
}

/* ── Eligibility consistency ───────────────────────────────────── */
function eligibilityConsistency(): void {
  // A policy whose eligibility disagrees with its inputs is rejected.
  const forged = createRuntimeRetryPolicy(policyInput({
    permissionGranted: false,
    eligibility: deriveRetryEligibility({ observedStatus: "FAILED", retryableStatuses: ["FAILED", "TIMEOUT"], permissionGranted: true, attemptsRemaining: 2, requiresManualApproval: false }),
  }));
  const result = validateRuntimeRetryPolicy(forged);
  assert.equal(result.status, "invalid");
  assert.equal(result.error?.code, "INVALID_RETRY_ELIGIBILITY");
}

/* ── Compensation plan ─────────────────────────────────────────── */
function compensationPlan(): void {
  const plan = createRuntimeCompensationPlan(planInput());
  assert.equal(plan.architectureVersion, RUNTIME_RETRY_COMPENSATION_VERSION);
  assert.equal(validateRuntimeCompensationPlan(plan).status, "valid");
  // A NOT_REQUIRED plan with no steps is valid.
  assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ status: "NOT_REQUIRED", steps: [] }))).status, "valid");
  // A PLANNED plan with no steps is not.
  assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ steps: [] }))).error?.code, "INVALID_COMPENSATION_PLAN");
  // Manual recovery must require approval.
  assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ recovery: { recoveryClass: "manual-recovery", rationale: "Needs a human.", requiresManualApproval: false, ...inert } }))).error?.code, "INVALID_RECOVERY_METADATA");
}

/* ── Compensation steps ────────────────────────────────────────── */
function compensationSteps(): void {
  for (const kind of RUNTIME_COMPENSATION_STEP_KINDS) {
    assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ steps: [step({ kind })] }))).status, "valid");
  }
  for (const bad of [
    step({ stepId: "" }),
    step({ order: -1 }),
    step({ order: 1.5 }),
    step({ kind: "explode" }),
    step({ description: "  " }),
    step({ required: "yes" }),
  ]) {
    assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ steps: [bad] }))).error?.code, "INVALID_COMPENSATION_STEP");
  }
  // Duplicate step order is rejected.
  assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ steps: [step({ stepId: "a", order: 0 }), step({ stepId: "b", order: 0 })] }))).error?.code, "INVALID_COMPENSATION_STEP");
}

/* ── References ────────────────────────────────────────────────── */
function references(): void {
  assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ steps: [step({ reference: reference({ targetId: "" }) })] }))).error?.code, "INVALID_REFERENCE");
  // A reference must be consistent with its plan's execution/correlation ids.
  assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ steps: [step({ reference: reference({ executionId: "other" }) })] }))).error?.code, "INVALID_REFERENCE");
}

/* ── Metadata / vocabulary ─────────────────────────────────────── */
function metadata(): void {
  assert.deepEqual([...RUNTIME_COMPENSATION_STATUSES], ["NOT_REQUIRED", "PLANNED", "MANUAL_REQUIRED", "BLOCKED", "SUPERSEDED"]);
  assert.deepEqual([...RUNTIME_RECOVERY_CLASSES], ["none", "automatic-retry", "manual-recovery", "compensation-only"]);
  assert.equal(validateRuntimeCompensationPlan(createRuntimeCompensationPlan(planInput({ status: "NOPE" as never, steps: [] }))).error?.code, "INVALID_COMPENSATION_PLAN");
}

/* ── Immutability ──────────────────────────────────────────────── */
function immutability(): void {
  const policy = createRuntimeRetryPolicy(policyInput());
  assert.equal(Object.isFrozen(policy), true);
  assert.equal(Object.isFrozen(policy.limits), true);
  assert.equal(Object.isFrozen(policy.backoff), true);
  assert.equal(Object.isFrozen(policy.attempts), true);
  assert.equal(Object.isFrozen(policy.attempts[0]), true);
  assert.equal(Object.isFrozen(policy.eligibility), true);
  assert.throws(() => { (policy as unknown as { policyId: string }).policyId = "x"; });
  assert.throws(() => { (policy.limits as unknown as { maxAttempts: number }).maxAttempts = 99; });
  assert.throws(() => { (policy.attempts as unknown as { push: (v: unknown) => void }).push({}); });

  const plan = createRuntimeCompensationPlan(planInput());
  assert.equal(Object.isFrozen(plan), true);
  assert.equal(Object.isFrozen(plan.steps), true);
  assert.equal(Object.isFrozen(plan.steps[0]), true);
  assert.equal(Object.isFrozen(plan.steps[0]?.reference), true);
  assert.equal(Object.isFrozen(plan.recovery), true);
  assert.throws(() => { (plan.steps[0] as unknown as { order: number }).order = 5; });

  // Construction deep-copies: mutating the source afterwards does not leak in.
  const sourceLimits = limits();
  const built = createRuntimeRetryPolicy(policyInput({ limits: sourceLimits }));
  (sourceLimits as { maxAttempts: number }).maxAttempts = 99;
  assert.equal(built.limits.maxAttempts, 3);
}

/* ── Adversarial: no behaviour or shared mutable state ─────────── */
function adversarial(): void {
  const cases: readonly [string, () => unknown][] = [
    ["executable retry callback", () => createRuntimeRetryPolicy(policyInput({ backoff: backoff({ onRetry: () => undefined }) as never }))],
    ["timer injection", () => createRuntimeRetryPolicy(policyInput({ limits: limits({ timer: () => undefined }) as never }))],
    ["queue injection", () => createRuntimeCompensationPlan(planInput({ recovery: { recoveryClass: "none", rationale: "x", requiresManualApproval: false, buffer: () => undefined, ...inert } as never }))],
    ["Promise injection", () => createRuntimeRetryPolicy(policyInput({ eligibility: Promise.resolve() as never }))],
    ["Symbol injection", () => createRuntimeRetryPolicy(policyInput({ limits: limits({ tag: Symbol("s") }) as never }))],
    ["bigint injection", () => createRuntimeRetryPolicy(policyInput({ limits: limits({ big: BigInt(1) }) as never }))],
    ["non-finite number", () => createRuntimeRetryPolicy(policyInput({ backoff: backoff({ baseDelayMs: Number.POSITIVE_INFINITY }) }))],
    ["class instance", () => createRuntimeCompensationPlan(planInput({ steps: [step({ reference: new (class { executionId = "e-1"; })() as never })] }))],
    ["cyclic object", () => { const c: Record<string, unknown> = { ...inert }; c.self = c; return createRuntimeRetryPolicy(policyInput({ limits: c as never })); }],
    ["shared mutable reference", () => { const shared = { nested: { v: 1 } }; return createRuntimeRetryPolicy(policyInput({ limits: { ...limits(), a: shared, b: shared } as never })); }],
  ];
  for (const [name, run] of cases) {
    assert.throws(run, TypeError, `${name} must be rejected`);
  }
  // A frozen shared reference used twice is fine (no mutation risk).
  const frozenShared = Object.freeze({ note: "ok" });
  assert.doesNotThrow(() => createRuntimeRetryPolicy(policyInput({ backoff: { ...backoff(), a: frozenShared, b: frozenShared } as never })));
}

/* ── Validator rejects post-hoc mutation attempts ──────────────── */
function validatorRejectsTampering(): void {
  // A hand-built policy that skipped the constructor and is not fully frozen.
  const unfrozen = {
    ...createRuntimeRetryPolicy(policyInput()),
    limits: { maxAttempts: 3, attemptsMade: 1, attemptsRemaining: 2, maxTotalDurationMs: 1, ...inert },
  } as RuntimeRetryPolicy;
  assert.equal(validateRuntimeRetryPolicy(unfrozen).error?.code, "IMMUTABILITY_VIOLATION");
}

function main(): void {
  retryPolicyConstruction();
  retryEligibility();
  retryLimits();
  retryAttempts();
  backoffDescriptors();
  eligibilityConsistency();
  compensationPlan();
  compensationSteps();
  references();
  metadata();
  immutability();
  adversarial();
  validatorRejectsTampering();
  console.log("runtime retry & compensation checks passed");
}

main();
