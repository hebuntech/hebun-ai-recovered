import { buildGeneratedPlan } from "@/features/planning/plan-builder";
import { governanceInputsForPlanning } from "@/features/planning/planning-engine";
import type { GeneratedPlan, PlanningPipelineStep } from "@/features/planning/types";

export const planningPipelineSteps: PlanningPipelineStep[] = [
  { id: "approved-governance", label: "Receive Approved Governance Decision", description: "Use deterministic governance output as the entry point for planning." },
  { id: "load-goal", label: "Load Related Goal", description: "Attach the most relevant goal registry object." },
  { id: "decompose-goal", label: "Decompose Goal", description: "Translate the goal into planning drivers and owned work." },
  { id: "generate-tasks", label: "Generate Tasks", description: "Create deterministic planning tasks from the approved decision." },
  { id: "build-dependencies", label: "Build Dependencies", description: "Make task ordering and blockers explicit." },
  { id: "allocate-resources", label: "Allocate Resources", description: "Reference existing people, agents, tools, workflows, models, and capabilities." },
  { id: "estimate-capacity", label: "Estimate Capacity", description: "Forecast effort, time, and utilization." },
  { id: "build-timeline", label: "Build Timeline", description: "Sequence the work into an explainable timeline." },
  { id: "milestones", label: "Create Milestones", description: "Add director-level checkpoints for tracking progress." },
  { id: "planning-risks", label: "Evaluate Planning Risks", description: "Preserve planning risk and mitigation signals before execution exists." },
  { id: "success-criteria", label: "Define Success Criteria", description: "Make completion explicit and auditable." },
  { id: "blueprint", label: "Generate Execution Blueprint", description: "Produce a reusable, future-executable blueprint without running anything." },
];

export const generatedPlans: GeneratedPlan[] = governanceInputsForPlanning.map(
  buildGeneratedPlan
);
