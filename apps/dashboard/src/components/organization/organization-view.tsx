"use client";

import { useState } from "react";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { OrganizationSummary } from "@/components/organization/organization-summary";
import { CapacityHeatmap } from "@/components/organization/capacity-heatmap";
import { HealthMatrix } from "@/components/organization/health-matrix";
import { ExecutionOverlay } from "@/components/organization/execution-overlay";
import { DepartmentCard } from "@/components/organization/department-card";
import { Drawer } from "@/components/organization/drawer";
import { AgentDrawerContent } from "@/components/organization/agent-drawer-content";
import { DepartmentDrawerContent } from "@/components/organization/department-drawer-content";
import {
  orgDepartments,
  orgTimeline,
  departmentName,
  type OrgAgent,
  type OrgDepartment,
} from "@/features/organization/mock";

export function OrganizationView() {
  const [agent, setAgent] = useState<OrgAgent | null>(null);
  const [dept, setDept] = useState<OrgDepartment | null>(null);

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* Top summary */}
        <OrganizationSummary />

        {/* Execution overlay */}
        <div className="col-span-12">
          <ExecutionOverlay />
        </div>

        {/* Capacity heatmap */}
        <div className="col-span-12">
          <CapacityHeatmap />
        </div>

        {/* Organization map — department cards */}
        {orgDepartments.map((d) => (
          <div key={d.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <DepartmentCard dept={d} onAgentClick={setAgent} onOpenDept={setDept} />
          </div>
        ))}

        {/* Health matrix */}
        <div className="col-span-12">
          <HealthMatrix />
        </div>

        {/* Timeline */}
        <div className="col-span-12 xl:col-span-8">
          <EventTimeline events={orgTimeline} title="Organization Timeline" />
        </div>
      </div>

      <Drawer
        open={agent !== null}
        onClose={() => setAgent(null)}
        title={agent?.name ?? ""}
        subtitle={agent ? departmentName[agent.department] : undefined}
      >
        {agent && <AgentDrawerContent agent={agent} />}
      </Drawer>

      <Drawer
        open={dept !== null}
        onClose={() => setDept(null)}
        title={dept?.name ?? ""}
        subtitle="Department detail"
      >
        {dept && <DepartmentDrawerContent dept={dept} />}
      </Drawer>
    </>
  );
}
