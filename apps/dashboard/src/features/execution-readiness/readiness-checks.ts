import type { HumanApprovalResult } from "@/features/human-approval";
import type { ExecutionReadinessCheck } from "./types";

function approvalComplete(result: HumanApprovalResult): ExecutionReadinessCheck {
  const unresolved = result.decisions.filter(
    (decision) => decision.status === "pending" || decision.status === "changes-requested"
  );

  return {
    id: "approval-complete",
    label: "Approval Complete",
    category: "approval",
    passed: unresolved.length === 0,
    weight: 15,
    detail:
      unresolved.length === 0
        ? "All required approvals are fully resolved."
        : `${unresolved.length} approval decision(s) remain pending or require changes.`,
    recommendation: "Resolve pending approvals and requested changes before dispatch.",
    relatedIds: unresolved.map((decision) => decision.commandId),
  };
}

function dependencyGraphComplete(result: HumanApprovalResult): ExecutionReadinessCheck {
  const invalidDependencyIssues = result.simulation.validation.issues.filter(
    (issue) => issue.code === "invalid-dependency" || issue.code === "circular-dependency"
  );
  const unresolvedDependencies = result.simulation.queue.items.filter((item) =>
    item.dependencies.some(
      (dependencyId) =>
        !result.simulation.queue.items.some((candidate) => candidate.commandId === dependencyId)
    )
  );

  const relatedIds = [
    ...invalidDependencyIssues.flatMap((issue) => issue.relatedIds ?? []),
    ...unresolvedDependencies.map((item) => item.commandId),
  ];

  return {
    id: "dependency-graph-complete",
    label: "Dependency Graph Complete",
    category: "dependency",
    passed: invalidDependencyIssues.length === 0 && unresolvedDependencies.length === 0,
    weight: 10,
    detail:
      invalidDependencyIssues.length === 0 && unresolvedDependencies.length === 0
        ? "Dependency graph is structurally complete."
        : `${invalidDependencyIssues.length + unresolvedDependencies.length} dependency issue(s) found in the execution graph.`,
    recommendation: "Repair missing or circular dependencies before dispatch.",
    relatedIds,
  };
}

function validationPassed(result: HumanApprovalResult): ExecutionReadinessCheck {
  const failedValidations = [
    ...result.simulation.validation.issues.map((issue) => issue.message),
    ...result.validation.issues,
  ];

  return {
    id: "validation-passed",
    label: "Validation Passed",
    category: "validation",
    passed: failedValidations.length === 0,
    weight: 10,
    detail:
      failedValidations.length === 0
        ? "Command and approval validation passed."
        : `${failedValidations.length} validation issue(s) must be resolved.`,
    recommendation: "Fix validation failures before marking the plan ready.",
    relatedIds: [],
  };
}

function ownerAssigned(result: HumanApprovalResult): ExecutionReadinessCheck {
  const missingOwners = result.simulation.queue.items.filter(
    (item) => !item.owner.id || !item.owner.type
  );

  return {
    id: "owner-assigned",
    label: "Owner Assigned",
    category: "ownership",
    passed: missingOwners.length === 0,
    weight: 8,
    detail:
      missingOwners.length === 0
        ? "Every command has an assigned owner."
        : `${missingOwners.length} command(s) are missing ownership.`,
    recommendation: "Assign an owner to every command candidate.",
    relatedIds: missingOwners.map((item) => item.commandId),
  };
}

function resourcesAvailable(result: HumanApprovalResult): ExecutionReadinessCheck {
  const missingResources = result.simulation.queue.items.filter(
    (item) => item.missingResources.length > 0
  );
  const invalidRefs = [
    ...result.planning.plan.resources.requiredAgents,
    ...result.planning.plan.resources.requiredWorkflows,
    ...result.planning.plan.resources.requiredDepartments,
    ...result.planning.plan.resources.requiredKnowledge,
    ...result.planning.plan.resources.requiredMemory,
  ].filter((ref) => !ref.id || !ref.label);

  return {
    id: "resources-available",
    label: "Resources Available",
    category: "resource",
    passed: missingResources.length === 0 && invalidRefs.length === 0,
    weight: 8,
    detail:
      missingResources.length === 0 && invalidRefs.length === 0
        ? "All referenced resources are available to the plan."
        : `${missingResources.length + invalidRefs.length} resource issue(s) detected.`,
    recommendation: "Resolve missing resource references before dispatch.",
    relatedIds: [
      ...missingResources.map((item) => item.commandId),
      ...invalidRefs.map((ref) => ref.id),
    ],
  };
}

function requiredPermissionsSatisfied(result: HumanApprovalResult): ExecutionReadinessCheck {
  const missingPermissions = result.planning.decision.constraints.permissions.filter(
    (permission) => !result.planning.agent.permissions.includes(permission)
  );

  return {
    id: "required-permissions-satisfied",
    label: "Required Permissions Satisfied",
    category: "permission",
    passed: missingPermissions.length === 0,
    weight: 8,
    detail:
      missingPermissions.length === 0
        ? "The owning agent satisfies all required permissions."
        : `${missingPermissions.length} permission requirement(s) are missing.`,
    recommendation: "Align required permissions with the owning agent before dispatch.",
    relatedIds: missingPermissions,
  };
}

function policiesSatisfied(result: HumanApprovalResult): ExecutionReadinessCheck {
  const unresolvedPolicyDecisions = result.decisions.filter(
    (decision) => decision.policySignals.length > 0 && decision.status !== "approved"
  );

  return {
    id: "policies-satisfied",
    label: "Policies Satisfied",
    category: "policy",
    passed: unresolvedPolicyDecisions.length === 0,
    weight: 8,
    detail:
      unresolvedPolicyDecisions.length === 0
        ? "Active policy constraints are satisfied."
        : `${unresolvedPolicyDecisions.length} policy-sensitive approval(s) are unresolved.`,
    recommendation: "Resolve policy-driven approval blockers before dispatch.",
    relatedIds: unresolvedPolicyDecisions.map((decision) => decision.commandId),
  };
}

function noBlockedCommands(result: HumanApprovalResult): ExecutionReadinessCheck {
  const blockedCommands = result.simulation.queue.items.filter((item) =>
    ["blocked", "failed"].includes(item.state)
  );

  return {
    id: "no-blocked-commands",
    label: "No Blocked Commands",
    category: "execution-graph",
    passed: blockedCommands.length === 0,
    weight: 10,
    detail:
      blockedCommands.length === 0
        ? "No commands are blocked in the simulated execution queue."
        : `${blockedCommands.length} command(s) are blocked or failed.`,
    recommendation: "Clear blocked or failed commands before dispatch.",
    relatedIds: blockedCommands.map((item) => item.commandId),
  };
}

function noRejectedApprovals(result: HumanApprovalResult): ExecutionReadinessCheck {
  const rejected = result.decisions.filter((decision) => decision.status === "rejected");

  return {
    id: "no-rejected-approvals",
    label: "No Rejected Approvals",
    category: "approval",
    passed: rejected.length === 0,
    weight: 10,
    detail:
      rejected.length === 0
        ? "No approval decisions are rejected."
        : `${rejected.length} approval decision(s) were rejected.`,
    recommendation: "Resolve rejected approvals before dispatch.",
    relatedIds: rejected.map((decision) => decision.commandId),
  };
}

function commandGraphValid(result: HumanApprovalResult): ExecutionReadinessCheck {
  return {
    id: "command-graph-valid",
    label: "Command Graph Valid",
    category: "command-graph",
    passed: result.simulation.validation.valid,
    weight: 7,
    detail: result.simulation.validation.valid
      ? "Command graph validation passed."
      : `${result.simulation.validation.issues.length} command graph validation issue(s) were found.`,
    recommendation: "Repair command graph validation issues before dispatch.",
    relatedIds: result.simulation.validation.issues.flatMap((issue) => issue.relatedIds ?? []),
  };
}

function executionGraphComplete(result: HumanApprovalResult): ExecutionReadinessCheck {
  const timelineIds = new Set(
    result.simulation.timeline.flatMap((stage) => stage.commandIds)
  );
  const missingTimelineCommands = result.simulation.queue.items.filter(
    (item) => !timelineIds.has(item.commandId)
  );
  const missingStages = result.simulation.queue.items.filter(
    (item) => !result.simulation.timeline.some((stage) => stage.order === item.stageOrder)
  );
  const complete =
    result.simulation.queue.items.length === result.commandPlan.commandCandidates.length &&
    missingTimelineCommands.length === 0 &&
    missingStages.length === 0;

  return {
    id: "execution-graph-complete",
    label: "Execution Graph Complete",
    category: "execution-graph",
    passed: complete,
    weight: 6,
    detail: complete
      ? "Execution graph fully covers the command plan."
      : `${missingTimelineCommands.length + missingStages.length} execution graph coverage issue(s) detected.`,
    recommendation: "Ensure every command is represented in the execution timeline.",
    relatedIds: [
      ...missingTimelineCommands.map((item) => item.commandId),
      ...missingStages.map((item) => item.commandId),
    ],
  };
}

export function buildReadinessChecks(
  result: HumanApprovalResult
): ExecutionReadinessCheck[] {
  return [
    approvalComplete(result),
    dependencyGraphComplete(result),
    validationPassed(result),
    ownerAssigned(result),
    resourcesAvailable(result),
    requiredPermissionsSatisfied(result),
    policiesSatisfied(result),
    noBlockedCommands(result),
    noRejectedApprovals(result),
    commandGraphValid(result),
    executionGraphComplete(result),
  ];
}
