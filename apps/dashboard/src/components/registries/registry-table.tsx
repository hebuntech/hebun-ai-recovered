"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordStatusVariant } from "@/components/registries/registry-tokens";
import type { RegistryRecord } from "@/features/registries/types";

export function RegistryTable({
  title = "Registry Records",
  records,
}: {
  title?: string;
  records: RegistryRecord[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | RegistryRecord["status"]>("all");

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const matchesStatus = status === "all" ? true : record.status === status;
      const haystack =
        `${record.id} ${record.name} ${record.owner} ${record.change} ${record.dependency}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [query, records, status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search registry records"
            className="h-9 w-full rounded-md border bg-surface px-3 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-border-strong"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | RegistryRecord["status"])
            }
            className="h-9 rounded-md border bg-surface px-3 text-sm text-fg outline-none focus-visible:border-border-strong"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="ui-table-wrap">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Record", "Status", "Owner", "Consumers", "Dependency", "Health", "Recent Change"].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-secondary"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-fg">{record.name}</span>
                    <span className="font-mono text-xs text-fg-muted">{record.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={recordStatusVariant[record.status]}>
                    {record.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-fg-secondary">{record.owner}</td>
                <td className="px-4 py-3 text-fg-secondary">{record.consumers.join(", ")}</td>
                <td className="px-4 py-3 text-fg-secondary">{record.dependency}</td>
                <td className="px-4 py-3 font-medium tabular-nums text-fg">{record.health}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-fg-secondary">{record.change}</span>
                    <span className="text-xs text-fg-muted">{record.updated}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
