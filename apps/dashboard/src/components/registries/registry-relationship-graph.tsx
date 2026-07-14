import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registryDefinitions, registryRelationships } from "@/features/registries";
import type { RegistryKey } from "@/features/registries/types";

const primaryFlow: RegistryKey[] = [
  "goals",
  "plans",
  "executions",
  "experience",
  "learning",
  "governance",
];

const sideLinks: RegistryKey[] = [
  "agents",
  "tools",
  "workflows",
  "entities",
  "risk",
];

function registryLabel(id: RegistryKey) {
  return registryDefinitions.find((registry) => registry.id === id)?.title ?? id;
}

function registryRoute(id: RegistryKey) {
  return registryDefinitions.find((registry) => registry.id === id)?.route ?? "/director/registries";
}

export function RegistryRelationshipGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registry Relationships</CardTitle>
        <span className="text-xs text-fg-muted">
          {registryRelationships.length} mapped dependencies
        </span>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col items-center gap-2">
          {primaryFlow.map((id, index) => (
            <div key={id} className="flex w-full max-w-sm flex-col items-center gap-2">
              <Link
                href={registryRoute(id)}
                className="w-full rounded-md border bg-surface-sunken px-4 py-3 text-center text-sm font-semibold text-fg transition-colors duration-(--dur-fast) hover:bg-surface-raised"
              >
                {registryLabel(id)}
              </Link>
              {index < primaryFlow.length - 1 && (
                <ArrowDown className="size-4 text-fg-muted" />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {sideLinks.map((id) => (
            <Link
              key={id}
              href={registryRoute(id)}
              className="flex items-center justify-between rounded-md border bg-surface-sunken px-4 py-3 text-sm font-medium text-fg transition-colors duration-(--dur-fast) hover:bg-surface-raised"
            >
              <span>{registryLabel(id)}</span>
              <ArrowRight className="size-4 text-fg-muted" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
