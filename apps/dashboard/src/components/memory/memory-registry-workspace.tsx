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
  archiveMemory,
  buildReport,
  createMemory,
  deleteMemory,
  getAuditLog,
  getCrudHistory,
  getSnapshot,
  restoreMemory,
  subscribe,
  toWidgetMetrics,
  updateMemory,
} from "@/features/memory-crud";
import type {
  CreateMemoryInput,
  MemoryCrudRecord,
  MemoryImportance,
  MemoryOwnerType,
  MemoryStatus,
  MemoryType,
} from "@/features/memory-crud";

const lifecycleVariant: Record<LifecycleStatus, BadgeVariant> = {
  active: "success",
  archived: "warning",
  deleted: "error",
};

const statusVariant: Record<MemoryStatus, BadgeVariant> = {
  fresh: "info",
  stable: "success",
  review: "warning",
};

const importanceVariant: Record<MemoryImportance, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

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
const memoryStatuses: MemoryStatus[] = ["fresh", "stable", "review"];
const importanceLevels: MemoryImportance[] = ["critical", "high", "medium", "low"];

interface DrawerState {
  mode: "create" | "edit";
  record?: MemoryCrudRecord;
}

interface FormState {
  title: string;
  slug: string;
  description: string;
  memoryType: MemoryType;
  ownerType: MemoryOwnerType;
  ownerId: string;
  importance: MemoryImportance;
  confidence: string;
  source: string;
  tags: string;
  summary: string;
  status: MemoryStatus;
  version: string;
}

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  memoryType: "Fact",
  ownerType: "organization",
  ownerId: "director",
  importance: "medium",
  confidence: "88",
  source: "manual memory entry",
  tags: "",
  summary: "",
  status: "fresh",
  version: "v1.0.0",
};

const inputClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(record: MemoryCrudRecord): FormState {
  return {
    title: record.title,
    slug: record.slug,
    description: record.description,
    memoryType: record.memoryType,
    ownerType: record.ownerType,
    ownerId: record.ownerId,
    importance: record.importance,
    confidence: String(record.confidence),
    source: record.source,
    tags: record.tags.join(", "),
    summary: record.summary,
    status: record.status,
    version: record.version,
  };
}

function toInput(form: FormState): CreateMemoryInput {
  return {
    title: form.title,
    slug: form.slug || slugify(form.title),
    description: form.description,
    memoryType: form.memoryType,
    ownerType: form.ownerType,
    ownerId: form.ownerId,
    importance: form.importance,
    confidence: Number(form.confidence) || 0,
    source: form.source,
    tags: splitList(form.tags),
    summary: form.summary,
    status: form.status,
    version: form.version,
  };
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">{label}</label>
      {children}
    </div>
  );
}

export function MemoryRegistryWorkspace() {
  const records = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const report = buildReport();
  const telemetry = report.telemetry;
  const history = getCrudHistory();
  const audit = getAuditLog();
  const persistence = getPersistenceTelemetry();
  const metrics = toWidgetMetrics(records);

  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [lifecycle, setLifecycle] = useState<"all" | LifecycleStatus>("all");
  const [mounted, setMounted] = useState(false);

  // Telemetry counters are client-session state; render them only after mount so
  // SSR and hydration agree with the seeded store snapshot.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const matchesLifecycle = lifecycle === "all" || record.lifecycleStatus === lifecycle;
      const haystack = [
        record.id,
        record.title,
        record.slug,
        record.description,
        record.memoryType,
        record.ownerType,
        record.ownerId,
        record.source,
        record.summary,
        record.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return matchesLifecycle && haystack.includes(query.toLowerCase());
    });
  }, [lifecycle, query, records]);

  function openCreate() {
    setForm(emptyForm);
    setErrors([]);
    setDrawer({ mode: "create" });
  }

  function openEdit(record: MemoryCrudRecord) {
    setForm(toForm(record));
    setErrors([]);
    setDrawer({ mode: "edit", record });
  }

  async function submit() {
    const input = toInput(form);
    const result = await (
      drawer?.mode === "edit" && drawer.record
        ? updateMemory(drawer.record.id, input)
        : createMemory(input)
    );

    if (result.ok) {
      setDrawer(null);
      setErrors([]);
      return;
    }

    setErrors(result.errors);
  }

  const show = (value: number | string) => (mounted ? value : "—");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle>Memory Registry Management</CardTitle>
            <span className="text-xs text-fg-muted">
              In-memory CRUD through the Command Bus · soft delete only
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Create Memory
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {[
              { label: "Active", value: report.active },
              { label: "Archived", value: report.archived },
              { label: "Deleted", value: report.deleted },
              { label: "Owners", value: report.ownerCount },
              { label: "Creates", value: telemetry.creates },
              { label: "Updates", value: telemetry.updates },
              { label: "Restores", value: telemetry.restores },
              { label: "Soft Deletes", value: telemetry.softDeletes },
            ].map((metric) => (
              <div key={metric.label} className="rounded-md border bg-surface-sunken p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  {metric.label}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums">{show(metric.value)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              { label: "Total", value: metrics.total },
              { label: "Decisions", value: metrics.decisions },
              { label: "Facts", value: metrics.facts },
              { label: "Procedures", value: metrics.procedures },
              { label: "Organizations", value: metrics.organizations },
            ].map((metric) => (
              <div key={metric.label} className="rounded-md border bg-surface-sunken p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  {metric.label}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums">{show(metric.value)}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search memories"
              className={inputClass}
            />
            <select
              value={lifecycle}
              onChange={(event) => setLifecycle(event.target.value as "all" | LifecycleStatus)}
              className="h-9 rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong"
            >
              <option value="all">All lifecycle states</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div className="ui-table-wrap">
            <table className="w-full min-w-[1240px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                  <th className="px-4 py-3 font-medium">Memory</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Importance</th>
                  <th className="px-4 py-3 font-medium">Lifecycle</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-fg">{record.title}</span>
                        <span className="font-mono text-xs text-fg-muted">
                          {record.id} · {record.slug}
                        </span>
                        <span className="text-xs text-fg-secondary">{record.summary}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fg-secondary">{record.memoryType}</td>
                    <td className="px-4 py-3 text-fg-secondary">
                      {record.ownerType}:{record.ownerId}
                    </td>
                    <td className="px-4 py-3 text-fg-secondary">{record.source}</td>
                    <td className="px-4 py-3 text-fg-secondary">{record.confidence}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[record.status]}>{record.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={importanceVariant[record.importance]}>
                        {record.importance}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={lifecycleVariant[record.lifecycleStatus]}>
                        {record.lifecycleStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-fg-secondary">{record.updatedAt.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {record.lifecycleStatus !== "deleted" && (
                          <Button variant="ghost" size="sm" onClick={() => openEdit(record)}>
                            Edit
                          </Button>
                        )}
                        {record.lifecycleStatus === "active" && (
                          <Button variant="outline" size="sm" onClick={() => void archiveMemory(record.id)}>
                            Archive
                          </Button>
                        )}
                        {record.lifecycleStatus !== "active" && (
                          <Button variant="outline" size="sm" onClick={() => void restoreMemory(record.id)}>
                            Restore
                          </Button>
                        )}
                        {record.lifecycleStatus !== "deleted" && (
                          <Button variant="danger" size="sm" onClick={() => void deleteMemory(record.id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-fg-muted">
            {show(report.total)} memories · {show(report.historyCount)} commands · {show(report.auditCount)} audit
            records · avg {show(report.avgLatencyMs)}ms · {show(telemetry.validationFailures)} validation
            failures
          </p>
          <p className="text-xs text-fg-muted">
            Storage: {activeProvider()} adapter · {show(persistence.operations)} ops · {show(persistence.writes)}
            writes · {show(persistence.reads)} reads · {show(persistence.adapterLatencyMs)}ms adapter latency
          </p>
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
                <p className="font-medium text-fg">
                  {entry.action} · {entry.memoryId}
                </p>
                <p className="text-xs text-fg-secondary">
                  {entry.commandId} · {entry.actor} · {entry.timestamp}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 xl:col-span-6">
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <span className="text-xs text-fg-muted">Command id, actor, previous state, new state</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {audit.slice(0, 8).map((entry) => (
              <div key={entry.commandId} className="rounded-md border bg-surface-sunken p-3 text-sm">
                <p className="font-medium text-fg">
                  {entry.action} · {entry.newState.title}
                </p>
                <p className="text-xs text-fg-secondary">
                  {entry.commandId} · {entry.actor} · {entry.timestamp}
                </p>
                <p className="mt-1 text-xs text-fg-muted">
                  {entry.previousState?.lifecycleStatus ?? "none"} → {entry.newState.lifecycleStatus} · simulation{" "}
                  {String(entry.simulation)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Drawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        title={drawer?.mode === "edit" ? "Edit Memory" : "Create Memory"}
        subtitle={drawer?.mode === "edit" ? "Command · memory.update" : "Command · memory.create"}
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Title">
              <input
                className={inputClass}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug:
                      drawer?.mode === "create" || current.slug === slugify(current.title)
                        ? slugify(event.target.value)
                        : current.slug,
                  }))
                }
                placeholder="Memory title"
              />
            </FormField>
            <FormField label="Slug">
              <input
                className={inputClass}
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                placeholder="memory-slug"
              />
            </FormField>
            <FormField label="Memory Type">
              <select
                value={form.memoryType}
                onChange={(event) => setForm({ ...form, memoryType: event.target.value as MemoryType })}
                className="h-9 rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong"
              >
                {memoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Owner Type">
              <select
                value={form.ownerType}
                onChange={(event) => setForm({ ...form, ownerType: event.target.value as MemoryOwnerType })}
                className="h-9 rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong"
              >
                {ownerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Owner Id">
              <input
                className={inputClass}
                value={form.ownerId}
                onChange={(event) => setForm({ ...form, ownerId: event.target.value })}
                placeholder="director"
              />
            </FormField>
            <FormField label="Source">
              <input
                className={inputClass}
                value={form.source}
                onChange={(event) => setForm({ ...form, source: event.target.value })}
                placeholder="manual memory entry"
              />
            </FormField>
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as MemoryStatus })}
                className="h-9 rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong"
              >
                {memoryStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Importance">
              <select
                value={form.importance}
                onChange={(event) =>
                  setForm({ ...form, importance: event.target.value as MemoryImportance })
                }
                className="h-9 rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong"
              >
                {importanceLevels.map((importance) => (
                  <option key={importance} value={importance}>
                    {importance}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Confidence">
              <input
                className={inputClass}
                value={form.confidence}
                onChange={(event) => setForm({ ...form, confidence: event.target.value })}
                placeholder="88"
              />
            </FormField>
            <FormField label="Version">
              <input
                className={inputClass}
                value={form.version}
                onChange={(event) => setForm({ ...form, version: event.target.value })}
                placeholder="v1.0.0"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              className="min-h-24 w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Describe what this memory captures"
            />
          </FormField>
          <FormField label="Summary">
            <textarea
              className="min-h-24 w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong"
              value={form.summary}
              onChange={(event) => setForm({ ...form, summary: event.target.value })}
              placeholder="Summary of the reusable memory"
            />
          </FormField>
          <FormField label="Tags">
            <input
              className={inputClass}
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
              placeholder="policy, customer, handoff"
            />
          </FormField>

          {errors.length > 0 && (
            <div className="flex flex-col gap-1 rounded-md border border-error/30 bg-error-subtle p-3">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-error">
                  {error}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 border-t pt-4">
            <Button variant="primary" onClick={submit} className="w-full justify-center">
              {drawer?.mode === "edit" ? "Save changes" : "Create memory"}
            </Button>
            <p className="text-xs leading-5 text-fg-muted">
              Runs through the Command Bus and mutates the in-memory store. Deterministic, offline,
              no runtime execution or database writes.
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
