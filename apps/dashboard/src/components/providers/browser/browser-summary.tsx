import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { browserMetrics } from "@/features/providers/browser";

export function BrowserSummary() {
  const items = [
    { label: "Provider Status", value: browserMetrics.status },
    { label: "Simulation Mode", value: browserMetrics.simulationMode ? "Enabled" : "Disabled" },
    { label: "Capability Coverage", value: `${browserMetrics.capabilityCoverage}` },
    { label: "Health", value: browserMetrics.healthStatus },
    { label: "Simulation Readiness", value: browserMetrics.simulationReadiness },
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
