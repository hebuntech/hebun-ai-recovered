import { governanceResults } from "@/features/policy";
import type { GovernanceResult } from "@/features/policy";

const candidates = governanceResults.filter(
  (result) => result.governanceDecision.status !== "blocked"
);

export const governanceInputsForPlanning: GovernanceResult[] =
  candidates.length > 0 ? candidates : governanceResults.slice(0, 1);
