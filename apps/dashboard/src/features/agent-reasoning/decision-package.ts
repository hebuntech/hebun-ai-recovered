/*
 * Agent Reasoning — decision package assembly + traceability.
 *
 * Combines every pipeline stage into a single Decision Package and records a
 * full reasoning trace (input → evaluation → output → evidence) for each stage.
 * No hidden reasoning: everything the engine concluded is reconstructable here.
 */

import type { AgentContextPackage } from "@/features/agent-context";
import type {
  ConfidenceResult,
  ConstraintAnalysis,
  DecisionContextSummary,
  DecisionPackage,
  GoalAnalysis,
  ReasoningOption,
  ReasoningStep,
  RiskAnalysis,
} from "./types";

interface DecisionInputs {
  pkg: AgentContextPackage;
  goal: GoalAnalysis;
  constraints: ConstraintAnalysis;
  options: ReasoningOption[];
  recommended: ReasoningOption;
  risk: RiskAnalysis;
  confidence: ConfidenceResult;
}

export function buildDecisionPackage(inputs: DecisionInputs): DecisionPackage {
  const { pkg, goal, constraints, options, recommended, risk, confidence } = inputs;

  const contextSummary: DecisionContextSummary = {
    retrievedMemories: pkg.report.retrievedMemories,
    knowledgeNodes: pkg.report.knowledgeNodes,
    relationships: pkg.report.relationships,
    relatedMemories: pkg.report.relatedMemories,
    contextHealth: pkg.report.contextHealth,
    averageConfidence: pkg.report.averageConfidence,
    topMemory: pkg.context.summary.topMemoryTitle,
  };

  return {
    agentId: pkg.agent.id,
    agentName: pkg.agent.name,
    goal,
    contextSummary,
    constraints,
    options,
    recommendedOption: recommended,
    risk,
    confidence,
    reasoningTrace: buildTrace(inputs),
  };
}

/** One traceable step per pipeline stage, in the canonical pipeline order. */
function buildTrace(inputs: DecisionInputs): ReasoningStep[] {
  const { pkg, goal, constraints, options, recommended, risk, confidence } = inputs;

  return [
    {
      stage: "goal-analysis",
      input: `${pkg.report.retrievedMemories} retrieved memories for ${pkg.agent.name}`,
      evaluation: `Selected primary goal from ranked memory / agent role (priority ${goal.priority})`,
      output: goal.primaryGoal,
      evidence: [
        `top memory: ${pkg.context.summary.topMemoryTitle}`,
        ...goal.supportingGoals.map((g) => `supporting: ${g}`),
      ],
    },
    {
      stage: "constraint-analysis",
      input: `${constraints.policies.length} policies, ${constraints.permissions.length} permissions`,
      evaluation: `Completeness ${Math.round(constraints.completeness * 100)}% across constraint categories`,
      output: `${constraints.missingInformation.length} missing-information gap(s)`,
      evidence: [
        ...constraints.policies.map((p) => `policy: ${p}`),
        ...constraints.missingInformation.map((m) => `gap: ${m}`),
      ],
    },
    {
      stage: "option-generation",
      input: `${options.length} catalog options scored deterministically`,
      evaluation: options
        .map((o) => `${o.label}=${o.score}`)
        .join(", "),
      output: `top option: ${recommended.label} (${recommended.score})`,
      evidence: options.map((o) => `${o.label}: ${o.rationale}`),
    },
    {
      stage: "risk-analysis",
      input: `policy ${risk.policyRisk}, gap ${risk.knowledgeGapRisk}, missing ${risk.missingContextRisk}, conf ${risk.lowConfidenceRisk}, dep ${risk.dependencyRisk}`,
      evaluation: `Weighted blend → overall risk ${risk.overallRisk}`,
      output: `risk ${risk.label}`,
      evidence: risk.factors.length > 0 ? risk.factors : ["no dominant risk factors"],
    },
    {
      stage: "confidence-evaluation",
      input: `memConf ${confidence.inputs.memoryConfidence}, coverage ${confidence.inputs.knowledgeCoverage}, health ${confidence.inputs.contextHealth}, completeness ${confidence.inputs.constraintCompleteness}, risk ${confidence.inputs.riskScore}`,
      evaluation: `Weighted blend → confidence ${confidence.score}`,
      output: `${confidence.label} confidence · ${confidence.reasoningQuality} reasoning`,
      evidence: [
        `memory confidence ${confidence.inputs.memoryConfidence}`,
        `knowledge coverage ${confidence.inputs.knowledgeCoverage}`,
        `context health ${confidence.inputs.contextHealth}`,
      ],
    },
    {
      stage: "decision",
      input: `${options.length} scored options, confidence ${confidence.score}, risk ${risk.overallRisk}`,
      evaluation: `Argmax option score with catalog tie-break`,
      output: `recommend: ${recommended.label}`,
      evidence: [recommended.rationale],
    },
  ];
}
