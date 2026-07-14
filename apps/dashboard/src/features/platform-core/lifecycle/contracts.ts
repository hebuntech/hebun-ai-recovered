/*
 * platform-core / lifecycle — reusable contract helpers (Spec 48 §6).
 *
 * Architecture-neutral, pure functions over the declared state metadata. NO
 * domain transition tables live here — a domain supplies its own metadata and
 * (later) its own transition map. These helpers only express the CANONICAL
 * invariants every domain shares:
 *   1. health never moves lifecycle (separate axes);
 *   2. terminal states are frozen and clear health to `unknown`;
 *   3. health is non-`unknown` only where the state declares `carriesHealth`.
 */

import type {
  HealthValue,
  LifecycleStateMeta,
  LifecycleValue,
  TransitionValidationResult,
} from "./types";

/** The universal "no signal yet / cleared" health value shared by all domains. */
export const HEALTH_UNKNOWN = "unknown" as const;

/** A lifecycle contract = the declared metadata for one domain's states. */
export interface LifecycleContract<
  L extends LifecycleValue = LifecycleValue,
  H extends HealthValue = HealthValue,
> {
  readonly domain: string;
  readonly states: Readonly<Record<L, LifecycleStateMeta<L>>>;
  /** The complete set of valid health values for this domain (incl. "unknown"). */
  readonly healthValues: readonly H[];
}

/** True when the given state is terminal (any polarity). */
export function isTerminal<L extends LifecycleValue>(
  contract: LifecycleContract<L>,
  state: L,
): boolean {
  return contract.states[state]?.terminal !== "none";
}

/** True when an entity in this state may hold a non-`unknown` health value. */
export function carriesHealth<L extends LifecycleValue>(
  contract: LifecycleContract<L>,
  state: L,
): boolean {
  return contract.states[state]?.carriesHealth === true;
}

/**
 * Validate a proposed health value against the lifecycle state — the canonical
 * scoping rule (Spec 48 §6.2). Health may be non-`unknown` ONLY in states that
 * declare `carriesHealth`; terminal/non-active states must read `unknown`.
 * This never mutates and never touches lifecycle.
 */
export function validateHealthForState<
  L extends LifecycleValue,
  H extends HealthValue,
>(
  contract: LifecycleContract<L, H>,
  state: L,
  health: H,
): TransitionValidationResult {
  const reasons: string[] = [];
  if (health !== HEALTH_UNKNOWN && !carriesHealth(contract, state)) {
    reasons.push(
      `health "${String(health)}" not permitted in state "${String(state)}" — must be "unknown"`,
    );
  }
  return { valid: reasons.length === 0, reasons };
}

/**
 * Canonical guard: a health change must NEVER be treated as a lifecycle change.
 * Domains call this to assert a health update carries no lifecycle intent.
 */
export function assertHealthDoesNotMoveLifecycle(hasLifecycleIntent: boolean): TransitionValidationResult {
  return hasLifecycleIntent
    ? { valid: false, reasons: ["health updates must not request a lifecycle transition (Spec 48 §6)"] }
    : { valid: true, reasons: [] };
}
