import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { communicationMetrics } from "@/features/providers/communication";

export function CommunicationSummary() {
  const items = [
    { label: "Provider Status", value: communicationMetrics.status },
    { label: "Simulation Mode", value: communicationMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capability Coverage", value: `${communicationMetrics.capabilityCoverage}` },
    { label: "Health", value: communicationMetrics.healthStatus },
    { label: "Safety Status", value: communicationMetrics.safetyStatus },
  ];

  return (
    <div className="col-span-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-fg-secondary">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-fg">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
