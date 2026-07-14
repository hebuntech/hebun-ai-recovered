/*
 * circuit-breaker.ts — deterministic circuit breaker model for adapters.
 * Protects the Execution Engine from repeatedly calling a failing adapter.
 */

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownMs: number;
  halfOpenProbes: number;
}

export const defaultCircuitConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  cooldownMs: 30_000,
  halfOpenProbes: 1,
};

export interface CircuitSnapshot {
  state: CircuitState;
  consecutiveFailures: number;
  config: CircuitBreakerConfig;
  note: string;
}

/** deterministic state from a failure count. */
export function evaluateCircuit(
  consecutiveFailures: number,
  config: CircuitBreakerConfig = defaultCircuitConfig
): CircuitSnapshot {
  let state: CircuitState;
  if (consecutiveFailures >= config.failureThreshold) state = "open";
  else if (consecutiveFailures > 0) state = "half-open";
  else state = "closed";
  return {
    state,
    consecutiveFailures,
    config,
    note:
      state === "open"
        ? "Short-circuiting; cooling down before probe"
        : state === "half-open"
          ? "Probing recovery"
          : "Healthy; passing through",
  };
}

/* Simulation Adapter is healthy → closed. */
export const simulationCircuit: CircuitSnapshot = evaluateCircuit(0);
