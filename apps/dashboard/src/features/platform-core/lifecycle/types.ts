/*
 * platform-core / lifecycle — canonical two-axis contracts (Spec 48 §6).
 *
 * Every stateful domain entity carries TWO orthogonal axes:
 *   - lifecycle : governed existence; changes only via governed transitions.
 *   - health    : observed condition; auto-derived; NEVER moves lifecycle.
 *
 * This file defines architecture-neutral CONTRACTS only. It contains NO
 * domain-specific transition logic and performs NO runtime work. Each domain
 * later parameterizes these generics with its own `*LifecycleStatusEnum` /
 * `*HealthEnum` value union (see src/db/schema/_enums.ts, Tier 2).
 */

/** A lifecycle value is a domain-defined governed state (string literal union). */
export type LifecycleValue = string;

/** A health value is a domain-defined observed condition (string literal union). */
export type HealthValue = string;

/** Whether a lifecycle state is terminal, and if so its polarity. */
export type TerminalKind = "none" | "positive" | "negative" | "historical";

/** Metadata describing a single lifecycle state (declarative; per-domain). */
export interface LifecycleStateMeta<L extends LifecycleValue = LifecycleValue> {
  readonly value: L;
  /** Governed states are mutable only via transitions; terminal states are frozen. */
  readonly mutable: boolean;
  /** Terminal classification (Spec 48 §6.2). */
  readonly terminal: TerminalKind;
  /** Whether an entity in this state may carry a non-`unknown` health value. */
  readonly carriesHealth: boolean;
}

/** A request to move an entity from one governed lifecycle state to another. */
export interface LifecycleTransitionRequest<
  L extends LifecycleValue = LifecycleValue,
> {
  readonly entityType: string;
  readonly entityId: string;
  readonly from: L;
  readonly to: L;
  /** The actor authorizing the transition (see platform-core/actor). */
  readonly actorRef?: unknown;
  readonly reason?: string;
  /** Correlation id threading this transition through its run. */
  readonly correlationId?: string;
  readonly occurredAt?: string;
}

/** The outcome of a lifecycle transition attempt. */
export interface LifecycleTransitionResult<
  L extends LifecycleValue = LifecycleValue,
> {
  readonly ok: boolean;
  readonly from: L;
  readonly to?: L;
  /** Present when `ok` is false — the invariant that blocked the transition. */
  readonly violation?: string;
}

/** A request to update the OBSERVED health of an entity (never moves lifecycle). */
export interface HealthUpdateRequest<H extends HealthValue = HealthValue> {
  readonly entityType: string;
  readonly entityId: string;
  readonly from: H;
  readonly to: H;
  /** The signals that drove the recomputation (declarative; per-domain). */
  readonly drivers?: readonly string[];
  readonly occurredAt?: string;
}

/** The result of validating a transition against declared state metadata. */
export interface TransitionValidationResult {
  readonly valid: boolean;
  /** Human-readable reasons a transition was rejected (empty when valid). */
  readonly reasons: readonly string[];
}
