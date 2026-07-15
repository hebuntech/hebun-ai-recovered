import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KnowledgeGraphRelationship } from "@/features/knowledge-graph";

export function KnowledgeGraphRelationships({ relationships }: { relationships: KnowledgeGraphRelationship[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Relationships</CardTitle><span className="text-xs text-fg-muted">{relationships.length} shown</span></CardHeader>
      <CardContent className="space-y-2">
        {relationships.map((relationship) => (
          <div key={relationship.id} className="grid gap-1 rounded-md border bg-surface-sunken p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <span className="text-sm font-medium text-fg">{relationship.sourceId}</span>
            <span className="text-xs uppercase tracking-wider text-fg-muted">{relationship.relationshipType}</span>
            <span className="text-sm font-medium text-fg sm:text-right">{relationship.targetId}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
