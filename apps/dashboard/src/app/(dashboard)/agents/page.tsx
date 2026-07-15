import { PageHeader } from "@/components/layout/page-header";
import { CommandAction } from "@/components/command/command-action";
import { AgentRegistryWorkspace } from "@/components/agents/agent-registry-workspace";
import { AgentContextPanel } from "@/components/agent-context/agent-context-panel";
import { AgentReasoningPanel } from "@/components/agent-reasoning/agent-reasoning-panel";
import { TaskPlanningPanel } from "@/components/task-planning/task-planning-panel";
import { ExecutionQueuePanel } from "@/components/execution-queue/execution-queue-panel";
import { AgentRegistry } from "@/features/agent-runtime";

export default function AgentsPage() {
  const agents = AgentRegistry.listAgents();

  return (
    <>
      <PageHeader
        title="Agents"
        context={`${agents.length} digital employees registered`}
        action={
          <CommandAction
            label="Create Agent"
            commandType="agent.create"
            summary="Register a new digital employee — role, department, capabilities, and operating boundaries."
          />
        }
      />
      <div className="mb-6">
        <AgentContextPanel />
      </div>
      <div className="mb-6">
        <AgentReasoningPanel />
      </div>
      <div className="mb-6">
        <TaskPlanningPanel />
      </div>
      <div className="mb-6">
        <ExecutionQueuePanel />
      </div>
      <AgentRegistryWorkspace />
    </>
  );
}
