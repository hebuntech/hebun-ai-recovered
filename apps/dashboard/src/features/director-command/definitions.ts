import type { DirectorCommandDefinition } from "./types";
import { deepFreeze } from "./validation";

export const COMMAND_DEFINITION_VERSION = "1.0.0";

/**
 * The declared Director commands.
 *
 * Each entry is inert data describing what a command would mean. None of them
 * can run: there is no executor, and definitions carry no behaviour.
 */
export const DIRECTOR_COMMAND_DEFINITIONS: readonly DirectorCommandDefinition[] = deepFreeze([
  {
    commandId: "agent.restart",
    version: COMMAND_DEFINITION_VERSION,
    label: "Restart Agent",
    description: "Restart an active agent so it resumes from a clean runtime state.",
    category: "lifecycle",
    risk: "high",
    targetSectionId: "active-agents",
    permission: { capability: "agent.lifecycle", minimumPrivilege: "high", requiresApproval: true },
    executable: false,
  },
  {
    commandId: "workflow.retry",
    version: COMMAND_DEFINITION_VERSION,
    label: "Retry Workflow",
    description: "Re-run a workflow that finished in a failed state.",
    category: "recovery",
    risk: "high",
    targetSectionId: "active-workflows",
    permission: { capability: "workflow.recovery", minimumPrivilege: "high", requiresApproval: true },
    executable: false,
  },
  {
    commandId: "workflow.pause",
    version: COMMAND_DEFINITION_VERSION,
    label: "Pause Workflow",
    description: "Hold a running workflow at its current step without cancelling it.",
    category: "lifecycle",
    risk: "medium",
    targetSectionId: "active-workflows",
    permission: { capability: "workflow.lifecycle", minimumPrivilege: "medium", requiresApproval: true },
    executable: false,
  },
  {
    commandId: "workflow.resume",
    version: COMMAND_DEFINITION_VERSION,
    label: "Resume Workflow",
    description: "Release a paused workflow so it continues from where it stopped.",
    category: "lifecycle",
    risk: "medium",
    targetSectionId: "active-workflows",
    permission: { capability: "workflow.lifecycle", minimumPrivilege: "medium", requiresApproval: false },
    executable: false,
  },
  {
    commandId: "diagnostics.re-evaluate",
    version: COMMAND_DEFINITION_VERSION,
    label: "Re-evaluate Diagnostics",
    description: "Rebuild diagnostics projections from the signals already collected.",
    category: "observability",
    risk: "low",
    targetSectionId: "diagnostics-summary",
    permission: { capability: "observability.reevaluate", minimumPrivilege: "baseline", requiresApproval: false },
    executable: false,
  },
  {
    commandId: "monitoring.refresh",
    version: COMMAND_DEFINITION_VERSION,
    label: "Refresh Monitoring",
    description: "Recompute monitoring aggregates from the signals already collected.",
    category: "observability",
    risk: "low",
    targetSectionId: "monitoring-summary",
    permission: { capability: "observability.reevaluate", minimumPrivilege: "baseline", requiresApproval: false },
    executable: false,
  },
]);
