import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationValidationProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationValidation({ blueprint }: OrchestrationValidationProps) {
  const checks = Object.entries(blueprint.validationResult.checks);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-sm text-fg-secondary">{blueprint.validationResult.summary}</p>
        </div>
        {checks.map(([key, value]) => (
          <div key={key} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{key}</p>
            <p className="mt-1 text-sm text-fg-secondary">{value ? "Issue detected" : "No issue detected"}</p>
          </div>
        ))}
        {blueprint.validationResult.issues.length > 0 && (
          <div className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              Issues
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
              {blueprint.validationResult.issues.map((issue) => (
                <p key={issue}>{issue}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
