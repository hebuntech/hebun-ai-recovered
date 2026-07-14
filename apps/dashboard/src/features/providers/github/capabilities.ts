import type { GitHubCapabilityMapping } from "@/features/providers/github/types";

export const githubCapabilityMappings: GitHubCapabilityMapping[] = [
  {
    github: "repository inspection",
    framework: "Repository",
    description:
      "Repository inspection is represented as deterministic repository context interpretation with no live repository access.",
  },
  {
    github: "branch analysis",
    framework: "Repository",
    description:
      "Branch analysis is reduced to simulated branch state and governance posture evaluation only.",
  },
  {
    github: "commit analysis",
    framework: "Repository",
    description:
      "Commit analysis uses static commit fixtures and risk summaries rather than real Git history.",
  },
  {
    github: "pull request analysis",
    framework: "Repository",
    description:
      "Pull request analysis is modeled through deterministic review, approval, and merge-readiness fixtures.",
  },
  {
    github: "pull request planning",
    framework: "Human Approval",
    description:
      "Pull request planning produces review checkpoints and approval sequencing without creating a pull request.",
  },
  {
    github: "issue analysis",
    framework: "Search",
    description:
      "Issue analysis interprets simulated issue metadata and escalation posture only.",
  },
  {
    github: "issue triage",
    framework: "Human Approval",
    description:
      "Issue triage becomes an offline prioritization and routing recommendation surface.",
  },
  {
    github: "code review context",
    framework: "File System",
    description:
      "Code review context is represented as static review summaries and affected-scope notes with no diff mutation.",
  },
  {
    github: "workflow status analysis",
    framework: "Search",
    description:
      "Workflow status analysis reads deterministic pipeline status fixtures and warning states only.",
  },
  {
    github: "release planning",
    framework: "Human Approval",
    description:
      "Release planning is expressed as staged release notes and governance checkpoints in simulation mode.",
  },
  {
    github: "repository governance",
    framework: "Human Approval",
    description:
      "Repository governance maps to policy and protection interpretation rather than enforcement.",
  },
  {
    github: "security alert review",
    framework: "Search",
    description:
      "Security alert review is simulated as deterministic alert summarization and prioritization only.",
  },
];
