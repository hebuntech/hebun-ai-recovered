import { notFound } from "next/navigation";
import { CoreDetail } from "@/components/architecture/core-detail";
import { coreById } from "@/features/architecture/mock";

export default function IntelligenceCorePage() {
  const core = coreById("intelligence");
  if (!core) notFound();

  return (
    <CoreDetail
      core={core}
      flowTitle="Execution → Observability → Reflection → Experience → Pattern → Recommendation → Improvement"
      flow={[
        { id: "execution", label: "Execution", kind: "execution", detail: "Execution Registry output." },
        { id: "observability", label: "Observability Platform", kind: "intelligence", detail: "Logs · metrics · traces · health · cost." },
        { id: "reflection", label: "Reflection", kind: "intelligence", detail: "Evaluate outcome." },
        { id: "experience", label: "Experience Registry", kind: "intelligence", detail: "Store the lesson learned." },
        { id: "pattern", label: "Pattern Discovery", kind: "intelligence", detail: "Patterns, trends, correlations." },
        { id: "recommendation", label: "Recommendation Engine", kind: "intelligence", detail: "Scored recommendations." },
        { id: "improvement", label: "Continuous Improvement", kind: "intelligence", detail: "Experiment, A/B, rollout." },
      ]}
      registryIds={["experience", "learning"]}
    />
  );
}
