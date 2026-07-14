"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExecutionNode } from "@/components/execution/execution-node";
import { execStatusConfig } from "@/components/execution/execution-tokens";
import { executions, graphFor } from "@/features/execution/mock";

export function ExecutionGraphViewer() {
  const [selected, setSelected] = useState(executions[0].id);
  const nodes = graphFor(selected);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Execution selector */}
      <div className="col-span-12 xl:col-span-4">
        <Card>
          <CardContent className="flex flex-col gap-2">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Select execution
            </span>
            {executions.map((e) => {
              const s = execStatusConfig[e.status];
              const active = e.id === selected;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelected(e.id)}
                  className={cn(
                    "flex flex-col gap-1 rounded-md border p-3 text-left transition-colors duration-(--dur-fast)",
                    active ? "border-primary/40 bg-primary/12" : "bg-surface hover:border-border-strong hover:bg-surface-raised"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-fg">{e.name}</span>
                    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", s.text)}>
                      <span className={cn("size-1.5 rounded-full", s.dot)} />
                      {s.label}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-fg-muted">{e.id} · {e.nodesDone}/{e.nodesTotal} nodes</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Graph */}
      <div className="col-span-12 xl:col-span-8">
        <ol className="flex flex-col">
          {nodes.map((node, i) => (
            <li key={node.id} className="flex flex-col">
              <ExecutionNode node={node} />
              {i < nodes.length - 1 && (
                <span className="flex h-6 items-center justify-center text-fg-muted">
                  <ArrowDown className="size-4" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
