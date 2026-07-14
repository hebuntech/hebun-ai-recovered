import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { coreTheme } from "@/components/architecture/core-theme";
import { coreLabel, type EngineDefinition, type ComponentHealth } from "@/features/architecture/mock";

const healthConfig: Record<ComponentHealth, { label: string; dot: string; text: string }> = {
  healthy: { label: "Healthy", dot: "bg-success", text: "text-success" },
  degraded: { label: "Degraded", dot: "bg-warning", text: "text-warning" },
  idle: { label: "Idle", dot: "bg-fg-muted", text: "text-fg-secondary" },
};

export function EngineCard({ engine, showCore = false }: { engine: EngineDefinition; showCore?: boolean }) {
  const theme = coreTheme[engine.core];
  const health = healthConfig[engine.health];

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", theme.dot)} />
            <h3 className="text-sm font-semibold text-fg">{engine.name}</h3>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", health.text)}>
            <span className={cn("size-1.5 rounded-full", health.dot)} />
            {health.label}
          </span>
        </div>

        {showCore && (
          <span className={cn("w-fit rounded-sm px-2 py-0.5 text-xs font-medium", theme.bg, theme.text)}>
            {coreLabel[engine.core]}
          </span>
        )}

        <p className="text-sm text-fg-secondary">{engine.purpose}</p>

        <div className="mt-auto flex flex-col gap-1.5 border-t pt-3">
          <p className="text-xs text-fg-muted">
            <span className="font-medium text-fg-secondary">Consumers:</span>{" "}
            {engine.consumers.join(", ")}
          </p>
          <p className="text-xs text-fg-muted">
            <span className="font-medium text-fg-secondary">Last activity:</span>{" "}
            <span className="tabular-nums">{engine.lastActivity}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
