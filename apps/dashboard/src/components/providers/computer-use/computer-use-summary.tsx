import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computerUseMetrics } from "@/features/providers/computer-use";

export function ComputerUseSummary() {
  const items = [
    { label: "Provider Status", value: computerUseMetrics.status },
    { label: "Simulation Mode", value: computerUseMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capability Coverage", value: `${computerUseMetrics.capabilityCoverage}` },
    { label: "Health", value: computerUseMetrics.healthStatus },
    { label: "Safety Status", value: computerUseMetrics.safetyStatus },
    { label: "Simulation Readiness", value: computerUseMetrics.simulationReadiness },
  ];

  return (
    <div className="col-span-12 grid gap-6 md:grid-cols-2 xl:grid-cols-6">
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
