import { Mail, GitBranch, Database, Triangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { CommandAction } from "@/components/command/command-action";
import { IntegrationManageButton } from "@/components/integrations/integration-manage-button";
import { integrations } from "@/features/integrations/mock";

const icons: Record<string, React.ReactNode> = {
  gmail: <Mail className="size-5" />,
  github: <GitBranch className="size-5" />,
  supabase: <Database className="size-5" />,
  vercel: <Triangle className="size-5" />,
};

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        context="Every service Hebun AI is connected to."
        action={
          <CommandAction
            label="Add Integration"
            commandType="integration.add"
            variant="outline"
            summary="Connect a new external service — provider, scopes, and credentials."
          />
        }
      />
      <div className="grid grid-cols-12 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="col-span-12 md:col-span-6">
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-md bg-surface-raised text-fg-secondary">
                      {icons[integration.id]}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{integration.name}</h3>
                      <p className="text-xs text-fg-secondary">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={integration.status} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {integration.scopes.map((scope) => (
                    <Badge key={scope} variant="neutral" className="font-mono">
                      {scope}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-4 text-xs">
                  <span className="text-fg-muted">
                    Last sync {integration.lastSync} ·{" "}
                    <span className="tabular-nums">{integration.eventsToday}</span> events
                    today
                  </span>
                  <IntegrationManageButton integration={integration} />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
