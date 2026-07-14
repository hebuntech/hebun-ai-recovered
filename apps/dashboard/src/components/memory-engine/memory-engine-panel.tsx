"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Sparkles } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSnapshot, subscribe } from "@/features/memory-crud";
import {
  getNodeSnapshot,
  getRelationshipSnapshot,
  subscribeNodes,
  subscribeRelationships,
} from "@/features/knowledge-crud";
import { retrieveContext } from "@/features/memory-engine";
import type {
  MemoryImportance,
  MemoryOwnerType,
  MemoryType,
} from "@/features/memory-crud";
import type { MemoryRetrievalRequest } from "@/features/memory-engine";

const memoryTypes: MemoryType[] = [
  "Conversation",
  "Decision",
  "Fact",
  "Procedure",
  "Policy",
  "Customer",
  "Project",
  "Organization",
  "Agent",
  "Workflow",
];

const ownerTypes: MemoryOwnerType[] = ["agent", "workflow", "department", "organization"];
const importanceLevels: MemoryImportance[] = ["critical", "high", "medium", "low"];

const importanceVariant: Record<MemoryImportance, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const inputClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong";
const selectClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong";

interface FormState {
  ownerType: "" | MemoryOwnerType;
  ownerId: string;
  memoryType: "" | MemoryType;
  importance: "" | MemoryImportance;
  minConfidence: string;
  tags: string;
  query: string;
  limit: string;
}

const emptyForm: FormState = {
  ownerType: "",
  ownerId: "",
  memoryType: "",
  importance: "",
  minConfidence: "",
  tags: "",
  query: "",
  limit: "8",
};

/**
 * Subscribe to all three CRUD stores so the engine re-runs when any of them
 * change. The snapshot value is a monotonic version derived from store sizes —
 * cheap and stable enough to drive a re-render tick.
 */
function subscribeAll(callback: () => void): () => void {
  const unsubs = [
    subscribe(callback),
    subscribeNodes(callback),
    subscribeRelationships(callback),
  ];
  return () => unsubs.forEach((unsub) => unsub());
}

function storeVersion(): string {
  return `${getSnapshot().length}:${getNodeSnapshot().length}:${getRelationshipSnapshot().length}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-surface-sunken p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function MemoryEnginePanel() {
  const version = useSyncExternalStore(subscribeAll, storeVersion, storeVersion);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const request = useMemo<MemoryRetrievalRequest>(() => {
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const minConfidence = Number(form.minConfidence);
    const limit = Number(form.limit);
    return {
      ownerType: form.ownerType || undefined,
      ownerId: form.ownerId.trim() || undefined,
      memoryType: form.memoryType || undefined,
      importance: form.importance || undefined,
      minConfidence: Number.isFinite(minConfidence) && form.minConfidence !== "" ? minConfidence : undefined,
      tags: tags.length > 0 ? tags : undefined,
      query: form.query.trim() || undefined,
      limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    };
  }, [form]);

  const pkg = useMemo(() => {
    // `version` gates recomputation: the engine re-runs when any store mutates.
    void version;
    return retrieveContext(request);
  }, [request, version]);

  const stats = pkg.statistics;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Memory Engine
            </span>
          </CardTitle>
          <span className="text-xs text-fg-muted">
            Deterministic retrieval · no LLM · no embeddings · same input → same output
          </span>
        </div>
        <Badge variant="info">{stats.retrievedCount} retrieved</Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Request controls */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Owner Type">
            <select
              className={selectClass}
              value={form.ownerType}
              onChange={(e) => setForm({ ...form, ownerType: e.target.value as FormState["ownerType"] })}
            >
              <option value="">Any</option>
              {ownerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Owner Id">
            <input
              className={inputClass}
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              placeholder="e.g. director"
            />
          </Field>
          <Field label="Memory Type">
            <select
              className={selectClass}
              value={form.memoryType}
              onChange={(e) => setForm({ ...form, memoryType: e.target.value as FormState["memoryType"] })}
            >
              <option value="">Any</option>
              {memoryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Importance">
            <select
              className={selectClass}
              value={form.importance}
              onChange={(e) => setForm({ ...form, importance: e.target.value as FormState["importance"] })}
            >
              <option value="">Any</option>
              {importanceLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags (comma sep)">
            <input
              className={inputClass}
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="policy, customer"
            />
          </Field>
          <Field label="Query">
            <input
              className={inputClass}
              value={form.query}
              onChange={(e) => setForm({ ...form, query: e.target.value })}
              placeholder="free text"
            />
          </Field>
          <Field label="Min Confidence">
            <input
              className={inputClass}
              value={form.minConfidence}
              onChange={(e) => setForm({ ...form, minConfidence: e.target.value })}
              placeholder="0-100"
            />
          </Field>
          <Field label="Limit">
            <input
              className={inputClass}
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
              placeholder="8"
            />
          </Field>
        </div>

        {/* Report metrics */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <Metric label="Retrieved" value={stats.retrievedCount} />
          <Metric label="Candidates" value={stats.candidateCount} />
          <Metric label="Avg Confidence" value={stats.averageConfidence} />
          <Metric label="Avg Importance" value={stats.averageImportance} />
          <Metric label="Knowledge Nodes" value={stats.knowledgeNodeCount} />
          <Metric label="Relationships" value={stats.relationshipCount} />
          <Metric label="Related Memories" value={stats.relatedMemoryCount} />
          <Metric label="Coverage" value={`${Math.round(stats.knowledgeCoverage * 100)}%`} />
          <Metric label="Retrieval Time" value={mounted ? `${stats.retrievalTimeMs}ms` : "—"} />
        </div>

        {/* Ranked memories */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Selected Memories (ranked)
          </p>
          {pkg.memories.length === 0 && (
            <p className="text-sm text-fg-muted">No memories match this request.</p>
          )}
          {pkg.memories.map((entry) => (
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
              Knowledge Nodes ({pkg.knowledgeNodes.length})
            </p>
            {pkg.knowledgeNodes.slice(0, 8).map((entry) => (
              <div key={entry.node.id} className="rounded-md border bg-surface-sunken p-2 text-xs">
                <span className="font-medium text-fg">{entry.node.title}</span>
                <span className="ml-1 text-fg-muted">
                  {entry.node.nodeType} · via {entry.via.join(", ")}
                </span>
              </div>
            ))}
            {pkg.knowledgeNodes.length === 0 && (
              <p className="text-xs text-fg-muted">None linked.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Relationships ({pkg.relationships.length})
            </p>
            {pkg.relationships.slice(0, 8).map((entry) => (
              <div key={entry.relationship.id} className="rounded-md border bg-surface-sunken p-2 text-xs">
                <span className="font-mono text-fg-secondary">{entry.anchorNode}</span>
                <span className="mx-1 text-primary">{entry.relationship.relationshipType}</span>
                <span className="font-mono text-fg-secondary">{entry.neighborNode}</span>
              </div>
            ))}
            {pkg.relationships.length === 0 && (
              <p className="text-xs text-fg-muted">None linked.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Related Memories ({pkg.relatedMemories.length})
            </p>
            {pkg.relatedMemories.slice(0, 8).map((entry) => (
              <div key={entry.record.id} className="rounded-md border bg-surface-sunken p-2 text-xs">
                <span className="font-medium text-fg">{entry.record.title}</span>
                <span className="ml-1 text-fg-muted">via {entry.viaNodes.length} node(s)</span>
              </div>
            ))}
            {pkg.relatedMemories.length === 0 && (
              <p className="text-xs text-fg-muted">None linked.</p>
            )}
          </div>
        </div>

        <p className="text-xs text-fg-muted">
          Owner scope {pkg.summary.ownerScope} · type {pkg.summary.memoryTypeScope} · top{" "}
          {pkg.summary.topMemoryTitle} ({pkg.summary.topScore}) · confidence avg{" "}
          {pkg.confidence.averageConfidence} (min {pkg.confidence.minConfidence}, max{" "}
          {pkg.confidence.maxConfidence})
        </p>
      </CardContent>
    </Card>
  );
}
