import { notFound } from "next/navigation";
import { CoreDetail } from "@/components/architecture/core-detail";
import { coreById } from "@/features/architecture/mock";

export default function ExecutionCorePage() {
  const core = coreById("execution");
  if (!core) notFound();

  return (
    <CoreDetail
      core={core}
      flowTitle="Plan → Context → Memory → Model → Tools → Runtime → Graph → Recovery"
      flow={[
        { id: "plan", label: "Plan", kind: "cognitive", detail: "Assigned plan from Cognitive Core." },
        { id: "context", label: "Context Engine", kind: "execution", detail: "Assemble + rank + compress." },
        { id: "memory", label: "Memory Engine", kind: "execution", detail: "Read relevant memory tiers." },
        { id: "model", label: "Model Router", kind: "execution", detail: "Select model per call." },
        { id: "tools", label: "Tool Orchestrator", kind: "execution", detail: "Invoke tools with permission + sandbox." },
        { id: "runtime", label: "Agent Runtime", kind: "execution", detail: "Execute + checkpoint." },
        { id: "graph", label: "Execution Graph", kind: "execution", detail: "Live node/edge tracking." },
        { id: "recovery", label: "Failure Recovery → Execution Registry", kind: "execution", detail: "Recover, then persist outcome." },
      ]}
      registryIds={["execution"]}
    />
  );
}
