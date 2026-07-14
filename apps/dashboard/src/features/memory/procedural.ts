import {
  buildMemoryRecord,
  deriveTimestamp,
  firstActiveRecord,
  importanceFromHealth,
  nodeForRecord,
  statusFromHealth,
} from "@/features/memory/memory-builder";
import type { MemoryRecord } from "@/features/memory/types";

const workflow = firstActiveRecord("workflows");
const capability = firstActiveRecord("capabilities");
const governance = firstActiveRecord("governance");

const workflowNodeId = nodeForRecord("workflows", workflow.id)?.id ?? "";
const capabilityNodeId = nodeForRecord("capabilities", capability.id)?.id ?? "";
const governanceNodeId = nodeForRecord("governance", governance.id)?.id ?? "";

export const proceduralMemories: MemoryRecord[] = [
  buildMemoryRecord({
    id: "mem-pr-1",
    category: "procedural",
    title: "Contract review workflow is preserved as a reusable operating procedure",
    summary:
      "A live contract review process is retained as procedural memory for repeatable legal operations.",
    whatHappened:
      `${workflow.name} was updated and preserved as a reusable execution path rather than only a one-off workflow event.`,
    whyItHappened:
      "The company benefits from reusing working approval and review flows instead of rebuilding them from scratch.",
    whoWasInvolved: [workflow.owner, "Legal", "Governance Core"],
    whatChanged: workflow.change,
    reusableLater:
      "Reuse this memory as an SOP template for high-trust document review and approval workflows.",
    owner: workflow.owner,
    timestamp: deriveTimestamp(workflow, "2026-06", 5),
    registryIds: ["workflows", "agents", "governance"],
    graphNodeIds: [workflowNodeId].filter(Boolean),
    involvedEntities: ["Legal"],
    status: statusFromHealth(workflow.health),
    importance: importanceFromHealth(workflow.health),
    tags: ["procedure", "workflow", "legal"],
  }),
  buildMemoryRecord({
    id: "mem-pr-2",
    category: "procedural",
    title: "Contract risk scoring capability is remembered as an operational playbook",
    summary:
      "A capability-level process is preserved so teams can reuse how risk scoring should run and be governed.",
    whatHappened:
      `${capability.name} remained active with threshold adjustments that matter for future reuse.`,
    whyItHappened:
      "Capability procedures need to survive beyond specific runs so they can be adopted consistently.",
    whoWasInvolved: [capability.owner, "Legal", "Governance Core"],
    whatChanged: capability.change,
    reusableLater:
      "Reuse this memory when provisioning new contract or approval scoring procedures.",
    owner: capability.owner,
    timestamp: deriveTimestamp(capability, "2026-06", 9),
    registryIds: ["capabilities", "models", "tools"],
    graphNodeIds: [capabilityNodeId].filter(Boolean),
    involvedEntities: ["Legal"],
    status: statusFromHealth(capability.health),
    importance: importanceFromHealth(capability.health),
    tags: ["playbook", "capability", "risk-scoring"],
  }),
  buildMemoryRecord({
    id: "mem-pr-3",
    category: "procedural",
    title: "Approval lineage set defines a reusable approval flow",
    summary:
      "A governance artifact is preserved as procedural memory for how approvals should be linked, traced, and reviewed.",
    whatHappened:
      `${governance.name} captured the operating shape of approval lineage and evidence handling.`,
    whyItHappened:
      "Approval flows become more reliable when the company remembers the control path that worked.",
    whoWasInvolved: [governance.owner, "Director", "Audit"],
    whatChanged: governance.change,
    reusableLater:
      "Reuse this memory when future approval systems need lineage and evidence requirements.",
    owner: governance.owner,
    timestamp: deriveTimestamp(governance, "2026-06", 14),
    registryIds: ["governance", "executions", "events"],
    graphNodeIds: [governanceNodeId].filter(Boolean),
    involvedEntities: ["Audit"],
    status: statusFromHealth(governance.health),
    importance: importanceFromHealth(governance.health),
    tags: ["approval-flow", "procedure", "lineage"],
  }),
];
