import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-(--z-sticky) hidden w-(--sidebar-w) flex-col overflow-hidden border-r border-border/70 bg-surface-sunken lg:flex">
      <div className="flex h-(--topbar-h) shrink-0 items-center gap-2 border-b border-border/70 px-6">
        <span className="flex size-7 items-center justify-center rounded-md bg-(image:--gradient-primary) text-xs font-bold text-on-primary">
          H
        </span>
        <span className="text-sm font-bold tracking-tight">Hebun AI</span>
      </div>
      <SidebarNav />
    </aside>
  );
}
