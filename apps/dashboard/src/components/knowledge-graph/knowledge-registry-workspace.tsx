"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { Drawer } from "@/components/organization/drawer";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activeProvider, getPersistenceTelemetry } from "@/features/persistence";
import type { LifecycleStatus } from "@/features/persistence";
import {
  archiveKnowledge,
  buildReport,
  createKnowledge,
  createRelationship,
  deleteKnowledge,
  deleteRelationship,
  getAuditLog,
  getCrudHistory,
  getNodeSnapshot,
  getRelationshipSnapshot,
  RELATIONSHIP_TYPES,
  restoreKnowledge,
  subscribeNodes,
  subscribeRelationships,
  updateKnowledge,
} from "@/features/knowledge-crud";
import type {
  CreateKnowledgeInput,
  KnowledgeGraphRelationshipType,
  KnowledgeImportance,
  KnowledgeNodeRecord,
  KnowledgeNodeStatus,
  KnowledgeNodeType,
  KnowledgeOwnerType,
} from "@/features/knowledge-crud";

const lifecycleVariant: Record<LifecycleStatus, BadgeVariant> = {
  active: "success",
  archived: "warning",
  deleted: "error",
};

const statusVariant: Record<KnowledgeNodeStatus, BadgeVariant> = {
  verified: "success",
  provisional: "info",
  review: "warning",
};

const importanceVariant: Record<KnowledgeImportance, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const nodeTypes: KnowledgeNodeType[] = [
  "Agent",
  "Workflow",
  "Department",
  "Organization",
  "Customer",
  "Project",
  "Decision",
  "Memory",
  "Knowledge",
  "Policy",
  "Goal",
  "Plan",
  "Tool",
  "Model",
  "Capability",
  "Event",
  "Risk",
  "Entity",
  "Execution",
  "Learning",
  "Experience",
  "Governance",
];
const ownerTypes: KnowledgeOwnerType[] = ["agent", "workflow", "department", "organization"];
const nodeStatuses: KnowledgeNodeStatus[] = ["verified", "provisional", "review"];
const importanceLevels: KnowledgeImportance[] = ["critical", "high", "medium", "low"];

const inputClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong";
const selectClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function splitList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

interface NodeForm {
  title: string;
  slug: string;
  description: string;
  nodeType: KnowledgeNodeType;
  ownerType: KnowledgeOwnerType;
  ownerId: string;
  confidence: string;
  importance: KnowledgeImportance;
  status: KnowledgeNodeStatus;
  version: string;
  source: string;
  tags: string;
}

const emptyNodeForm: NodeForm = {
  title: "",
  slug: "",
  description: "",
  nodeType: "Knowledge",
  ownerType: "organization",
  ownerId: "director",
  confidence: "90",
  importance: "medium",
  status: "verified",
  version: "v1.0.0",
  source: "manual knowledge entry",
  tags: "",
};

function toNodeForm(record: KnowledgeNodeRecord): NodeForm {
  return {
    title: record.title,
    slug: record.slug,
    description: record.description,
    nodeType: record.nodeType,
    ownerType: record.ownerType,
    ownerId: record.ownerId,
    confidence: String(record.confidence),
    importance: record.importance,
    status: record.status,
    version: record.version,
    source: record.source,
    tags: record.tags.join(", "),
  };
}

function toNodeInput(form: NodeForm): CreateKnowledgeInput {
  return {
    title: form.title,
    slug: form.slug || slugify(form.title),
    description: form.description,
    nodeType: form.nodeType,
    ownerType: form.ownerType,
    ownerId: form.ownerId,
    confidence: Number(form.confidence) || 0,
    importance: form.importance,
    status: form.status,
    version: form.version,
    source: form.source,
    tags: splitList(form.tags),
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">{label}</label>
      {children}
    </div>
  );
}

interface RelForm {
  sourceNode: string;
  targetNode: string;
  relationshipType: KnowledgeGraphRelationshipType;
  weight: string;
}

export function KnowledgeRegistryWorkspace() {
  const nodes = useSyncExternalStore(subscribeNodes, getNodeSnapshot, getNodeSnapshot);
  const relationships = useSyncExternalStore(subscribeRelationships, getRelationshipSnapshot, getRelationshipSnapshot);
  const report = buildReport();
  const telemetry = report.telemetry;
  const history = getCrudHistory();
  const audit = getAuditLog();
  const persistence = getPersistenceTelemetry();

  const [nodeDrawer, setNodeDrawer] = useState<{ mode: "create" | "edit"; record?: KnowledgeNodeRecord } | null>(null);
  const [nodeForm, setNodeForm] = useState<NodeForm>(emptyNodeForm);
  const [nodeErrors, setNodeErrors] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [lifecycle, setLifecycle] = useState<"all" | LifecycleStatus>("all");

  const [relDrawer, setRelDrawer] = useState(false);
  const [relForm, setRelForm] = useState<RelForm>({
    sourceNode: "",
    targetNode: "",
    relationshipType: "depends_on",
    weight: "0.8",
  });
  const [relErrors, setRelErrors] = useState<string[]>([]);

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const show = (value: number | string) => (mounted ? value : "—");

  const nodeTitleById = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach((node) => map.set(node.id, node.title));
    return map;
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesLifecycle = lifecycle === "all" || node.lifecycleStatus === lifecycle;
      const haystack = [node.id, node.title, node.slug, node.description, node.nodeType, node.ownerId, node.source, node.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return matchesLifecycle && haystack.includes(query.toLowerCase());
    });
  }, [lifecycle, nodes, query]);

  const activeRelationships = relationships.filter((edge) => edge.lifecycleStatus !== "deleted");

  function openCreateNode() {
    setNodeForm(emptyNodeForm);
    setNodeErrors([]);
    setNodeDrawer({ mode: "create" });
  }
  function openEditNode(record: KnowledgeNodeRecord) {
    setNodeForm(toNodeForm(record));
    setNodeErrors([]);
    setNodeDrawer({ mode: "edit", record });
  }
  async function submitNode() {
    const input = toNodeInput(nodeForm);
    const result = await (
      nodeDrawer?.mode === "edit" && nodeDrawer.record
        ? updateKnowledge(nodeDrawer.record.id, input)
        : createKnowledge(input)
    );
    if (result.ok) {
      setNodeDrawer(null);
      setNodeErrors([]);
      return;
    }
    setNodeErrors(result.errors);
  }

  async function submitRelationship() {
    const result = await createRelationship({
      sourceNode: relForm.sourceNode,
      targetNode: relForm.targetNode,
      relationshipType: relForm.relationshipType,
      weight: Number(relForm.weight) || 0,
    });
    if (result.ok) {
      setRelDrawer(false);
      setRelErrors([]);
      return;
    }
    setRelErrors(result.errors);
  }

  const nodeOptions = nodes.filter((node) => node.lifecycleStatus !== "deleted");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle>Knowledge Registry Management</CardTitle>
            <span className="text-xs text-fg-muted">
              In-memory node + relationship CRUD through the Command Bus · soft delete only
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={openCreateNode}>
            <Plus className="size-4" />
            Create Knowledge
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {[
              { label: "Active", value: report.active },
              { label: "Archived", value: report.archived },
              { label: "Deleted", value: report.deleted },
              { label: "Relationships", value: report.relationshipsActive },
              { label: "Creates", value: telemetry.creates },
              { label: "Updates", value: telemetry.updates },
              { label: "Rel Ops", value: telemetry.relationshipOps },
              { label: "Soft Deletes", value: telemetry.softDeletes },
            ].map((metric) => (
              <div key={metric.label} className="rounded-md border bg-surface-sunken p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{metric.label}</p>
                <p className="mt-1 text-lg font-bold tabular-nums">{show(metric.value)}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search knowledge nodes" className={inputClass} />
            <select value={lifecycle} onChange={(e) => setLifecycle(e.target.value as "all" | LifecycleStatus)} className="h-9 rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong">
              <option value="all">All lifecycle states</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div className="ui-table-wrap">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                  <th className="px-4 py-3 font-medium">Node</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Importance</th>
                  <th className="px-4 py-3 font-medium">Lifecycle</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.map((node) => (
                  <tr key={node.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-fg">{node.title}</span>
                        <span className="font-mono text-xs text-fg-muted">{node.id} · {node.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fg-secondary">{node.nodeType}</td>
                    <td className="px-4 py-3 text-fg-secondary">{node.ownerType}:{node.ownerId}</td>
                    <td className="px-4 py-3 text-fg-secondary">{node.confidence}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[node.status]}>{node.status}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={importanceVariant[node.importance]}>{node.importance}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={lifecycleVariant[node.lifecycleStatus]}>{node.lifecycleStatus}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {node.lifecycleStatus !== "deleted" && (
                          <Button variant="ghost" size="sm" onClick={() => openEditNode(node)}>Edit</Button>
                        )}
                        {node.lifecycleStatus === "active" && (
                          <Button variant="outline" size="sm" onClick={() => void archiveKnowledge(node.id)}>Archive</Button>
                        )}
                        {node.lifecycleStatus !== "active" && (
                          <Button variant="outline" size="sm" onClick={() => void restoreKnowledge(node.id)}>Restore</Button>
                        )}
                        {node.lifecycleStatus !== "deleted" && (
                          <Button variant="danger" size="sm" onClick={() => void deleteKnowledge(node.id)}>Delete</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-fg-muted">
            {show(report.total)} nodes · {show(report.relationshipsTotal)} relationships · {show(report.historyCount)} commands ·{" "}
            {show(report.auditCount)} audit records · avg {show(report.avgLatencyMs)}ms · {show(telemetry.validationFailures)} validation failures
          </p>
          <p className="text-xs text-fg-muted">
            Storage: {activeProvider()} adapter · {show(persistence.operations)} ops · {show(persistence.writes)} writes ·{" "}
            {show(persistence.reads)} reads · {show(persistence.adapterLatencyMs)}ms adapter latency
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle>Relationships</CardTitle>
            <span className="text-xs text-fg-muted">Typed edges between knowledge nodes</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setRelErrors([]); setRelDrawer(true); }}>
            <Plus className="size-4" />
            Create Relationship
          </Button>
        </CardHeader>
        <CardContent>
          <div className="ui-table-wrap">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Weight</th>
                  <th className="px-4 py-3 font-medium">Lifecycle</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeRelationships.slice(0, 40).map((edge) => (
                  <tr key={edge.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-fg-secondary">{nodeTitleById.get(edge.sourceNode) ?? edge.sourceNode}</td>
                    <td className="px-4 py-3"><Badge variant="neutral">{edge.relationshipType}</Badge></td>
                    <td className="px-4 py-3 text-fg-secondary">{nodeTitleById.get(edge.targetNode) ?? edge.targetNode}</td>
                    <td className="px-4 py-3 tabular-nums text-fg-secondary">{edge.weight}</td>
                    <td className="px-4 py-3"><Badge variant={lifecycleVariant[edge.lifecycleStatus]}>{edge.lifecycleStatus}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button variant="danger" size="sm" onClick={() => void deleteRelationship(edge.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 xl:col-span-6">
          <CardHeader>
            <CardTitle>Command History</CardTitle>
            <span className="text-xs text-fg-muted">Newest first</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {history.slice(0, 8).map((entry) => (
              <div key={entry.commandId} className="rounded-md border bg-surface-sunken p-3 text-sm">
                <p className="font-medium text-fg">{entry.action} · {entry.entityKind} · {entry.entityId}</p>
                <p className="text-xs text-fg-secondary">{entry.commandId} · {entry.actor} · {entry.timestamp}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 xl:col-span-6">
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <span className="text-xs text-fg-muted">Command id, actor, previous → new state</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {audit.slice(0, 8).map((entry) => (
              <div key={entry.commandId} className="rounded-md border bg-surface-sunken p-3 text-sm">
                <p className="font-medium text-fg">{entry.action} · {entry.entityKind}</p>
                <p className="text-xs text-fg-secondary">{entry.commandId} · {entry.actor} · {entry.timestamp}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {entry.previousState?.lifecycleStatus ?? "none"} → {entry.newState.lifecycleStatus} · simulation {String(entry.simulation)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Drawer
        open={nodeDrawer !== null}
        onClose={() => setNodeDrawer(null)}
        title={nodeDrawer?.mode === "edit" ? "Edit Knowledge Node" : "Create Knowledge Node"}
        subtitle={nodeDrawer?.mode === "edit" ? "Command · knowledge.update" : "Command · knowledge.create"}
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input className={inputClass} value={nodeForm.title}
                onChange={(e) => setNodeForm((c) => ({ ...c, title: e.target.value, slug: nodeDrawer?.mode === "create" || c.slug === slugify(c.title) ? slugify(e.target.value) : c.slug }))}
                placeholder="Node title" />
            </Field>
            <Field label="Slug">
              <input className={inputClass} value={nodeForm.slug} onChange={(e) => setNodeForm({ ...nodeForm, slug: e.target.value })} placeholder="node-slug" />
            </Field>
            <Field label="Node Type">
              <select className={selectClass} value={nodeForm.nodeType} onChange={(e) => setNodeForm({ ...nodeForm, nodeType: e.target.value as KnowledgeNodeType })}>
                {nodeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Owner Type">
              <select className={selectClass} value={nodeForm.ownerType} onChange={(e) => setNodeForm({ ...nodeForm, ownerType: e.target.value as KnowledgeOwnerType })}>
                {ownerTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Owner Id">
              <input className={inputClass} value={nodeForm.ownerId} onChange={(e) => setNodeForm({ ...nodeForm, ownerId: e.target.value })} placeholder="director" />
            </Field>
            <Field label="Source">
              <input className={inputClass} value={nodeForm.source} onChange={(e) => setNodeForm({ ...nodeForm, source: e.target.value })} placeholder="manual knowledge entry" />
            </Field>
            <Field label="Status">
              <select className={selectClass} value={nodeForm.status} onChange={(e) => setNodeForm({ ...nodeForm, status: e.target.value as KnowledgeNodeStatus })}>
                {nodeStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Importance">
              <select className={selectClass} value={nodeForm.importance} onChange={(e) => setNodeForm({ ...nodeForm, importance: e.target.value as KnowledgeImportance })}>
                {importanceLevels.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Confidence">
              <input className={inputClass} value={nodeForm.confidence} onChange={(e) => setNodeForm({ ...nodeForm, confidence: e.target.value })} placeholder="90" />
            </Field>
            <Field label="Version">
              <input className={inputClass} value={nodeForm.version} onChange={(e) => setNodeForm({ ...nodeForm, version: e.target.value })} placeholder="v1.0.0" />
            </Field>
          </div>
          <Field label="Description">
            <textarea className="min-h-24 w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong"
              value={nodeForm.description} onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })} placeholder="What this node captures" />
          </Field>
          <Field label="Tags">
            <input className={inputClass} value={nodeForm.tags} onChange={(e) => setNodeForm({ ...nodeForm, tags: e.target.value })} placeholder="agent, workflow, policy" />
          </Field>

          {nodeErrors.length > 0 && (
            <div className="flex flex-col gap-1 rounded-md border border-error/30 bg-error-subtle p-3">
              {nodeErrors.map((error, index) => <p key={index} className="text-sm text-error">{error}</p>)}
            </div>
          )}

          <div className="flex flex-col gap-2 border-t pt-4">
            <Button variant="primary" onClick={submitNode} className="w-full justify-center">
              {nodeDrawer?.mode === "edit" ? "Save changes" : "Create knowledge node"}
            </Button>
            <p className="text-xs leading-5 text-fg-muted">
              Runs through the Command Bus and mutates the in-memory store. Deterministic, offline, no database writes.
            </p>
          </div>
        </div>
      </Drawer>

      <Drawer open={relDrawer} onClose={() => setRelDrawer(false)} title="Create Relationship" subtitle="Command · relationship.create">
        <div className="flex flex-col gap-5">
          <Field label="Source Node">
            <select className={selectClass} value={relForm.sourceNode} onChange={(e) => setRelForm({ ...relForm, sourceNode: e.target.value })}>
              <option value="">Select source…</option>
              {nodeOptions.map((node) => <option key={node.id} value={node.id}>{node.title}</option>)}
            </select>
          </Field>
          <Field label="Relationship Type">
            <select className={selectClass} value={relForm.relationshipType} onChange={(e) => setRelForm({ ...relForm, relationshipType: e.target.value as KnowledgeGraphRelationshipType })}>
              {RELATIONSHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Target Node">
            <select className={selectClass} value={relForm.targetNode} onChange={(e) => setRelForm({ ...relForm, targetNode: e.target.value })}>
              <option value="">Select target…</option>
              {nodeOptions.map((node) => <option key={node.id} value={node.id}>{node.title}</option>)}
            </select>
          </Field>
          <Field label="Weight">
            <input className={inputClass} value={relForm.weight} onChange={(e) => setRelForm({ ...relForm, weight: e.target.value })} placeholder="0.8" />
          </Field>

          {relErrors.length > 0 && (
            <div className="flex flex-col gap-1 rounded-md border border-error/30 bg-error-subtle p-3">
              {relErrors.map((error, index) => <p key={index} className="text-sm text-error">{error}</p>)}
            </div>
          )}

          <div className="flex flex-col gap-2 border-t pt-4">
            <Button variant="primary" onClick={submitRelationship} className="w-full justify-center">Create relationship</Button>
            <p className="text-xs leading-5 text-fg-muted">
              Runs through the Command Bus. Validates source and target nodes exist. Soft delete only.
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
