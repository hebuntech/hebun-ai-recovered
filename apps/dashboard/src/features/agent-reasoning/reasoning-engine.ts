/*
 * Agent Reasoning — engine orchestrator.
 *
 * Runs the deterministic pipeline over one Agent Context Package:
 *   goal → constraints → risk → confidence → options → decision.
 * (Risk and confidence are computed before options because option scoring
 * depends on them; the reasoning trace still reports every stage.) Pure
 * function: same Context Package → same Decision Package, every time.
 */

import type { AgentContextPackage } from "@/features/agent-context";
import { analyzeGoal } from "./goal-analysis";
import { analyzeConstraints } from "./constraint-analysis";
import { analyzeRisk } from "./risk-analysis";
import { evaluateConfidence } from "./confidence-engine";
import { generateOptions, recommendOption } from "./option-generator";
import { buildDecisionPackage } from "./decision-package";
import type { DecisionPackage } from "./types";

export function reason(pkg: AgentContextPackage): DecisionPackage {
  const goal = analyzeGoal(pkg);
  const constraints = analyzeConstraints(pkg);
  const risk = analyzeRisk(pkg, constraints);
  const confidence = evaluateConfidence(pkg, constraints, risk);
  const options = generateOptions({ confidence, risk, constraints });
  const recommended = recommendOption(options);

  return buildDecisionPackage({
    pkg,
    goal,
    constraints,
    options,
    recommended,
    risk,
    confidence,
  });
}
