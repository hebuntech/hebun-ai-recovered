import {
  buildDecisionMemory,
  deriveTimestamp,
  firstActiveRecord,
  importanceFromHealth,
  nodeForRecord,
  statusFromHealth,
} from "@/features/memory/memory-builder";
import type { DecisionMemoryRecord } from "@/features/memory/types";

const goal = firstActiveRecord("goals");
const governance = firstActiveRecord("governance");
const policy = firstActiveRecord("policies");

const goalNodeId = nodeForRecord("goals", goal.id)?.id ?? "";
const governanceNodeId = nodeForRecord("governance", governance.id)?.id ?? "";
const policyNodeId = nodeForRecord("policies", policy.id)?.id ?? "";

export const decisionMemories: DecisionMemoryRecord[] = [
  buildDecisionMemory({
    id: "mem-de-1",
    category: "decision",
    title: "Churn reduction goal threshold was formally revised",
    summary:
      "Leadership preserved the decision to refine the churn target so future planning systems understand why downstream changes were made.",
    decision: "Revise the churn success threshold and keep the goal active.",
    context:
      "The strategic goal needed an updated definition to reflect current enterprise operating reality.",
    alternativesConsidered: [
      "Keep the prior threshold unchanged",
      "Pause the goal until new sales signals arrived",
      "Revise the target and continue planning",
    ],
    selectedOption: "Revise the target and continue planning.",
    reasoning:
      "This preserved momentum while ensuring planning and risk systems used a current business target.",
    affectedEntities: ["Director", "Planning Engine", "Risk Engine"],
    whatHappened: `${goal.name} remained active with a refined success definition.`,
    whyItHappened:
      "The company needed to keep strategy aligned with the operating environment without stopping execution.",
    whoWasInvolved: [goal.owner, "Planning Engine", "Risk Engine"],
    whatChanged: goal.change,
    reusableLater:
      "Reuse this decision memory when strategy changes require downstream plan and risk updates.",
    owner: goal.owner,
    timestamp: deriveTimestamp(goal, "2026-06", 10),
    registryIds: ["goals", "plans", "risk"],
    graphNodeIds: [goalNodeId].filter(Boolean),
    involvedEntities: ["Director"],
    status: statusFromHealth(goal.health),
    importance: importanceFromHealth(goal.health),
    tags: ["decision", "strategy", "goal"],
  }),
  buildDecisionMemory({
    id: "mem-de-2",
    category: "decision",
    title: "Approval lineage was selected as the control default",
    summary:
      "Governance kept the final control decision and its rationale so future systems can reuse the same enterprise control baseline.",
    decision: "Adopt approval lineage as the default control record for governed workflows.",
    context:
      "Control evidence needed to be consistent across workflows, approvals, and audit surfaces.",
    alternativesConsidered: [
      "Keep evidence local to each workflow",
      "Track only approval status without lineage",
      "Standardize lineage across governed workflows",
    ],
    selectedOption: "Standardize lineage across governed workflows.",
    reasoning:
      "A shared lineage model improves trust, auditability, and future memory reuse.",
    affectedEntities: ["Governance Core", "Audit", "Director"],
    whatHappened: `${governance.name} became the preferred control representation.`,
    whyItHappened:
      "The company needed a reusable control pattern that future reasoning systems can interpret safely.",
    whoWasInvolved: [governance.owner, "Audit", "Director"],
    whatChanged: governance.change,
    reusableLater:
      "Reuse this decision memory whenever new governance surfaces need a default evidence pattern.",
    owner: governance.owner,
    timestamp: deriveTimestamp(governance, "2026-06", 15),
    registryIds: ["governance", "workflows", "events"],
    graphNodeIds: [governanceNodeId].filter(Boolean),
    involvedEntities: ["Audit"],
    status: statusFromHealth(governance.health),
    importance: importanceFromHealth(governance.health),
    tags: ["decision", "governance", "control"],
  }),
  buildDecisionMemory({
    id: "mem-de-3",
    category: "decision",
    title: "Executive approval thresholds were kept as policy v3.1",
    summary:
      "Policy evolution was preserved as decision memory so later planners know which alternatives were rejected and why.",
    decision: "Publish version 3.1 of executive approval thresholds.",
    context:
      "The company needed clearer approval routing for larger enterprise motions.",
    alternativesConsidered: [
      "Keep version 3.0 and accept higher approval ambiguity",
      "Raise all approvals to the director level",
      "Publish a targeted threshold revision",
    ],
    selectedOption: "Publish a targeted threshold revision.",
    reasoning:
      "This improved clarity without overloading executive approvals.",
    affectedEntities: ["Sales", "Governance", "Director"],
    whatHappened: `${policy.name} advanced as the active rule set.`,
    whyItHappened:
      "The operating system needed more precise approval routing with lower decision overhead.",
    whoWasInvolved: [policy.owner, "Governance Core", "Sales"],
    whatChanged: policy.change,
    reusableLater:
      "Reuse this decision memory when policy revisions need justification and alternative context.",
    owner: policy.owner,
    timestamp: deriveTimestamp(policy, "2026-06", 19),
    registryIds: ["policies", "governance"],
    graphNodeIds: [policyNodeId].filter(Boolean),
    involvedEntities: ["Sales"],
    status: statusFromHealth(policy.health),
    importance: importanceFromHealth(policy.health),
    tags: ["decision", "policy", "approvals"],
  }),
];
