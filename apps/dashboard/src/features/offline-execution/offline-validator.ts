import type {
  OfflineExecutionSession,
  OfflineValidation,
} from "@/features/offline-execution/types";

export function validateSession(
  session: OfflineExecutionSession
): OfflineValidation {
  const issues: string[] = [];

  if (session.tasks.length === 0) issues.push("Session has no tasks.");
  if (session.tasks.some((task) => !task.traceable)) {
    issues.push("Every task must preserve end-to-end traceability.");
  }
  if (session.tasks.some((task) => !task.simulationEnforced)) {
    issues.push("Simulation must be enforced for every task.");
  }
  if (session.tasks.some((task) => task.runtimeMode === "Future Live")) {
    issues.push("Future Live runtime must remain blocked.");
  }
  if (session.simulatedResults.length !== session.tasks.length) {
    issues.push("Every task must produce one simulated result.");
  }
  if (session.auditTrail.length === 0) issues.push("Audit trail is required.");

  return { sessionId: session.id, valid: issues.length === 0, issues };
}
