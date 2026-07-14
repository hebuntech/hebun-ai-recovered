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
import { getActiveAgentReasonings } from "@/features/agent-reasoning";
import type {
  ConfidenceLabel,
  ReasoningOptionId,
  RiskLabel,
} from "@/features/agent-reasoning";

const confidenceVariant: Record<ConfidenceLabel, BadgeVariant> = {
  high: "success",
  medium: "info",
  low: "warning",
};

const riskVariant: Record<RiskLabel, BadgeVariant> = {
  low: "success",
  medium: "warning",
  high: "error",
};

const recommendationVariant: Record<ReasoningOptionId, BadgeVariant> = {
  proceed: "success",
  escalate: "warning",
  "request-approval": "info",
  "collect-more-information": "info",
  reject: "error",
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
 * Read-only executive overview. References the same Decision Packages the agent
 * page produces (via getActiveAgentReasonings) — no duplicated reasoning data.
 */
export function ExecutiveReasoningOverview() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);
  const results = useMemo(() => {
    void version;
    return getActiveAgentReasonings();
  }, [version]);

  const totals = useMemo(() => {
    if (results.length === 0) {
      return { agents: 0, avgConfidence: 0, avgRisk: 0, proceed: 0, escalate: 0 };
    }
    let confidence = 0;
    let risk = 0;
    let proceed = 0;
    let escalate = 0;
    for (const r of results) {
      confidence += r.report.confidence;
      risk += r.report.risk;
      if (r.report.recommendedOptionId === "proceed") proceed += 1;
      if (r.report.recommendedOptionId === "escalate") escalate += 1;
    }
    const n = results.length;
    return {
      agents: n,
      avgConfidence: Math.round((confidence / n) * 100) / 100,
      avgRisk: Math.round((risk / n) * 100) / 100,
      proceed,
      escalate,
    };
  }, [results]);

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>Executive Reasoning Overview</CardTitle>
          <span className="text-xs text-fg-muted">
            Read-only · same Decision Packages as the Agents page · deterministic
          </span>
        </div>
        <Badge variant="info">{totals.agents} agents</Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { label: "Agents", value: totals.agents },
            { label: "Avg Confidence", value: totals.avgConfidence },
            { label: "Avg Risk", value: totals.avgRisk },
            { label: "Proceed", value: totals.proceed },
            { label: "Escalate", value: totals.escalate },
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
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Primary Goal</th>
                <th className="px-4 py-3 font-medium">Recommended</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Quality</th>
                <th className="px-4 py-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.agent.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-fg">{r.agent.name}</span>
                      <span className="font-mono text-xs text-fg-muted">{r.agent.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-fg-secondary">{r.agent.department}</td>
                  <td className="px-4 py-3 text-fg-secondary">{r.report.primaryGoal}</td>
                  <td className="px-4 py-3">
                    <Badge variant={recommendationVariant[r.report.recommendedOptionId]}>
                      {r.report.recommendedAction}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={confidenceVariant[r.report.confidenceLabel]}>
                      {r.report.confidence} · {r.report.confidenceLabel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-fg-secondary">{r.report.reasoningQuality}</td>
                  <td className="px-4 py-3">
                    <Badge variant={riskVariant[r.report.riskLabel]}>
                      {r.report.risk} · {r.report.riskLabel}
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
