"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close the drawer after navigation
  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-fg-secondary transition-colors duration-(--dur-fast) hover:bg-surface-raised hover:text-fg"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-(--z-overlay)">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-xs"
          />
          <div className="absolute inset-y-0 left-0 flex w-(--sidebar-w) max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-r border-border/70 bg-surface-sunken shadow-lg">
            <div className="flex h-(--topbar-h) shrink-0 items-center justify-between border-b border-border/70 px-4">
              <span className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-(image:--gradient-primary) text-xs font-bold text-on-primary">
                  H
                </span>
                <span className="text-sm font-bold tracking-tight">Hebun AI</span>
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-fg-secondary transition-colors duration-(--dur-fast) hover:bg-surface-raised hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarNav />
          </div>
        </div>
      )}
    </div>
  );
}
