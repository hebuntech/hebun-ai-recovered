"use client";

import { useState } from "react";
import { Search, Bell } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { Drawer } from "@/components/organization/drawer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { escalationVariant, alertCategoryLabel } from "@/components/director/director-tokens";
import { criticalAlerts } from "@/features/director/mock";

const severityDot: Record<string, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

export function TopBar() {
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState(false);
  const unread = criticalAlerts.length;

  return (
    <header className="glass sticky top-0 z-(--z-sticky) flex min-w-0 items-center gap-3 border-b border-border/70 px-4 sm:px-6">
      <MobileNav />
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-fg-secondary">
        <span className="truncate font-medium text-fg">Director</span>
        <span className="text-fg-muted">/</span>
        <span className="truncate">Command Center</span>
      </div>

      <button
        type="button"
        onClick={() => setSearch(true)}
        className="hidden h-10 w-64 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-fg-muted transition-colors duration-(--dur-fast) hover:border-border-strong hover:text-fg md:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded-md border border-border bg-surface-sunken px-1.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em]">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setNotifications(true)}
        className="relative flex size-10 items-center justify-center rounded-lg text-fg-secondary transition-colors duration-(--dur-fast) hover:bg-surface-raised hover:text-fg"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-error" />
        )}
      </button>

      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(image:--gradient-primary) text-xs font-semibold text-on-primary shadow-xs">
        ŞS
      </span>

      <Drawer
        open={notifications}
        onClose={() => setNotifications(false)}
        title="Notifications"
        subtitle={`${unread} active alert${unread === 1 ? "" : "s"} requiring attention`}
      >
        <div className="flex flex-col gap-3">
          {criticalAlerts.map((a) => (
            <div key={a.id} className="flex gap-3 rounded-lg border bg-surface-sunken p-4">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", severityDot[a.severity])} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <span className="text-sm font-semibold leading-6 text-fg">{a.title}</span>
                  <Badge variant={escalationVariant[a.escalation]}>{a.escalation}</Badge>
                </div>
                <p className="text-sm leading-6 text-fg-secondary">{a.detail}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <span className="font-medium">{alertCategoryLabel[a.category]}</span>
                  <span>·</span>
                  <span className="tabular-nums">{a.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Drawer>

      <Drawer
        open={search}
        onClose={() => setSearch(false)}
        title="Command Search"
        subtitle="Global search across the platform"
      >
        <div className="flex flex-col gap-4">
          <Badge variant="warning" className="w-fit">
            Coming Soon
          </Badge>
          <p className="text-sm leading-6 text-fg-secondary">
            Global command search will let you jump to any registry, execution, provider, or
            command from one place. It is not wired yet — this is an honest placeholder rather
            than a dead control.
          </p>
        </div>
      </Drawer>
    </header>
  );
}
