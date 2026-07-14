import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { communicationCapabilityMappings } from "@/features/providers/communication";

export function CommunicationCapabilities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capability Mapping</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {communicationCapabilityMappings.map((mapping) => (
          <div key={mapping.communication} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              {mapping.framework}
            </p>
            <p className="mt-2 font-semibold text-fg">{mapping.communication}</p>
            <p className="mt-2 text-sm text-fg-secondary">{mapping.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
