import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { coreTheme, type FlowKind } from "@/components/architecture/core-theme";

export interface FlowChainItem {
  id: string;
  label: string;
  detail?: string;
  kind?: FlowKind;
}

/*
 * Vertical connected flow. Each step is a token-styled card; an arrow
 * connects it to the next. Used by core pages (mini flows) and the
 * full System Flow page.
 */
export function FlowChain({ items, dense = false }: { items: FlowChainItem[]; dense?: boolean }) {
  return (
    <ol className="flex flex-col items-stretch">
      {items.map((item, i) => {
        const theme = coreTheme[item.kind ?? "signal"];
        return (
          <li key={item.id} className="flex flex-col items-stretch">
            <div
              className={cn(
                "flex items-start gap-3 rounded-md border bg-surface",
                theme.border,
                dense ? "px-3 py-2" : "p-4"
              )}
            >
              <span className={cn("mt-1 size-2.5 shrink-0 rounded-full", theme.dot)} />
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold text-fg")}>{item.label}</p>
                {item.detail && !dense && (
                  <p className="mt-0.5 text-xs text-fg-secondary">{item.detail}</p>
                )}
              </div>
            </div>
            {i < items.length - 1 && (
              <span className="flex h-6 items-center justify-center text-fg-muted">
                <ArrowDown className="size-4" />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
