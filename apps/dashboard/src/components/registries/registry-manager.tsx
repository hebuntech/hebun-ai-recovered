"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/organization/drawer";
import {
  archiveRegistry,
  buildReport,
  createRegistry,
  deleteRegistry,
  getSnapshot,
  restoreRegistry,
  subscribe,
  updateRegistry,
} from "@/features/registry-crud";
import { activeProvider, getPersistenceTelemetry } from "@/features/persistence";
import type { LifecycleStatus, RegistryCrudRecord } from "@/features/registry-crud";

const statusVariant: Record<LifecycleStatus, BadgeVariant> = {
  active: "success",
  archived: "warning",
  deleted: "error",
};

interface DrawerState {
  mode: "create" | "edit";
  record?: RegistryCrudRecord;
}

const emptyForm = { title: "", description: "", owner: "" };

const inputClass =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong";

export function RegistryManager() {
  const records = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const report = buildReport();

  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);

  function openCreate() {
    setForm(emptyForm);
    setErrors([]);
    setDrawer({ mode: "create" });
  }

  function openEdit(record: RegistryCrudRecord) {
    setForm({ title: record.title, description: record.description, owner: record.owner });
    setErrors([]);
    setDrawer({ mode: "edit", record });
  }

  async function submit() {
    const result = await (
      drawer?.mode === "edit" && drawer.record
        ? updateRegistry(drawer.record.id, form)
        : createRegistry(form)
    );
    if (result.ok) {
      setDrawer(null);
      setErrors([]);
    } else {
      setErrors(result.errors);
    }
  }

  const t = report.telemetry;
  const p = getPersistenceTelemetry();

  // Telemetry counters are client-session state; render them only after mount so
  // SSR and hydration agree (the record list stays SSR-safe via the store seed).
  const [mounted, setMounted] = useState(false);
  // Hydration gate: flip to client-only rendering after mount so SSR and the
  // first client render agree. This is external-system (hydration) sync.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const show = (value: number) => (mounted ? value : "—");

  return (
    <>
      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle>Registry Management</CardTitle>
            <span className="text-xs text-fg-muted">
              In-memory CRUD through the Command Bus · soft delete only
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Create Registry
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {[
              { label: "Active", value: report.active },
              { label: "Archived", value: report.archived },
              { label: "Deleted", value: report.deleted },
              { label: "Creates", value: t.creates },
              { label: "Updates", value: t.updates },
              { label: "Archives", value: t.archives },
              { label: "Restores", value: t.restores },
              { label: "Soft Deletes", value: t.softDeletes },
            ].map((m) => (
              <div key={m.label} className="rounded-md border bg-surface-sunken p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                  {m.label}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums">{show(m.value)}</p>
              </div>
            ))}
          </div>

          <div className="ui-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-fg-muted">
                  <th className="px-4 py-3 font-medium">Registry</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Records</th>
                  <th className="px-4 py-3 font-medium">Health</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-medium text-fg">{r.title}</span>
                      <span className="ml-2 font-mono text-xs text-fg-muted">{r.id}</span>
                    </td>
                    <td className="px-4 py-3 text-fg-secondary">{r.owner}</td>
                    <td className="px-4 py-3 tabular-nums text-fg-secondary">{r.totalRecords}</td>
                    <td className="px-4 py-3 tabular-nums text-fg-secondary">{r.health}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[r.lifecycleStatus]}>{r.lifecycleStatus}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {r.lifecycleStatus !== "deleted" && (
                          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                            Edit
                          </Button>
                        )}
                        {r.lifecycleStatus === "active" && (
                          <Button variant="outline" size="sm" onClick={() => void archiveRegistry(r.id)}>
                            Archive
                          </Button>
                        )}
                        {r.lifecycleStatus !== "active" && (
                          <Button variant="outline" size="sm" onClick={() => void restoreRegistry(r.id)}>
                            Restore
                          </Button>
                        )}
                        {r.lifecycleStatus !== "deleted" && (
                          <Button variant="danger" size="sm" onClick={() => void deleteRegistry(r.id)}>
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
            {show(report.total)} registries · {show(report.historyCount)} commands ·{" "}
            {show(report.auditCount)} audit records · avg {show(report.avgLatencyMs)}ms ·{" "}
            {show(t.validationFailures)} validation failures
          </p>
          <p className="text-xs text-fg-muted">
            Storage: {activeProvider()} adapter · {show(p.operations)} ops · {show(p.writes)} writes ·{" "}
            {show(p.reads)} reads · {show(p.adapterLatencyMs)}ms adapter latency
          </p>
        </CardContent>
      </Card>

      <Drawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        title={drawer?.mode === "edit" ? "Edit Registry" : "Create Registry"}
        subtitle={drawer?.mode === "edit" ? `Command · registry.update` : `Command · registry.create`}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">Title</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Registry title"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Description
            </label>
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What this registry holds"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-fg-muted">Owner</label>
            <input
              className={inputClass}
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              placeholder="Owning team or engine"
            />
          </div>

          {errors.length > 0 && (
            <div className="flex flex-col gap-1 rounded-md border border-error/30 bg-error-subtle p-3">
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-error">
                  {err}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 border-t pt-4">
            <Button variant="primary" onClick={submit} className="w-full justify-center">
              {drawer?.mode === "edit" ? "Save changes" : "Create registry"}
            </Button>
            <p className="text-xs leading-5 text-fg-muted">
              Runs through the Command Bus and mutates the in-memory store. Deterministic, offline,
              no persistence.
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}
