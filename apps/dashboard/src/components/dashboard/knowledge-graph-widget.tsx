import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { knowledgeGraphMetrics } from "@/features/knowledge-graph";

export function KnowledgeGraphWidget() {
  return (
    <Card>
      <CardHeader><CardTitle>Knowledge Graph</CardTitle><span className="text-xs text-fg-muted">{knowledgeGraphMetrics.graphHealth} health</span></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-surface-sunken p-3"><p className="text-xs text-fg-muted">Nodes</p><p className="mt-1 font-semibold">{knowledgeGraphMetrics.totalNodes}</p></div>
          <div className="rounded-md border bg-surface-sunken p-3"><p className="text-xs text-fg-muted">Relationships</p><p className="mt-1 font-semibold">{knowledgeGraphMetrics.totalRelationships}</p></div>
        </div>
        <Link href="/director/knowledge-graph" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover">Open Knowledge Graph<ArrowRight className="size-4" /></Link>
      </CardContent>
    </Card>
  );
}
