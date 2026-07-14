/*
 * platform-core — shared, architecture-neutral foundation (P0).
 *
 * Canonical CONTRACTS that every domain inherits, so the 14 domains do not each
 * reimplement lifecycle/health, actor references, audit, or events divergently
 * (Gap Analysis TD-3). This barrel exposes contracts + pure helpers ONLY:
 *   - no runtime behavior, no persistence, no event bus, no domain logic;
 *   - additive and behavior-neutral (nothing existing is changed by importing).
 */

export * as lifecycle from "./lifecycle";
export * as actor from "./actor";
export * as agent from "./agent";
export * as memory from "./memory";
export * as knowledge from "./knowledge";
export * as reasoning from "./reasoning";
export * as learning from "./learning";
export * as audit from "./audit";
export * as events from "./events";
