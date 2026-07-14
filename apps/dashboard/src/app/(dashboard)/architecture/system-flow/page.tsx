import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FlowChain } from "@/components/architecture/flow-chain";
import { coreTheme, type FlowKind } from "@/components/architecture/core-theme";
import { cn } from "@/lib/utils";
import { flowSteps } from "@/features/architecture/mock";

const legend: { kind: FlowKind; label: string }[] = [
  { kind: "signal", label: "Signal" },
  { kind: "cognitive", label: "Cognitive" },
  { kind: "execution", label: "Execution" },
  { kind: "intelligence", label: "Intelligence" },
  { kind: "director", label: "Director" },
];

export default function SystemFlowPage() {
  const items = flowSteps.map((s) => ({ id: s.id, label: s.label, detail: s.detail, kind: s.core }));

  return (
    <>
      <PageHeader
        title="System Flow"
        context="The complete Hebun AI Operating System flow — signal to Director."
        action={<Badge variant="primary">{flowSteps.length} steps</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4">
              {legend.map((l) => (
                <span key={l.kind} className="inline-flex items-center gap-2 text-xs font-medium text-fg-secondary">
                  <span className={cn("size-2.5 rounded-full", coreTheme[l.kind].dot)} />
                  {l.label}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 mx-auto w-full max-w-prose">
          <FlowChain items={items} />
        </div>
      </div>
    </>
  );
}
