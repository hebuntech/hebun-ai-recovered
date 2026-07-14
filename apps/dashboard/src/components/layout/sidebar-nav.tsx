"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { sidebarConfig, sectionIdForPath } from "@/config/sidebar.config";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { SidebarSection } from "./sidebar-section";
import { ProgramProgress } from "./program-progress";
import { cn } from "@/lib/utils";

/**
 * The full navigation body, generated from sidebar.config.ts.
 * Used by both the desktop sidebar and the mobile drawer.
 */
export function SidebarNav() {
  const pathname = usePathname();
  const activeSectionId = sectionIdForPath(pathname);
  const defaultOpen = useMemo(
    () => (activeSectionId ? [activeSectionId] : ["director"]),
    [activeSectionId]
  );
  const { open, toggle, ensureOpen } = useSidebarState(defaultOpen);

  // navigating into a closed section opens it
  useEffect(() => {
    if (activeSectionId) ensureOpen(activeSectionId);
  }, [activeSectionId, ensureOpen]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {sidebarConfig.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            open={open.includes(section.id)}
            onToggle={() => toggle(section.id)}
            pathname={pathname}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-3 border-t px-3 py-4">
        <ProgramProgress />
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm",
            "transition-colors duration-(--dur-fast)",
            pathname === "/settings"
              ? "bg-primary-subtle font-medium text-fg"
              : "text-fg-secondary hover:bg-surface-raised hover:text-fg"
          )}
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
