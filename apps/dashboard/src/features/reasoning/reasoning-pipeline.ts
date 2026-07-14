import {
  companyKnowledgeGraph,
  graphNodesByRegistry,
} from "@/features/knowledge-graph";
import { companyMemories } from "@/features/memory";
import { buildReasoningContext } from "@/features/reasoning/context-builder";
import { scoreConfidence } from "@/features/reasoning/confidence-engine";
import { evaluateConstraints } from "@/features/reasoning/constraint-evaluator";
import { collectEvidence } from "@/features/reasoning/evidence-collector";
import { buildExplanation } from "@/features/reasoning/explanation-builder";
import { evaluateGoals } from "@/features/reasoning/goal-evaluator";
import { generateCandidateOptions } from "@/features/reasoning/option-generator";
import { produceRecommendation } from "@/features/reasoning/recommendation-engine";
import { reasoningScenarios } from "@/features/reasoning/reasoning-engine";
import { analyzeTradeoffs } from "@/features/reasoning/tradeoff-analysis";
import type { ReasoningPipelineStep, ReasoningResult, ReasoningScenario } from "@/features/reasoning/types";

export const reasoningPipelineSteps: ReasoningPipelineStep[] = [
  { id: "build-context", label: "Build Context", description: "Frame the objective and relevant company surfaces." },
  { id: "collect-evidence", label: "Collect Evidence", description: "Gather registry and intelligence evidence." },
  { id: "retrieve-memories", label: "Retrieve Relevant Memories", description: "Pull reusable memory references." },
  { id: "retrieve-graph", label: "Retrieve Knowledge Graph Relationships", description: "Link graph nodes and typed relationships." },
  { id: "evaluate-constraints", label: "Evaluate Constraints", description: "Apply hard and soft decision limits." },
  { id: "evaluate-goals", label: "Evaluate Goals", description: "Score alignment against intended outcomes." },
  { id: "generate-options", label: "Generate Candidate Options", description: "Create deterministic action alternatives." },
  { id: "compare-tradeoffs", label: "Compare Trade-offs", description: "Compare upside, cost, risk, and speed." },
  { id: "score-confidence", label: "Score Confidence", description: "Compute confidence from evidence coverage and margin." },
  { id: "produce-recommendation", label: "Produce Recommendation", description: "Select the best explainable option." },
  { id: "build-explanation", label: "Build Explanation", description: "Preserve a human-readable reasoning trace." },
];

export function runReasoningScenario(scenario: ReasoningScenario): ReasoningResult {
  const context = buildReasoningContext(scenario);
  const evidence = collectEvidence(context);
  const constraints = evaluateConstraints(context, evidence);
  const goals = evaluateGoals(context, evidence);
  const candidateOptions = generateCandidateOptions(context, evidence, constraints, goals);
  const tradeoffs = analyzeTradeoffs(candidateOptions, constraints, goals);
  const selectedOption =
    candidateOptions.find((option) => option.id === tradeoffs[0]?.optionId) ?? candidateOptions[0];
  const { confidenceScore, riskLevel } = scoreConfidence(
    evidence,
    constraints,
    goals,
    tradeoffs
  );
  const recommendation = produceRecommendation(
    selectedOption,
    tradeoffs.find((tradeoff) => tradeoff.optionId === selectedOption.id),
    riskLevel
  );
  const explanation = buildExplanation(
    context,
    evidence,
    constraints,
    goals,
    selectedOption,
    recommendation
  );

  const relatedRegistryIds = Array.from(
    new Set([
      ...context.registryIds,
      ...evidence.flatMap((item) => item.registryIds),
      ...selectedOption.relatedRegistryIds,
    ])
  );
  const relatedGraphNodeIds = Array.from(
    new Set([
      ...selectedOption.relatedGraphNodeIds,
      ...evidence.flatMap((item) => item.graphNodeIds),
      ...context.registryIds.flatMap((registryId) =>
        graphNodesByRegistry(registryId).slice(0, 2).map((node) => node.id)
      ),
    ])
  );
  const relatedMemoryIds = Array.from(
    new Set([
      ...selectedOption.relatedMemoryIds,
      ...evidence.flatMap((item) => item.memoryIds),
    ])
  );
  const relatedMemories = companyMemories.filter((memory) => relatedMemoryIds.includes(memory.id));
  const relatedGraphLinks = companyKnowledgeGraph.edges.filter(
    (edge) =>
      relatedGraphNodeIds.includes(edge.sourceId) ||
      relatedGraphNodeIds.includes(edge.targetId)
  );
  const relatedGraphNodes = companyKnowledgeGraph.nodes.filter((node) =>
    relatedGraphNodeIds.includes(node.id)
  );

  return {
    id: scenario.id,
    context,
    evidence,
    constraints,
    goals,
    candidateOptions,
    selectedOption,
    confidenceScore,
    riskLevel,
    tradeoffs,
    recommendation,
    explanation,
    relatedRegistryIds,
    relatedGraphNodeIds,
    relatedMemoryIds,
    relatedMemories,
    relatedGraphLinks,
    relatedGraphNodes,
    timestamp: scenario.timestamp,
  };
}

export const reasoningResults = reasoningScenarios.map(runReasoningScenario);
