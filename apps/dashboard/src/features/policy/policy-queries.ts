import { governanceResults } from "@/features/policy/governance-pipeline";

export function latestGovernanceResult() {
  return governanceResults[0];
}
