import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { registryStatusVariant } from "@/components/registries/registry-tokens";
import type { RegistryDefinition } from "@/features/registries/types";

export function RegistryCard({ registry }: { registry: RegistryDefinition }) {
  const body = (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-fg">{registry.title}</h3>
            <p className="text-sm text-fg-secondary">{registry.description}</p>
          </div>
          <Badge variant={registryStatusVariant(registry.status)}>
            {registry.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              Records
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">{registry.totalRecords}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              Health
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">{registry.health}</p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 text-xs text-fg-muted">
          <span>{registry.owner}</span>
          <span>·</span>
          <span>{registry.freshness}</span>
          <span>·</span>
          <span>+{registry.dailyGrowth}/day</span>
        </div>
      </CardContent>
    </Card>
  );

  if (!registry.route) return body;

  return (
    <Link href={registry.route} className="group block h-full">
      <div className="relative h-full">
        {body}
        <span className="pointer-events-none absolute right-6 bottom-6 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-(--dur-fast) group-hover:opacity-100">
          Open
          <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}
