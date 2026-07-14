/*
 * Command pipeline — preparation layer for the future Command Bus.
 *
 * Every primary action in the platform is modeled as a command that will one day
 * flow through these deterministic stages. Nothing here executes: this is the
 * shared, mock-only description reused by CommandAction so buttons can honestly
 * preview what they will do before the Command Bus is wired.
 */

export type CommandType =
  | "agent.create"
  | "memory.create"
  | "workflow.create"
  | "integration.add"
  | "document.create"
  | "job.post"
  | "invoice.create"
  | "contract.create"
  | "contract.generate"
  | "policy.create"
  | "approval.approve"
  | "approval.reject"
  | "report.view"
  | "registry.create"
  | "registry.update"
  | "registry.archive"
  | "registry.restore"
  | "registry.delete"
  | "agent.update"
  | "agent.archive"
  | "agent.restore"
  | "agent.delete"
  | "memory.update"
  | "memory.archive"
  | "memory.restore"
  | "memory.delete"
  | "workflow.update"
  | "workflow.archive"
  | "workflow.restore"
  | "workflow.delete"
  | "knowledge.create"
  | "knowledge.update"
  | "knowledge.archive"
  | "knowledge.restore"
  | "knowledge.delete"
  | "relationship.create"
  | "relationship.update"
  | "relationship.delete";

export interface CommandStage {
  id: "validation" | "approval" | "execution" | "audit";
  label: string;
  detail: string;
}

/* Canonical lifecycle every command will pass through, in order. */
export const commandStages: CommandStage[] = [
  {
    id: "validation",
    label: "Validation",
    detail: "Inputs, policy, and preconditions are checked deterministically.",
  },
  {
    id: "approval",
    label: "Approval",
    detail: "Routed to the Director / governance gate when the risk tier requires it.",
  },
  {
    id: "execution",
    label: "Execution",
    detail: "Dispatched to the runtime once activation and boundary gates pass.",
  },
  {
    id: "audit",
    label: "Audit",
    detail: "Recorded to the immutable audit and event log for full traceability.",
  },
];
