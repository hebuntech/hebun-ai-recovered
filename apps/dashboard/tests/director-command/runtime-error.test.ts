import assert from "node:assert/strict";
import {
  createRuntimeError,
  RUNTIME_ERROR_CATEGORIES,
  RUNTIME_ERROR_CODES,
  RUNTIME_ERROR_ORIGIN_LAYERS,
  RUNTIME_ERROR_SEVERITIES,
  RUNTIME_ERROR_VERSION,
  validateRuntimeError,
  type RuntimeError,
} from "../../src/features/director-command";

const inert = { executable: false as const, authoritative: false as const };

function origin(overrides: Record<string, unknown> = {}) {
  return { layer: "engine" as const, component: "runtime-engine", operation: "invoke", ...inert, ...overrides };
}
function reference(overrides: Record<string, unknown> = {}) {
  return { executionId: "e-1", correlationId: "c-1", targetId: "t-1", resultReference: "r-1", ...inert, ...overrides };
}
function correlation(overrides: Record<string, unknown> = {}) {
  return { correlationId: "c-1", causationId: "cause-1", parentErrorId: "err-0", rootErrorId: "err-root", ...inert, ...overrides };
}
function context(overrides: Record<string, unknown> = {}) {
  return { reason: "Adapter invocation failed.", retryable: true, terminal: false, attributes: { attempt: 1 }, ...inert, ...overrides };
}
function metadata(overrides: Record<string, unknown> = {}) {
  return { occurredAt: "2026-01-01T00:00:00Z", schemaVersion: "1.0.0", redactionApplied: true, attributes: {}, ...inert, ...overrides };
}
function errorInput(overrides: Record<string, unknown> = {}): Omit<RuntimeError, "architectureVersion"> {
  return {
    errorId: "err-1", code: "RUNTIME_EXECUTION_FAILED", category: "execution", severity: "error",
    message: "Execution failed.", origin: origin(), reference: reference(), correlation: correlation(),
    context: context(), metadata: metadata(), ...inert, ...overrides,
  } as Omit<RuntimeError, "architectureVersion">;
}

/* ── Construction ──────────────────────────────────────────────── */
function construction(): void {
  const error = createRuntimeError(errorInput());
  assert.equal(error.architectureVersion, RUNTIME_ERROR_VERSION);
  assert.equal(error.executable, false);
  assert.equal(error.authoritative, false);
  assert.equal(validateRuntimeError(error).status, "valid");
  assert.equal(Object.isFrozen(validateRuntimeError(error)), true);
}

/* ── Codes / categories agreement ──────────────────────────────── */
function codesAndCategories(): void {
  // Every declared code has a category, and validation enforces the pairing.
  const pairs: readonly [RuntimeError["code"], RuntimeError["category"]][] = [
    ["RUNTIME_UNKNOWN", "internal"],
    ["RUNTIME_INVALID_REQUEST", "validation"],
    ["RUNTIME_AUTHORITY_DENIED", "authority"],
    ["RUNTIME_POLICY_BLOCKED", "policy"],
    ["RUNTIME_PERMIT_INVALID", "permit"],
    ["RUNTIME_TARGET_UNRESOLVED", "resolution"],
    ["RUNTIME_ADAPTER_UNAVAILABLE", "adapter"],
    ["RUNTIME_INVOCATION_FAILED", "adapter"],
    ["RUNTIME_EXECUTION_FAILED", "execution"],
    ["RUNTIME_EXECUTION_TIMEOUT", "timeout"],
    ["RUNTIME_EXECUTION_CANCELLED", "cancellation"],
    ["RUNTIME_RESULT_INVALID", "result"],
    ["RUNTIME_INTERNAL", "internal"],
  ];
  assert.equal(pairs.length, RUNTIME_ERROR_CODES.length);
  for (const [code, category] of pairs) {
    assert.equal(validateRuntimeError(createRuntimeError(errorInput({ code, category, context: context({ retryable: false, terminal: false }) }))).status, "valid");
  }
  // A code attributed to the wrong category is rejected.
  const mismatched = validateRuntimeError(createRuntimeError(errorInput({ code: "RUNTIME_AUTHORITY_DENIED", category: "execution" })));
  assert.equal(mismatched.error?.code, "INVALID_ERROR_CATEGORY");
  // Unknown code / category.
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ code: "NOPE" as never }))).error?.code, "INVALID_ERROR_CODE");
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ code: "RUNTIME_EXECUTION_FAILED", category: "made-up" as never }))).error?.code, "INVALID_ERROR_CATEGORY");
}

/* ── Severity ──────────────────────────────────────────────────── */
function severity(): void {
  for (const level of RUNTIME_ERROR_SEVERITIES) {
    assert.equal(validateRuntimeError(createRuntimeError(errorInput({ severity: level }))).status, "valid");
  }
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ severity: "meltdown" as never }))).error?.code, "INVALID_ERROR_SEVERITY");
}

/* ── Origin ────────────────────────────────────────────────────── */
function originModel(): void {
  for (const layer of RUNTIME_ERROR_ORIGIN_LAYERS) {
    assert.equal(validateRuntimeError(createRuntimeError(errorInput({ origin: origin({ layer }) }))).status, "valid");
  }
  for (const bad of [origin({ layer: "spaceship" }), origin({ component: "" }), origin({ operation: "  " })]) {
    assert.equal(validateRuntimeError(createRuntimeError(errorInput({ origin: bad }))).error?.code, "INVALID_ERROR_ORIGIN");
  }
}

/* ── Reference ─────────────────────────────────────────────────── */
function referenceModel(): void {
  for (const key of ["executionId", "correlationId", "targetId", "resultReference"]) {
    const bad = validateRuntimeError(createRuntimeError(errorInput({
      reference: reference({ [key]: "" }),
      correlation: correlation({ correlationId: key === "correlationId" ? "" : "c-1" }),
    })));
    assert.equal(bad.status, "invalid");
    assert.equal(["INVALID_ERROR_REFERENCE", "INVALID_ERROR_CORRELATION"].includes(bad.error?.code ?? ""), true);
  }
}

/* ── Correlation ───────────────────────────────────────────────── */
function correlationModel(): void {
  // Correlation-exclusive fields: reference carries only correlationId, so an
  // empty value on these three surfaces as a correlation fault, not a reference one.
  for (const key of ["causationId", "parentErrorId", "rootErrorId"]) {
    assert.equal(validateRuntimeError(createRuntimeError(errorInput({ correlation: correlation({ [key]: "" }) }))).error?.code, "INVALID_ERROR_CORRELATION");
  }
  // Correlation id must match the reference's correlation id.
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({
    correlation: correlation({ correlationId: "different" }),
  }))).error?.code, "INVALID_ERROR_CORRELATION");
}

/* ── Context ───────────────────────────────────────────────────── */
function contextModel(): void {
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ context: context({ reason: "" }) }))).error?.code, "INVALID_ERROR_CONTEXT");
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ context: context({ retryable: "yes" as never }) }))).error?.code, "INVALID_ERROR_CONTEXT");
  // Terminal and retryable are contradictory.
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ context: context({ terminal: true, retryable: true }) }))).error?.code, "INVALID_ERROR_CONTEXT");
  // Terminal-and-not-retryable is fine.
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ context: context({ terminal: true, retryable: false }) }))).status, "valid");
}

/* ── Metadata ──────────────────────────────────────────────────── */
function metadataModel(): void {
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ metadata: metadata({ occurredAt: "" }) }))).error?.code, "INVALID_ERROR_METADATA");
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ metadata: metadata({ schemaVersion: "  " }) }))).error?.code, "INVALID_ERROR_METADATA");
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ metadata: metadata({ redactionApplied: 1 as never }) }))).error?.code, "INVALID_ERROR_METADATA");
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ metadata: metadata({ attributes: { region: "eu", nested: [1, 2, { ok: true }] } }) }))).status, "valid");
}

/* ── Identifiers ───────────────────────────────────────────────── */
function identifiers(): void {
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ errorId: "" }))).error?.code, "INVALID_ERROR");
  assert.equal(validateRuntimeError(createRuntimeError(errorInput({ message: "   " }))).error?.code, "INVALID_ERROR");
}

/* ── Immutability ──────────────────────────────────────────────── */
function immutability(): void {
  const error = createRuntimeError(errorInput());
  for (const nested of [error, error.origin, error.reference, error.correlation, error.context, error.metadata]) {
    assert.equal(Object.isFrozen(nested), true);
  }
  assert.equal(Object.isFrozen(error.context.attributes), true);
  assert.throws(() => { (error as unknown as { message: string }).message = "x"; });
  assert.throws(() => { (error.origin as unknown as { layer: string }).layer = "engine"; });
  assert.throws(() => { (error.context.attributes as unknown as { a: number }).a = 1; });

  // Construction deep-copies: mutating the source afterward does not leak in.
  const src = context();
  const built = createRuntimeError(errorInput({ context: src }));
  (src as { reason: string }).reason = "tampered";
  assert.equal(built.context.reason, "Adapter invocation failed.");

  // A hand-built error with an unfrozen nested object is caught by the validator.
  const tampered = { ...error, metadata: { ...metadata(), occurredAt: "2026-01-01T00:00:00Z" } } as RuntimeError;
  assert.equal(validateRuntimeError(tampered).error?.code, "IMMUTABILITY_VIOLATION");
}

/* ── Adversarial: no behaviour or shared mutable state ─────────── */
function adversarial(): void {
  const cases: readonly [string, () => unknown][] = [
    ["executable callback", () => createRuntimeError(errorInput({ context: context({ handler: () => undefined }) as never }))],
    ["throw injection", () => createRuntimeError(errorInput({ metadata: metadata({ raise: () => { throw new Error("x"); } }) as never }))],
    ["Promise injection", () => createRuntimeError(errorInput({ correlation: Promise.resolve() as never }))],
    ["Symbol injection", () => createRuntimeError(errorInput({ metadata: metadata({ tag: Symbol("s") }) as never }))],
    ["bigint injection", () => createRuntimeError(errorInput({ context: context({ big: BigInt(1) }) as never }))],
    ["non-finite number", () => createRuntimeError(errorInput({ context: context({ attributes: { n: Number.POSITIVE_INFINITY } }) }))],
    ["Error instance", () => createRuntimeError(errorInput({ metadata: metadata({ cause: new Error("boom") }) as never }))],
    ["class instance", () => createRuntimeError(errorInput({ origin: new (class { layer = "execution"; })() as never }))],
    ["cyclic object", () => { const c: Record<string, unknown> = { ...inert }; c.self = c; return createRuntimeError(errorInput({ context: c as never })); }],
    ["shared mutable reference", () => { const shared = { v: 1 }; return createRuntimeError(errorInput({ metadata: { ...metadata(), a: shared, b: shared } as never })); }],
  ];
  for (const [name, run] of cases) {
    assert.throws(run, TypeError, `${name} must be rejected`);
  }
  // A frozen shared reference used twice carries no mutation risk.
  const frozenShared = Object.freeze({ note: "ok" });
  assert.doesNotThrow(() => createRuntimeError(errorInput({ metadata: { ...metadata(), a: frozenShared, b: frozenShared } as never })));
}

function main(): void {
  construction();
  codesAndCategories();
  severity();
  originModel();
  referenceModel();
  correlationModel();
  contextModel();
  metadataModel();
  identifiers();
  immutability();
  adversarial();
  // Vocabulary is a superset of nothing surprising.
  assert.deepEqual([...RUNTIME_ERROR_CATEGORIES].length, new Set(RUNTIME_ERROR_CATEGORIES).size);
  console.log("runtime error architecture checks passed");
}

main();
