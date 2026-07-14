"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { BrainCircuit } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSnapshot, subscribe } from "@/features/agent-crud";
import {
  getNodeSnapshot,
  getRelationshipSnapshot,
  subscribeNodes,
  subscribeRelationships,
} from "@/features/knowledge-crud";
import {
  getSnapshot as getMemorySnapshot,
  subscribe as subscribeMemory,
} from "@/features/memory-crud";
import { buildAgentContext } from "@/features/agent-context";
import type { ContextHealthLabel } from "@/features/agent-context";
import type { MemoryImportance } from "@/features/memory-crud";

const importanceVariant: Record<MemoryImportance, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const healthVariant: Record<ContextHealthLabel, BadgeVariant> = {
  strong: "success",
  moderate: "info",
  weak: "warning",
  empty: "neutral",
};

const selectClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong";

/** Re-run when agents, memories, knowledge nodes, or relationships change. */
function subscribeAll(callback: () => void): () => void {
  const unsubs = [
    subscribe(callback),
    subscribeMemory(callback),
    subscribeNodes(callback),
    subscribeRelationships(callback),
  ];
  return () => unsubs.forEach((unsub) => unsub());
}

function storeVersion(): string {
  return `${getSnapshot().length}:${getMemorySnapshot().length}:${getNodeSnapshot().length}:${getRelationshipSnapshot().length}`;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-surface-sunken p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function AgentContextPanel() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);
  const agents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.lifecycleStatus === "active"),
    [agents]
  );

  const [agentId, setAgentId] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const selectedId = agentId || activeAgents[0]?.id || "";
  const agent = useMemo(
    () => activeAgents.find((a) => a.id === selectedId),
    [activeAgents, selectedId]
  );

  const pkg = useMemo(() => {
    // `version` gates recomputation when any upstream store mutates.
    void version;
    return agent ? buildAgentContext(agent, { agentId: agent.id }) : null;
  }, [agent, version]);

  if (!agent || !pkg) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Context</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-fg-muted">No active agent to build context for.</p>
        </CardContent>
      </Card>
    );
  }

  const { report, context } = pkg;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <BrainCircuit className="size-4 text-primary" />
              Agent Context
            </span>
          </CardTitle>
          <span className="text-xs text-fg-muted">
            Deterministic Context Package via Memory Engine · read only · no LLM
          </span>
        </div>
        <Badge variant={healthVariant[report.contextHealthLabel]}>
          Context Health {report.contextHealth} · {report.contextHealthLabel}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Agent
            </label>
            <select
              className={selectClass}
              value={selectedId}
              onChange={(e) => setAgentId(e.target.value)}
            >
              {activeAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.department}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex items-end">
            <p className="text-xs text-fg-secondary">
              {agent.name} · {agent.role} · {agent.department} · anchors:{" "}
              <span className="font-mono">
                {[pkg.engineRequest.agent, pkg.engineRequest.department]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </p>
          </div>
        </div>

        {/* Retrieval statistics */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <Metric label="Retrieved Memories" value={report.retrievedMemories} />
          <Metric label="Knowledge Nodes" value={report.knowledgeNodes} />
          <Metric label="Relationships" value={report.relationships} />
          <Metric label="Related Memories" value={report.relatedMemories} />
          <Metric label="Avg Confidence" value={report.averageConfidence} />
          <Metric label="Avg Importance" value={report.averageImportance} />
          <Metric label="Coverage" value={`${Math.round(report.knowledgeCoverage * 100)}%`} />
          <Metric label="Context Health" value={report.contextHealth} />
          <Metric label="Retrieval Time" value={mounted ? `${report.retrievalTimeMs}ms` : "—"} />
        </div>

        {/* Retrieved memories */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Retrieved Memories (ranked)
          </p>
          {context.memories.length === 0 && (
            <p className="text-sm text-fg-muted">No memories retrieved for this agent.</p>
          )}
          {context.memories.map((entry) => (
            <div
              key={entry.record.id}
              className="flex flex-col gap-1 rounded-md border bg-surface-sunken p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-fg">{entry.record.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={importanceVariant[entry.record.importance]}>
                    {entry.record.importance}
                  </Badge>
                  <Badge variant="neutral">score {entry.score}</Badge>
                </div>
              </div>
              <p className="font-mono text-xs text-fg-muted">
                {entry.record.id} · {entry.record.ownerType}:{entry.record.ownerId} ·{" "}
                {entry.record.memoryType} · conf {entry.record.confidence}
              </p>
              <p className="text-xs text-fg-secondary">{entry.record.summary}</p>
            </div>
          ))}
        </div>

        {/* Knowledge linkage */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Linked Knowledge Nodes ({context.knowledgeNodes.length})
            </p>
            {context.knowledgeNodes.slice(0, 8).map((entry) => (
              <div key={entry.node.id} className="rounded-md border bg-surface-sunken p-2 text-xs">
                <span className="font-medium text-fg">{entry.node.title}</span>
                <span className="ml-1 text-fg-muted">
                  {entry.node.nodeType} · via {entry.via.join(", ")}
                </span>
              </div>
            ))}
            {context.knowledgeNodes.length === 0 && (
              <p className="text-xs text-fg-muted">None linked.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Relationships ({context.relationships.length})
            </p>
            {context.relationships.slice(0, 8).map((entry) => (
              <div key={entry.relationship.id} className="rounded-md border bg-surface-sunken p-2 text-xs">
                <span className="font-mono text-fg-secondary">{entry.anchorNode}</span>
                <span className="mx-1 text-primary">{entry.relationship.relationshipType}</span>
                <span className="font-mono text-fg-secondary">{entry.neighborNode}</span>
              </div>
            ))}
            {context.relationships.length === 0 && (
              <p className="text-xs text-fg-muted">None linked.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Related Memories ({context.relatedMemories.length})
            </p>
            {context.relatedMemories.slice(0, 8).map((entry) => (
              <div key={entry.record.id} className="rounded-md border bg-surface-sunken p-2 text-xs">
                <span className="font-medium text-fg">{entry.record.title}</span>
                <span className="ml-1 text-fg-muted">via {entry.viaNodes.length} node(s)</span>
              </div>
            ))}
            {context.relatedMemories.length === 0 && (
              <p className="text-xs text-fg-muted">None linked.</p>
            )}
          </div>
        </div>

        <p className="text-xs text-fg-muted">
          Confidence avg {context.confidence.averageConfidence} (min{" "}
          {context.confidence.minConfidence}, max {context.confidence.maxConfidence}) · importance
          score {context.confidence.averageImportanceScore} · top{" "}
          {context.summary.topMemoryTitle} ({context.summary.topScore})
        </p>
      </CardContent>
    </Card>
  );
}
