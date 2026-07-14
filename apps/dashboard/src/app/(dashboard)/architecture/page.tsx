import Link from "next/link";
import { Boxes, Cpu, Database, FileText, Activity, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoreCard } from "@/components/architecture/core-card";
import { FlowChain } from "@/components/architecture/flow-chain";
import {
  cores,
  systemStatus as s,
  architectureEvents,
  flowSteps,
} from "@/features/architecture/mock";

const previewSteps = ["signal", "executive-reasoning", "planning-engine", "agent-runtime", "reflection", "director-ai"];

export default function ArchitectureOverviewPage() {
  const preview = flowSteps
    .filter((step) => previewSteps.includes(step.id))
    .map((step) => ({ id: step.id, label: step.label, kind: step.core }));

  return (
    <>
      <PageHeader
        title="Architecture & Orchestration"
        context="The visual control layer for the Hebun AI Operating System."
        action={<Badge variant="success">AI OS {s.version} · {s.status}</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* KPI row */}
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Cores" value={`${s.cores}`} caption="Cognitive · Execution · Intelligence · Governance" icon={<Cpu className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Engines" value={`${s.engines}`} caption="active across all cores" icon={<Boxes className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Registries" value={`${s.registries}`} caption="single source of truth" icon={<Database className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Platform Health" value={`${s.platformHealth}%`} delta="+0.4%" caption={`${s.adrs} ADRs`} icon={<Activity className="size-4" />} />
        </div>

        {/* Core cards */}
        {cores.map((core) => (
          <div key={core.id} className="col-span-12 sm:col-span-6 xl:col-span-3">
            <CoreCard core={core} />
          </div>
        ))}

        {/* Events + flow preview */}
        <div className="col-span-12 xl:col-span-8">
          <EventTimeline events={architectureEvents} title="Recent Architecture Events" />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                System Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FlowChain items={preview} dense />
              <Link
                href="/architecture/system-flow"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
              >
                View full system flow
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
