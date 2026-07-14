"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { WorkflowCard } from "@/features/workflows/workflow-card";
import { Drawer } from "@/components/organization/drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activeProvider, getPersistenceTelemetry } from "@/features/persistence";
import {
  archiveWorkflow,
  buildReport,
  createWorkflow,
  deleteWorkflow,
  getAuditLog,
  getCrudHistory,
  getSnapshot,
  restoreWorkflow,
  subscribe,
  toWorkflowCards,
  updateWorkflow,
} from "@/features/workflow-crud";
import { getSnapshot as getAgentSnapshot } from "@/features/agent-crud";
import type { LifecycleStatus } from "@/features/persistence";
import type { CreateWorkflowInput, WorkflowCrudRecord } from "@/features/workflow-crud";
import type { WorkflowStatus } from "@/types";

const lifecycleVariant: Record<LifecycleStatus, BadgeVariant> = {
  active: "success",
  archived: "warning",
  deleted: "error",
};

interface DrawerState {
  mode: "create" | "edit";
  record?: WorkflowCrudRecord;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  department: string;
  category: string;
  owner: string;
  status: WorkflowStatus;
  version: string;
  trigger: string;
  steps: string;
  assignedAgents: string;
  dependencies: string;
  approvalPolicy: string;
  executionMode: string;
  retryPolicy: string;
  timeout: string;
  runtime: string;
  ownerAgent: string;
  successRate: string;
  runsToday: string;
  lastRun: string;
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  department: "",
  category: "",
  owner: "",
  status: "idle",
  version: "v1.0.0",
  trigger: "",
  steps: "",
  assignedAgents: "",
  dependencies: "",
  approvalPolicy: "not-required",
  executionMode: "event-driven",
  retryPolicy: "1 retry",
  timeout: "900",
  runtime: "simulation",
  ownerAgent: "",
  successRate: "100",
  runsToday: "0",
  lastRun: "just now",
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

function toForm(record: WorkflowCrudRecord): FormState {
  return {
    name: record.name,
    slug: record.slug,
    description: record.description,
    department: record.department,
    category: record.category,
    owner: record.owner,
    status: record.status,
    version: record.version,
    trigger: record.trigger,
    steps: record.steps.join(", "),
    assignedAgents: record.assignedAgents.join(", "),
    dependencies: record.dependencies.join(", "),
    approvalPolicy: record.approvalPolicy,
    executionMode: record.executionMode,
    retryPolicy: record.retryPolicy,
    timeout: String(record.timeout),
    runtime: record.runtime,
    ownerAgent: record.ownerAgent,
    successRate: String(record.successRate),
    runsToday: String(record.runsToday),
    lastRun: record.lastRun,
  };
}

function toInput(form: FormState): CreateWorkflowInput {
  return {
    name: form.name,
    slug: form.slug || slugify(form.name),
    description: form.description,
    department: form.department,
    category: form.category,
    owner: form.owner,
    status: form.status,
    version: form.version,
    trigger: form.trigger,
    steps: splitList(form.steps),
    assignedAgents: splitList(form.assignedAgents),
    dependencies: splitList(form.dependencies),
    approvalPolicy: form.approvalPolicy,
    executionMode: form.executionMode,
    retryPolicy: form.retryPolicy,
    timeout: Number(form.timeout) || 0,
    runtime: form.runtime,
    ownerAgent: form.ownerAgent,
    successRate: Number(form.successRate) || 0,
    runsToday: Number(form.runsToday) || 0,
    lastRun: form.lastRun,
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

export function WorkflowRegistryWorkspace({ showCards = true }: { showCards?: boolean }) {
  const records = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const report = buildReport();
  const telemetry = report.telemetry;
  const history = getCrudHistory();
  const audit = getAuditLog();
  const persistence = getPersistenceTelemetry();
  const workflowCards = toWorkflowCards(records);
  const agentIds = getAgentSnapshot().map((agent) => agent.id).join(", ");

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
        record.name,
        record.slug,
        record.department,
        record.category,
        record.owner,
        record.trigger,
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

  function openEdit(record: WorkflowCrudRecord) {
    setForm(toForm(record));
    setErrors([]);
    setDrawer({ mode: "edit", record });
  }

  async function submit() {
    const input = toInput(form);
    const result = await (
      drawer?.mode === "edit" && drawer.record
        ? updateWorkflow(drawer.record.id, input)
        : createWorkflow(input)
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
      {showCards && (
        <div className="grid grid-cols-12 gap-6">
          {workflowCards.map((record) => (
            <div key={record.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
              <WorkflowCard workflow={record} />
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle>Workflow Registry Management</CardTitle>
            <span className="text-xs text-fg-muted">
              In-memory CRUD through the Command Bus · soft delete only
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Create Workflow
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {[
              { label: "Active", value: report.active },
              { label: "Archived", value: report.archived },
              { label: "Deleted", value: report.deleted },
              { label: "Departments", value: report.departments },
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workflows"
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
            <table className="w-full min-w-[1220px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                  <th className="px-4 py-3 font-medium">Workflow</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Trigger</th>
                  <th className="px-4 py-3 font-medium">Assigned Agents</th>
                  <th className="px-4 py-3 font-medium">Execution</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Lifecycle</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-fg">{record.name}</span>
                        <span className="font-mono text-xs text-fg-muted">
                          {record.id} · {record.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fg-secondary">{record.department}</td>
                    <td className="px-4 py-3 text-fg-secondary">{record.trigger}</td>
                    <td className="px-4 py-3 text-fg-secondary">{record.assignedAgents.join(", ")}</td>
                    <td className="px-4 py-3 text-fg-secondary">{record.executionMode}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={lifecycleVariant[record.lifecycleStatus]}>
                        {record.lifecycleStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-fg-secondary">{record.owner}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {record.lifecycleStatus !== "deleted" && (
                          <Button variant="ghost" size="sm" onClick={() => openEdit(record)}>
                            Edit
                          </Button>
                        )}
                        {record.lifecycleStatus === "active" && (
                          <Button variant="outline" size="sm" onClick={() => void archiveWorkflow(record.id)}>
                            Archive
                          </Button>
                        )}
                        {record.lifecycleStatus !== "active" && (
                          <Button variant="outline" size="sm" onClick={() => void restoreWorkflow(record.id)}>
                            Restore
                          </Button>
                        )}
                        {record.lifecycleStatus !== "deleted" && (
                          <Button variant="danger" size="sm" onClick={() => void deleteWorkflow(record.id)}>
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
            {show(report.total)} workflows · {show(report.historyCount)} commands · {show(report.auditCount)} audit
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
                  {entry.action} · {entry.workflowId}
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
                  {entry.action} · {entry.newState.name}
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
        title={drawer?.mode === "edit" ? "Edit Workflow" : "Create Workflow"}
        subtitle={drawer?.mode === "edit" ? "Command · workflow.update" : "Command · workflow.create"}
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug:
                      drawer?.mode === "create" || current.slug === slugify(current.name)
                        ? slugify(event.target.value)
                        : current.slug,
                  }))
                }
                placeholder="Workflow name"
              />
            </FormField>
            <FormField label="Slug">
              <input
                className={inputClass}
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                placeholder="workflow-slug"
              />
            </FormField>
            <FormField label="Department">
              <input
                className={inputClass}
                value={form.department}
                onChange={(event) => setForm({ ...form, department: event.target.value })}
                placeholder="Sales"
              />
            </FormField>
            <FormField label="Owner">
              <input
                className={inputClass}
                value={form.owner}
                onChange={(event) => setForm({ ...form, owner: event.target.value })}
                placeholder="Workflow Engine"
              />
            </FormField>
            <FormField label="Category">
              <input
                className={inputClass}
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                placeholder="Sales Automation"
              />
            </FormField>
            <FormField label="Owner Agent">
              <input
                className={inputClass}
                value={form.ownerAgent}
                onChange={(event) => setForm({ ...form, ownerAgent: event.target.value })}
                placeholder="agent-sales"
              />
            </FormField>
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as WorkflowStatus })}
                className="h-9 rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong"
              >
                <option value="running">Running</option>
                <option value="idle">Idle</option>
                <option value="failed">Failed</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </FormField>
            <FormField label="Version">
              <input
                className={inputClass}
                value={form.version}
                onChange={(event) => setForm({ ...form, version: event.target.value })}
                placeholder="v1.0.0"
              />
            </FormField>
            <FormField label="Trigger">
              <input
                className={inputClass}
                value={form.trigger}
                onChange={(event) => setForm({ ...form, trigger: event.target.value })}
                placeholder="Deal qualified"
              />
            </FormField>
            <FormField label="Execution Mode">
              <input
                className={inputClass}
                value={form.executionMode}
                onChange={(event) => setForm({ ...form, executionMode: event.target.value })}
                placeholder="event-driven"
              />
            </FormField>
            <FormField label="Approval Policy">
              <input
                className={inputClass}
                value={form.approvalPolicy}
                onChange={(event) => setForm({ ...form, approvalPolicy: event.target.value })}
                placeholder="director-review"
              />
            </FormField>
            <FormField label="Retry Policy">
              <input
                className={inputClass}
                value={form.retryPolicy}
                onChange={(event) => setForm({ ...form, retryPolicy: event.target.value })}
                placeholder="1 retry"
              />
            </FormField>
            <FormField label="Timeout">
              <input
                className={inputClass}
                value={form.timeout}
                onChange={(event) => setForm({ ...form, timeout: event.target.value })}
                placeholder="900"
              />
            </FormField>
            <FormField label="Runtime">
              <input
                className={inputClass}
                value={form.runtime}
                onChange={(event) => setForm({ ...form, runtime: event.target.value })}
                placeholder="simulation"
              />
            </FormField>
            <FormField label="Success Rate">
              <input
                className={inputClass}
                value={form.successRate}
                onChange={(event) => setForm({ ...form, successRate: event.target.value })}
                placeholder="100"
              />
            </FormField>
            <FormField label="Runs Today">
              <input
                className={inputClass}
                value={form.runsToday}
                onChange={(event) => setForm({ ...form, runsToday: event.target.value })}
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              className="min-h-24 w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Describe the workflow and its purpose"
            />
          </FormField>
          <FormField label="Steps">
            <input
              className={inputClass}
              value={form.steps}
              onChange={(event) => setForm({ ...form, steps: event.target.value })}
              placeholder="step one, step two"
            />
          </FormField>
          <FormField label="Assigned Agents">
            <input
              className={inputClass}
              value={form.assignedAgents}
              onChange={(event) => setForm({ ...form, assignedAgents: event.target.value })}
              placeholder="agent-sales, agent-support"
            />
          </FormField>
          <p className="text-xs text-fg-muted">Known agent ids: {agentIds || "none"}</p>
          <FormField label="Dependencies">
            <input
              className={inputClass}
              value={form.dependencies}
              onChange={(event) => setForm({ ...form, dependencies: event.target.value })}
              placeholder="wf-other-workflow"
            />
          </FormField>
          <FormField label="Last Run">
            <input
              className={inputClass}
              value={form.lastRun}
              onChange={(event) => setForm({ ...form, lastRun: event.target.value })}
              placeholder="just now"
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
              {drawer?.mode === "edit" ? "Save changes" : "Create workflow"}
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
