/*
 * Agent Reasoning — deterministic reasoning layer above Agent Context.
 *
 * Transforms a Context Package into a Decision Package via a fixed, traceable
 * pipeline: goal → constraints → options → risk → confidence → decision. No LLM,
 * no randomness, no execution. Same context → same decision, every time.
 */

export * from "./types";
export { reason } from "./reasoning-engine";
export { analyzeGoal } from "./goal-analysis";
export { analyzeConstraints } from "./constraint-analysis";
export { analyzeRisk } from "./risk-analysis";
export { evaluateConfidence } from "./confidence-engine";
export { generateOptions, recommendOption } from "./option-generator";
export { buildDecisionPackage } from "./decision-package";
export { buildReasoningReport } from "./reasoning-report";
export {
  getAgentReasoning,
  getActiveAgentReasonings,
} from "./agent-reasoning-service";
