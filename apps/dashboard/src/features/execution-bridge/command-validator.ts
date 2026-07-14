import { getCommandDefinition } from "@/features/commands/registry";
import type { CommandCandidate, CommandDependencyGraph, CommandValidationResult, ValidationIssue } from "./types";
import type { ApprovalGate } from "@/features/task-planning";

function findCircularDependencies(candidates: CommandCandidate[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const graph = new Map(candidates.map((candidate) => [candidate.id, candidate.dependencies]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string, stack: string[]): void {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      const cycle = [...stack, id];
      issues.push({
        code: "circular-dependency",
        message: `Circular dependency detected: ${cycle.join(" -> ")}`,
        commandId: id,
        relatedIds: cycle,
      });
      return;
    }

    visiting.add(id);
    for (const dep of graph.get(id) ?? []) visit(dep, [...stack, id]);
    visiting.delete(id);
    visited.add(id);
  }

  for (const candidate of candidates) visit(candidate.id, []);
  return issues;
}

export function validateCommandPlan(
  candidates: CommandCandidate[],
  dependencyGraph: CommandDependencyGraph,
  approvals: ApprovalGate[]
): CommandValidationResult {
  const issues: ValidationIssue[] = [];
  const ids = new Set(candidates.map((candidate) => candidate.id));
  const seenDuplicateKeys = new Set<string>();
  const approvalIds = new Set(approvals.map((approval) => approval.id));

  for (const candidate of candidates) {
    if (!candidate.owner.id || !candidate.owner.type) {
      issues.push({
        code: "missing-owner",
        message: `Command candidate "${candidate.id}" is missing an owner.`,
        commandId: candidate.id,
      });
    }

    if (!candidate.commandType || !getCommandDefinition(candidate.commandType)) {
      issues.push({
        code: "missing-command-type",
        message: `Command candidate "${candidate.id}" does not map to a registered command type.`,
        commandId: candidate.id,
      });
    }

    const duplicateKey = [
      candidate.taskId,
      candidate.commandType,
      candidate.owner.type,
      candidate.owner.id,
    ].join("|");
    if (seenDuplicateKeys.has(duplicateKey)) {
      issues.push({
        code: "duplicate-command",
        message: `Duplicate command candidate detected for "${candidate.taskId}".`,
        commandId: candidate.id,
      });
    }
    seenDuplicateKeys.add(duplicateKey);

    for (const dependencyId of candidate.dependencies) {
      if (!ids.has(dependencyId)) {
        issues.push({
          code: "invalid-dependency",
          message: `Command candidate "${candidate.id}" depends on missing candidate "${dependencyId}".`,
          commandId: candidate.id,
          relatedIds: [dependencyId],
        });
      }
    }

    if (candidate.requiredApproval && candidate.approvalGateIds.length === 0) {
      issues.push({
        code: "missing-approval",
        message: `Command candidate "${candidate.id}" requires an approval gate.`,
        commandId: candidate.id,
      });
    }

    for (const approvalGateId of candidate.approvalGateIds) {
      if (!approvalIds.has(approvalGateId)) {
        issues.push({
          code: "missing-approval",
          message: `Command candidate "${candidate.id}" references unknown approval gate "${approvalGateId}".`,
          commandId: candidate.id,
          relatedIds: [approvalGateId],
        });
      }
    }
  }

  for (const node of dependencyGraph.nodes) {
    for (const dependencyId of node.dependsOn) {
      if (!ids.has(dependencyId)) {
        issues.push({
          code: "invalid-dependency",
          message: `Dependency graph contains unknown command "${dependencyId}".`,
          commandId: node.commandId,
          relatedIds: [dependencyId],
        });
      }
    }
  }

  issues.push(...findCircularDependencies(candidates));

  return {
    valid: issues.length === 0,
    issues,
  };
}

