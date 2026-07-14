import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { HealthGauge } from "@/components/director/health-gauge";
import { DepartmentMatrix } from "@/components/director/department-matrix";
import { CapacityPanel } from "@/components/director/capacity-panel";
import { Card, CardContent } from "@/components/ui/card";
import { departmentHealth, companyHealth } from "@/features/director/mock";

function avg(nums: number[]) {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export default function OrganizationHealthPage() {
  const efficiency = avg(departmentHealth.map((d) => d.efficiency));
  const aiUtil = avg(departmentHealth.map((d) => d.aiUtilization));

  return (
    <>
      <PageHeader
        title="Organization Health"
        context="Capacity, efficiency, AI utilization, learning and risk across departments."
        action={<Badge variant="success">Company Health {companyHealth}</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <Card className="h-full">
            <CardContent className="flex items-center justify-center py-6">
              <HealthGauge value={companyHealth} label="Company Health" />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <Card className="h-full">
            <CardContent className="flex items-center justify-center py-6">
              <HealthGauge value={efficiency} label="Avg Efficiency" />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <Card className="h-full">
            <CardContent className="flex items-center justify-center py-6">
              <HealthGauge value={aiUtil} label="AI Utilization" />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <CapacityPanel />
        </div>

        <div className="col-span-12">
          <DepartmentMatrix title="Department Health Matrix" />
        </div>
      </div>
    </>
  );
}
