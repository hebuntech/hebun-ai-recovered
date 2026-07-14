import { executionSessions } from "@/features/execution/execution-pipeline";
import { orchestrationBlueprints } from "@/features/orchestration";

export const orchestrationInputsForExecution = orchestrationBlueprints;

export function runExecutionEngine() {
  return executionSessions;
}
