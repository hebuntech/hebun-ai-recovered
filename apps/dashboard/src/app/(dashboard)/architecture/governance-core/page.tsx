import { notFound } from "next/navigation";
import { CoreDetail } from "@/components/architecture/core-detail";
import { coreById } from "@/features/architecture/mock";

export default function GovernanceCorePage() {
  const core = coreById("governance");
  if (!core) notFound();

  return (
    <CoreDetail
      core={core}
      flowTitle="Planning Gate → Execution Gate → Learning Gate → Production Gate"
      flow={[
        { id: "planning-gate", label: "Planning Gate", kind: "governance", detail: "Plan checked before execution." },
        { id: "execution-gate", label: "Execution Gate", kind: "governance", detail: "Permission + policy before each node." },
        { id: "learning-gate", label: "Learning Gate", kind: "governance", detail: "Recommendation to approval." },
        { id: "production-gate", label: "Production Gate", kind: "governance", detail: "Prod change → controlled rollout." },
      ]}
      registryIds={["governance", "risk"]}
    />
  );
}
