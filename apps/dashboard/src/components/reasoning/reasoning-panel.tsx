import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { latestReasoningResult } from "@/features/reasoning";
import { ReasoningConfidence } from "@/components/reasoning/reasoning-confidence";
import { ReasoningEvidence } from "@/components/reasoning/reasoning-evidence";
import { ReasoningExplanation } from "@/components/reasoning/reasoning-explanation";
import { ReasoningHistory } from "@/components/reasoning/reasoning-history";
import { ReasoningOptions } from "@/components/reasoning/reasoning-options";
import { ReasoningPipelineView } from "@/components/reasoning/reasoning-pipeline";
import { ReasoningRecommendation } from "@/components/reasoning/reasoning-recommendation";
import { ReasoningSummary } from "@/components/reasoning/reasoning-summary";

export function ReasoningPanel() {
  const result = latestReasoningResult();
  if (!result) return null;

  return (
    <div className="grid grid-cols-12 gap-6">
      <ReasoningSummary />

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle>Reasoning Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              The reasoning engine builds context, gathers evidence, retrieves relevant memories and graph links, evaluates constraints and goals, generates options, compares trade-offs, scores confidence, produces a recommendation, and preserves a human-readable explanation.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <ReasoningPipelineView />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle>Current Context</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-sm font-semibold text-fg">{result.context.title}</p>
              <p className="mt-1 text-sm text-fg-secondary">{result.context.focus}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Objective
              </p>
              <p className="mt-1 text-sm text-fg-secondary">{result.context.objective}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Knowledge Graph Links
              </p>
              <p className="mt-1 text-sm text-fg-secondary">
                {result.relatedGraphLinks.length} relevant typed relationships across {result.relatedGraphNodes.length} nodes.
              </p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Relevant Memories
              </p>
              <p className="mt-1 text-sm text-fg-secondary">
                {result.relatedMemories.length} referenced memories support this session.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <ReasoningEvidence result={result} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Graph Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {result.relatedGraphLinks.slice(0, 4).map((link) => (
              <div key={link.id} className="rounded-md border bg-surface-sunken p-4">
                <p className="text-sm font-semibold text-fg">
                  {link.metadata.sourceRegistry} {link.relationshipType} {link.metadata.targetRegistry}
                </p>
                <p className="mt-1 text-sm text-fg-secondary">{link.metadata.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Relevant Memories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {result.relatedMemories.slice(0, 4).map((memory) => (
              <div key={memory.id} className="rounded-md border bg-surface-sunken p-4">
                <p className="text-sm font-semibold text-fg">{memory.title}</p>
                <p className="mt-1 text-sm text-fg-secondary">{memory.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Constraint Evaluation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {result.constraints.map((constraint) => (
              <div key={constraint.id} className="rounded-md border bg-surface-sunken p-4">
                <p className="text-sm font-semibold text-fg">{constraint.label}</p>
                <p className="mt-1 text-sm text-fg-secondary">{constraint.detail}</p>
                <p className="mt-2 text-xs text-fg-muted">
                  {constraint.status} · impact {constraint.scoreImpact}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Goal Evaluation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {result.goals.map((goal) => (
              <div key={goal.id} className="rounded-md border bg-surface-sunken p-4">
                <p className="text-sm font-semibold text-fg">{goal.label}</p>
                <p className="mt-1 text-sm text-fg-secondary">{goal.detail}</p>
                <p className="mt-2 text-xs text-fg-muted">
                  {goal.status} · alignment {goal.alignmentScore}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <ReasoningOptions result={result} />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <ReasoningConfidence result={result} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <ReasoningRecommendation result={result} />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ReasoningExplanation result={result} />
      </div>

      <div className="col-span-12">
        <ReasoningHistory />
      </div>
    </div>
  );
}
