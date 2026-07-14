import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentCard } from "@/features/agents/agent-card";
import { agents } from "@/features/agents/mock";
import type { ResolvedModule } from "@/config/sidebar.config";

export function ModulePlaceholder({ module }: { module: ResolvedModule }) {
  const { section, group, item } = module;
  const agent = item.agentId
    ? agents.find((a) => a.id === item.agentId)
    : undefined;

  return (
    <>
      <PageHeader
        title={item.label}
        context={[section.label, group.label].filter(Boolean).join(" · ")}
        action={
          <Badge variant={section.placeholder ? "warning" : "info"}>
            {section.placeholder ? "planned" : "placeholder"}
          </Badge>
        }
      />

      <div className="grid grid-cols-12 gap-5 lg:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <div className="space-y-4">
            <EmptyState
              eyebrow="Module Placeholder"
              title={`${item.label} is not populated yet`}
              description={
                item.description ??
                section.description ??
                "This module exists in the Hebun AI architecture map. Its page content will appear when the module is implemented."
              }
              icon={<Construction className="size-5" />}
              action={
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
                >
                  <ArrowLeft className="size-4" />
                  Back to Director Dashboard
                </Link>
              }
            />
          </div>
        </div>

        {agent && (
          <div className="col-span-12 xl:col-span-4">
            <AgentCard agent={agent} />
          </div>
        )}
      </div>
    </>
  );
}
