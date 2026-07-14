"use client";

import { useMemo, useSyncExternalStore } from "react";
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
import { getActiveAgentContexts } from "@/features/agent-context";
import type { ContextHealthLabel } from "@/features/agent-context";

const healthVariant: Record<ContextHealthLabel, BadgeVariant> = {
  strong: "success",
  moderate: "info",
  weak: "warning",
  empty: "neutral",
};

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

/**
 * Read-only Director overview. References the same Agent Context Packages the
 * agent page uses (via getActiveAgentContexts) — no duplicated retrieval data.
 */
export function AgentContextOverview() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);
  const contexts = useMemo(() => {
    void version;
    return getActiveAgentContexts();
  }, [version]);

  const totals = useMemo(() => {
    if (contexts.length === 0) {
      return { agents: 0, avgHealth: 0, avgConfidence: 0, nodes: 0, relationships: 0 };
    }
    let health = 0;
    let confidence = 0;
    let nodes = 0;
    let relationships = 0;
    for (const ctx of contexts) {
      health += ctx.report.contextHealth;
      confidence += ctx.report.averageConfidence;
      nodes += ctx.report.knowledgeNodes;
      relationships += ctx.report.relationships;
    }
    const n = contexts.length;
    return {
      agents: n,
      avgHealth: Math.round((health / n) * 100) / 100,
      avgConfidence: Math.round((confidence / n) * 100) / 100,
      nodes,
      relationships,
    };
  }, [contexts]);

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>Agent Context Overview</CardTitle>
          <span className="text-xs text-fg-muted">
            Read-only · same Context Packages as the Agents page · Memory Engine sourced
          </span>
        </div>
        <Badge variant="info">{totals.agents} agents</Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { label: "Agents", value: totals.agents },
            { label: "Avg Context Health", value: totals.avgHealth },
            { label: "Avg Confidence", value: totals.avgConfidence },
            { label: "Linked Nodes", value: totals.nodes },
            { label: "Relationships", value: totals.relationships },
          ].map((metric) => (
            <div key={metric.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {metric.label}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="ui-table-wrap">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Memories</th>
                <th className="px-4 py-3 font-medium">Nodes</th>
                <th className="px-4 py-3 font-medium">Relationships</th>
                <th className="px-4 py-3 font-medium">Related</th>
                <th className="px-4 py-3 font-medium">Avg Conf</th>
                <th className="px-4 py-3 font-medium">Coverage</th>
                <th className="px-4 py-3 font-medium">Context Health</th>
              </tr>
            </thead>
            <tbody>
              {contexts.map((ctx) => (
                <tr key={ctx.agent.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-fg">{ctx.agent.name}</span>
                      <span className="font-mono text-xs text-fg-muted">{ctx.agent.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-fg-secondary">{ctx.agent.department}</td>
                  <td className="px-4 py-3 tabular-nums">{ctx.report.retrievedMemories}</td>
                  <td className="px-4 py-3 tabular-nums">{ctx.report.knowledgeNodes}</td>
                  <td className="px-4 py-3 tabular-nums">{ctx.report.relationships}</td>
                  <td className="px-4 py-3 tabular-nums">{ctx.report.relatedMemories}</td>
                  <td className="px-4 py-3 tabular-nums">{ctx.report.averageConfidence}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {Math.round(ctx.report.knowledgeCoverage * 100)}%
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={healthVariant[ctx.report.contextHealthLabel]}>
                      {ctx.report.contextHealth} · {ctx.report.contextHealthLabel}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
