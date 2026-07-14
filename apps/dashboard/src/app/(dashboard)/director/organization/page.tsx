import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { OrganizationView } from "@/components/organization/organization-view";
import { organizationSummary } from "@/features/organization/mock";

export default function LiveOrganizationPage() {
  return (
    <>
      <PageHeader
        title="Live Organization"
        context="A living operational map — who's working, what's running, where the bottlenecks are."
        action={
          <Badge variant="success">
            {organizationSummary.departmentsOnline}/{organizationSummary.departmentsTotal} online
          </Badge>
        }
      />
      <OrganizationView />
    </>
  );
}
