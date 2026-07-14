import { notFound } from "next/navigation";
import { CoreDetail } from "@/components/architecture/core-detail";
import { coreById } from "@/features/architecture/mock";

export default function CognitiveCorePage() {
  const core = coreById("cognitive");
  if (!core) notFound();

  return (
    <CoreDetail
      core={core}
      flowTitle="Business Signal → Reasoning → Goal → Plan → Organization"
      flow={[
        { id: "signal", label: "Business Signal", kind: "signal", detail: "Event, metric or Director request." },
        { id: "reasoning", label: "Executive Reasoning", kind: "cognitive", detail: "Decision recommendation." },
        { id: "goal", label: "Goal Formation → Goal Registry", kind: "cognitive", detail: "Validated goal created." },
        { id: "prioritization", label: "Goal Prioritization", kind: "cognitive", detail: "Ranked against active goals." },
        { id: "plan", label: "Planning Engine → Plan Registry", kind: "cognitive", detail: "Objectives + tasks + graph." },
        { id: "org", label: "Organization Planner", kind: "cognitive", detail: "Assigned to departments and agents." },
      ]}
      registryIds={["goal", "plan"]}
    />
  );
}
