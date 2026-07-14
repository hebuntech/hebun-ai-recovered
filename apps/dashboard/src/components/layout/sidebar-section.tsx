"use client";

import { ChevronDown } from "lucide-react";
import type { SidebarSection as SidebarSectionConfig } from "@/config/sidebar.config";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";

interface SidebarSectionProps {
  section: SidebarSectionConfig;
  open: boolean;
  onToggle: () => void;
  pathname: string;
}

function activeHrefForSection(
  section: SidebarSectionConfig,
  pathname: string
): string | undefined {
  return section.groups
    .flatMap((group) => group.items)
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function SidebarSection({
  section,
  open,
  onToggle,
  pathname,
}: SidebarSectionProps) {
  const Icon = section.icon;
  const activeHref = activeHrefForSection(section, pathname);
  const active = activeHref !== undefined;
  const contentId = `sidebar-section-${section.id}`;
  const labelId = `${contentId}-label`;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        id={labelId}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
        title={section.description}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-semibold",
          "transition-colors duration-(--dur-fast)",
          active
            ? "text-fg"
            : "text-fg-secondary hover:bg-surface-raised hover:text-fg"
        )}
      >
        <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
        <span className="min-w-0 flex-1 truncate">{section.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0 text-fg-muted transition-transform duration-(--dur-fast)",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={labelId}
        hidden={!open}
        className="flex flex-col gap-2 pb-2 pl-3"
      >
          {section.groups.map((group, index) => (
            <div
              key={group.label ?? `${section.id}-group-${index}`}
              className="flex flex-col gap-0.5"
            >
              {group.label && (
                <p className="px-3 pt-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-fg-muted">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  active={item.href === activeHref}
                  muted={section.placeholder}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
