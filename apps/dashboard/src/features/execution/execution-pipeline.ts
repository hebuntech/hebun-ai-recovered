import { orchestrationBlueprints } from "@/features/orchestration";
import { createExecutionSession } from "@/features/execution/execution-session";
import type { ExecutionPipelineStep, ExecutionSession } from "@/features/execution/types";

export const executionPipelineSteps: ExecutionPipelineStep[] = [
  { id: "receive-blueprint", label: "Receive Orchestration Blueprint", description: "Use the orchestration blueprint as the execution runtime input." },
  { id: "validate-readiness", label: "Validate Execution Readiness", description: "Check approvals, assignment integrity, fallback coverage, and structural blockers." },
  { id: "create-session", label: "Create Execution Session", description: "Create a provider-independent execution session with traceable references." },
  { id: "allocate-executors", label: "Allocate Executors", description: "Allocate abstract agent, human, external, or simulation executors without adapters." },
  { id: "dispatch", label: "Dispatch Execution Requests", description: "Emit deterministic dispatch instructions to abstract executors only." },
  { id: "track-state", label: "Track Execution State", description: "Track lifecycle state, progress, and task movement." },
  { id: "monitor", label: "Monitor Progress", description: "Monitor completion rate, wait states, and recovery conditions." },
  { id: "retry", label: "Handle Retries", description: "Apply bounded retry behavior without provider-specific execution logic." },
  { id: "timeout", label: "Handle Timeouts", description: "Close sessions that exceed deterministic time windows." },
  { id: "failure", label: "Handle Failures", description: "Preserve explainable failure traces and downstream recovery hooks." },
  { id: "rollback", label: "Handle Rollbacks", description: "Use rollback checkpoints carried forward from planning." },
  { id: "cancellation", label: "Handle Cancellation", description: "Cancel sessions cleanly while preserving references and auditability." },
  { id: "summary", label: "Produce Execution Summary", description: "Produce the execution outcome, next step, and explanation." },
  { id: "telemetry", label: "Emit Telemetry", description: "Emit deterministic telemetry for duration, retries, failures, and completion." },
];

export const executionSessions: ExecutionSession[] =
  orchestrationBlueprints.map(createExecutionSession);
