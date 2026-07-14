"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Workflow } from "lucide-react";
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
import { reason } from "@/features/agent-reasoning";
import type {
  ConfidenceLabel,
  ReasoningOptionId,
  ReasoningQuality,
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

const qualityVariant: Record<ReasoningQuality, BadgeVariant> = {
  robust: "success",
  adequate: "info",
  thin: "warning",
};

const recommendationVariant: Record<ReasoningOptionId, BadgeVariant> = {
  proceed: "success",
  escalate: "warning",
  "request-approval": "info",
  "collect-more-information": "info",
  reject: "error",
};

const selectClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong";

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

export function AgentReasoningPanel() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);
  const agents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.lifecycleStatus === "active"),
    [agents]
  );

  const [agentId, setAgentId] = useState("");
  const selectedId = agentId || activeAgents[0]?.id || "";

  const decision = useMemo(() => {
    // `version` gates recomputation when any upstream store mutates.
    void version;
    const agent = agents.find((candidate) => candidate.id === selectedId);
    if (!agent) return null;
    return reason(buildAgentContext(agent, { agentId: agent.id }));
  }, [selectedId, version]);

  if (!decision) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Reasoning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-fg-muted">No active agent to reason over.</p>
        </CardContent>
      </Card>
    );
  }

  const { goal, constraints, options, recommendedOption, risk, confidence } = decision;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Workflow className="size-4 text-primary" />
              Agent Reasoning
            </span>
          </CardTitle>
          <span className="text-xs text-fg-muted">
            Deterministic Decision Package · Context → goal → constraints → options → risk → confidence
          </span>
        </div>
        <Badge variant={recommendationVariant[recommendedOption.id]}>
          {recommendedOption.label}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5 sm:max-w-sm">
          <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Agent
          </label>
          <select className={selectClass} value={selectedId} onChange={(e) => setAgentId(e.target.value)}>
            {activeAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.department}
              </option>
            ))}
          </select>
        </div>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Confidence" value={confidence.score} />
          <Metric label="Overall Risk" value={risk.overallRisk} />
          <Metric label="Options" value={options.length} />
          <Metric label="Priority" value={goal.priority} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={confidenceVariant[confidence.label]}>
            {confidence.label} confidence
          </Badge>
          <Badge variant={qualityVariant[confidence.reasoningQuality]}>
            {confidence.reasoningQuality} reasoning
          </Badge>
          <Badge variant={riskVariant[risk.label]}>{risk.label} risk</Badge>
        </div>

        {/* Goal */}
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">Goal</p>
          <p className="mt-1 font-medium text-fg">{goal.primaryGoal}</p>
          {goal.supportingGoals.length > 0 && (
            <p className="mt-1 text-xs text-fg-secondary">
              Supporting: {goal.supportingGoals.join(" · ")}
            </p>
          )}
          <p className="mt-1 text-xs text-fg-muted">
            Success: {goal.successCriteria.join(" · ")}
          </p>
        </div>

        {/* Constraints + Options */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Constraints · {Math.round(constraints.completeness * 100)}% complete
            </p>
            <div className="rounded-md border bg-surface-sunken p-3 text-xs text-fg-secondary">
              <p>Policies: {constraints.policies.length > 0 ? constraints.policies.join(", ") : "none"}</p>
              <p className="mt-1">Permissions: {constraints.permissions.join(", ") || "none"}</p>
              <p className="mt-1">Department: {constraints.departmentLimits.join(", ")}</p>
              {constraints.missingInformation.length > 0 && (
                <p className="mt-1 text-warning">
                  Missing: {constraints.missingInformation.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Options (scored)
            </p>
            {options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center justify-between rounded-md border p-2 text-xs ${
                  option.id === recommendedOption.id
                    ? "border-primary bg-primary-subtle"
                    : "bg-surface-sunken"
                }`}
              >
                <span className="font-medium text-fg">{option.label}</span>
                <Badge variant="neutral">{option.score}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-md border border-primary/40 bg-primary-subtle p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Recommended Action
          </p>
          <p className="mt-1 font-semibold text-fg">
            {recommendedOption.label} · score {recommendedOption.score}
          </p>
          <p className="mt-1 text-xs text-fg-secondary">{recommendedOption.rationale}</p>
        </div>

        {/* Reasoning trace */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Reasoning Trace
          </p>
          {decision.reasoningTrace.map((step) => (
            <div key={step.stage} className="rounded-md border bg-surface-sunken p-2 text-xs">
              <p className="font-medium text-fg">{step.stage}</p>
              <p className="text-fg-secondary">in: {step.input}</p>
              <p className="text-fg-secondary">eval: {step.evaluation}</p>
              <p className="text-fg">out: {step.output}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
