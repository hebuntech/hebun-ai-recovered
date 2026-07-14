import { BrainCircuit } from "lucide-react";
import { AgentContextOverview } from "@/components/agent-context/agent-context-overview";
import { ExecutiveReasoningOverview } from "@/components/agent-reasoning/executive-reasoning-overview";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { listAll } from "@/features/agent-crud";

export default function DirectorAgentsPage() {
  const active = listAll().filter((agent) => agent.lifecycleStatus === "active").length;

  return (
    <>
      <PageHeader
        title="Agent Context"
        context="Read-only view of every agent's deterministic Context Package, sourced from the Memory Engine."
        action={<Badge variant="success">{active} active agents</Badge>}
      />

      <div className="mb-6 flex items-center gap-2 text-sm text-fg-secondary">
        <BrainCircuit className="size-4 text-primary" />
        Each agent requests context through the Memory Engine — no direct memory access, no LLM.
      </div>

      <div className="flex flex-col gap-6">
        <ExecutiveReasoningOverview />
        <AgentContextOverview />
      </div>
    </>
  );
}
