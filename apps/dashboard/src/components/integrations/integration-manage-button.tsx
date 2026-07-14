"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Drawer } from "@/components/organization/drawer";
import type { integrations } from "@/features/integrations/mock";

type Integration = (typeof integrations)[number];

/*
 * "Manage" was a dead button. Now it honestly opens the shared Drawer with the
 * integration's current detail. Reconfiguration is a prepared command that
 * dispatches once the Command Bus is live.
 */
export function IntegrationManageButton({ integration }: { integration: Integration }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Manage
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={integration.name}
        subtitle={integration.description}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Connection status
            </span>
            <StatusBadge status={integration.status} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
              Granted scopes
            </p>
            <div className="flex flex-wrap gap-2">
              {integration.scopes.map((scope) => (
                <Badge key={scope} variant="neutral" className="font-mono">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Last sync
              </p>
              <p className="mt-1 text-sm font-semibold text-fg">{integration.lastSync}</p>
            </div>
            <div className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                Events today
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums">{integration.eventsToday}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t pt-4">
            <Button variant="outline" disabled className="w-full justify-center">
              Reconfigure integration
            </Button>
            <p className="text-xs leading-5 text-fg-muted">
              Reconfiguration dispatches an <span className="font-mono">integration.update</span>{" "}
              command once the Command Bus is live. This view is read-only for now.
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}
