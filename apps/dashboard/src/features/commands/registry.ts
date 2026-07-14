/*
 * Command Registry.
 *
 * Every command registers its own definition here. The dispatcher is generic and
 * never hardcodes command behavior — it reads validation, approval and simulation
 * from the registry. Future modules register new commands without touching the
 * dispatcher.
 */

import type { CommandType } from "./pipeline";
import type { StageResult } from "./types";

export interface CommandDefinition {
  type: CommandType;
  label: string;
  /** Owning domain, e.g. "Agents", "Legal". */
  domain: string;
  /** Whether the command must pass the Director / governance approval gate. */
  requiresApproval: boolean;
  /** Deterministic precondition check. */
  validate: (payload: Record<string, unknown>) => StageResult;
  /** Deterministic offline simulation — never touches a provider. */
  simulate: (payload: Record<string, unknown>) => { result: string; steps: string[] };
}

const registry = new Map<CommandType, CommandDefinition>();

export function registerCommand(def: CommandDefinition): void {
  registry.set(def.type, def);
}

export function getCommandDefinition(type: CommandType): CommandDefinition | undefined {
  return registry.get(type);
}

export function listCommandDefinitions(): CommandDefinition[] {
  return [...registry.values()];
}

/* Default deterministic validation — a command is valid when it is registered
 * and carries a payload. */
function defaultValidate(payload: Record<string, unknown>): StageResult {
  const hasPayload = Object.keys(payload).length > 0;
  return hasPayload
    ? { status: "passed", detail: "Payload present, preconditions satisfied." }
    : { status: "passed", detail: "No payload required for this command." };
}

interface RegistrationSpec {
  type: CommandType;
  label: string;
  domain: string;
  requiresApproval: boolean;
  result: string;
  steps: string[];
}

/* Register a command with a deterministic simulation result. */
function register(spec: RegistrationSpec): void {
  registerCommand({
    type: spec.type,
    label: spec.label,
    domain: spec.domain,
    requiresApproval: spec.requiresApproval,
    validate: defaultValidate,
    simulate: () => ({ result: spec.result, steps: spec.steps }),
  });
}

/* ── Registered commands ─────────────────────────────────────────── */

register({
  type: "agent.create",
  label: "Create Agent",
  domain: "Agents",
  requiresApproval: false,
  result: "Simulated a new agent registration — role, department and boundaries validated.",
  steps: ["Draft agent profile", "Assign department", "Bind capability set", "Reserve agent id"],
});

register({
  type: "agent.update",
  label: "Update Agent",
  domain: "Agents",
  requiresApproval: false,
  result: "Simulated agent update — profile, ownership and operating metadata revised.",
  steps: ["Load current agent", "Apply updates", "Persist in store"],
});

register({
  type: "agent.archive",
  label: "Archive Agent",
  domain: "Agents",
  requiresApproval: false,
  result: "Simulated agent archive — record retained and marked archived.",
  steps: ["Load agent", "Set archived status", "Persist in store"],
});

register({
  type: "agent.restore",
  label: "Restore Agent",
  domain: "Agents",
  requiresApproval: false,
  result: "Simulated agent restore — archived or deleted record returned to active.",
  steps: ["Load agent", "Set active status", "Persist in store"],
});

register({
  type: "agent.delete",
  label: "Delete Agent",
  domain: "Agents",
  requiresApproval: false,
  result: "Simulated soft delete — agent record flagged deleted, never removed.",
  steps: ["Load agent", "Set deleted flag", "Persist in store"],
});

register({
  type: "memory.create",
  label: "Create Memory",
  domain: "Memory",
  requiresApproval: false,
  result: "Simulated memory registration — owner, type, and summary staged in the in-memory store.",
  steps: ["Validate ownership", "Build memory record", "Insert into store"],
});

register({
  type: "memory.update",
  label: "Update Memory",
  domain: "Memory",
  requiresApproval: false,
  result: "Simulated memory update — metadata, owner, and summary revised.",
  steps: ["Load current memory", "Apply updates", "Persist in store"],
});

register({
  type: "memory.archive",
  label: "Archive Memory",
  domain: "Memory",
  requiresApproval: false,
  result: "Simulated memory archive — record retained and marked archived.",
  steps: ["Load memory", "Set archived status", "Persist in store"],
});

register({
  type: "memory.restore",
  label: "Restore Memory",
  domain: "Memory",
  requiresApproval: false,
  result: "Simulated memory restore — archived or deleted record returned to active.",
  steps: ["Load memory", "Set active status", "Persist in store"],
});

register({
  type: "memory.delete",
  label: "Delete Memory",
  domain: "Memory",
  requiresApproval: false,
  result: "Simulated soft delete — memory record flagged deleted, never removed.",
  steps: ["Load memory", "Set deleted flag", "Persist in store"],
});

register({
  type: "workflow.create",
  label: "New Workflow",
  domain: "Workflows",
  requiresApproval: false,
  result: "Simulated workflow definition — steps, dependencies and triggers resolved.",
  steps: ["Compose steps", "Resolve dependencies", "Attach triggers", "Reserve workflow id"],
});

register({
  type: "workflow.update",
  label: "Update Workflow",
  domain: "Workflows",
  requiresApproval: false,
  result: "Simulated workflow update — metadata, steps and dependencies revised.",
  steps: ["Load current workflow", "Apply updates", "Persist in store"],
});

register({
  type: "workflow.archive",
  label: "Archive Workflow",
  domain: "Workflows",
  requiresApproval: false,
  result: "Simulated workflow archive — record retained and marked archived.",
  steps: ["Load workflow", "Set archived status", "Persist in store"],
});

register({
  type: "workflow.restore",
  label: "Restore Workflow",
  domain: "Workflows",
  requiresApproval: false,
  result: "Simulated workflow restore — archived or deleted record returned to active.",
  steps: ["Load workflow", "Set active status", "Persist in store"],
});

register({
  type: "workflow.delete",
  label: "Delete Workflow",
  domain: "Workflows",
  requiresApproval: false,
  result: "Simulated soft delete — workflow record flagged deleted, never removed.",
  steps: ["Load workflow", "Set deleted flag", "Persist in store"],
});

register({
  type: "integration.add",
  label: "Add Integration",
  domain: "Integrations",
  requiresApproval: true,
  result: "Simulated integration connection — provider and scopes staged, no credentials stored.",
  steps: ["Select provider", "Stage scopes", "Prepare credential slot", "Reserve integration id"],
});

register({
  type: "document.create",
  label: "New Document",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated knowledge document — ownership and tags assigned.",
  steps: ["Create document shell", "Assign owner", "Apply tags"],
});

register({
  type: "job.post",
  label: "Post a Job",
  domain: "HR",
  requiresApproval: true,
  result: "Simulated job requisition — role opened into the recruiting pipeline.",
  steps: ["Draft requisition", "Set department", "Open pipeline stage"],
});

register({
  type: "invoice.create",
  label: "New Invoice",
  domain: "Finance",
  requiresApproval: true,
  result: "Simulated invoice draft — customer, line items and due date staged.",
  steps: ["Create invoice draft", "Attach line items", "Set due date"],
});

register({
  type: "contract.create",
  label: "New Contract",
  domain: "Legal",
  requiresApproval: true,
  result: "Simulated contract — parties, terms and review workflow staged.",
  steps: ["Create contract shell", "Set parties", "Route to review"],
});

register({
  type: "contract.generate",
  label: "Generate Draft",
  domain: "Legal",
  requiresApproval: true,
  result: "Simulated contract draft generated from template and structured inputs.",
  steps: ["Select template", "Merge inputs", "Produce draft"],
});

register({
  type: "policy.create",
  label: "New Policy",
  domain: "Legal",
  requiresApproval: true,
  result: "Simulated policy — authored and routed for governance review.",
  steps: ["Draft policy", "Version it", "Route for review"],
});

register({
  type: "approval.approve",
  label: "Approve",
  domain: "Governance",
  requiresApproval: false,
  result: "Simulated approval decision — item released into execution.",
  steps: ["Record decision", "Release for execution", "Notify requester"],
});

register({
  type: "approval.reject",
  label: "Reject",
  domain: "Governance",
  requiresApproval: false,
  result: "Simulated rejection decision — item returned to requester.",
  steps: ["Record decision", "Return to requester", "Close item"],
});

register({
  type: "report.view",
  label: "Run Report",
  domain: "Reports",
  requiresApproval: false,
  result: "Simulated report run — export prepared offline.",
  steps: ["Gather report inputs", "Render report", "Prepare export"],
});

register({
  type: "registry.create",
  label: "Create Registry",
  domain: "Registries",
  requiresApproval: false,
  result: "Simulated registry creation — record staged in the in-memory store.",
  steps: ["Validate uniqueness", "Build record", "Insert into store"],
});

register({
  type: "registry.update",
  label: "Update Registry",
  domain: "Registries",
  requiresApproval: false,
  result: "Simulated registry update — record fields revised in the in-memory store.",
  steps: ["Load current record", "Apply changes", "Persist to store"],
});

register({
  type: "registry.archive",
  label: "Archive Registry",
  domain: "Registries",
  requiresApproval: false,
  result: "Simulated registry archive — record marked archived, retained.",
  steps: ["Load record", "Set archived status", "Persist to store"],
});

register({
  type: "registry.restore",
  label: "Restore Registry",
  domain: "Registries",
  requiresApproval: false,
  result: "Simulated registry restore — archived record returned to active.",
  steps: ["Load archived record", "Set active status", "Persist to store"],
});

register({
  type: "registry.delete",
  label: "Delete Registry",
  domain: "Registries",
  requiresApproval: false,
  result: "Simulated soft delete — record flagged deleted, never removed.",
  steps: ["Load record", "Set deleted flag", "Persist to store"],
});

register({
  type: "knowledge.create",
  label: "Create Knowledge Node",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated knowledge node creation — node staged in the in-memory store.",
  steps: ["Validate uniqueness", "Build node", "Insert into store"],
});

register({
  type: "knowledge.update",
  label: "Update Knowledge Node",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated knowledge node update — fields revised in the in-memory store.",
  steps: ["Load current node", "Apply changes", "Persist to store"],
});

register({
  type: "knowledge.archive",
  label: "Archive Knowledge Node",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated knowledge node archive — node retained and marked archived.",
  steps: ["Load node", "Set archived status", "Persist to store"],
});

register({
  type: "knowledge.restore",
  label: "Restore Knowledge Node",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated knowledge node restore — archived or deleted node returned to active.",
  steps: ["Load node", "Set active status", "Persist to store"],
});

register({
  type: "knowledge.delete",
  label: "Delete Knowledge Node",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated soft delete — knowledge node flagged deleted, never removed.",
  steps: ["Load node", "Set deleted flag", "Persist to store"],
});

register({
  type: "relationship.create",
  label: "Create Relationship",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated relationship creation — typed edge staged between two nodes.",
  steps: ["Validate source and target", "Build edge", "Insert into store"],
});

register({
  type: "relationship.update",
  label: "Update Relationship",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated relationship update — type and weight revised.",
  steps: ["Load edge", "Apply changes", "Persist to store"],
});

register({
  type: "relationship.delete",
  label: "Delete Relationship",
  domain: "Knowledge",
  requiresApproval: false,
  result: "Simulated soft delete — relationship flagged deleted, never removed.",
  steps: ["Load edge", "Set deleted flag", "Persist to store"],
});
