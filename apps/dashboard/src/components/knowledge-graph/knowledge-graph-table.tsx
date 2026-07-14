import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KnowledgeGraphNode } from "@/features/knowledge-graph";

export function KnowledgeGraphTable({
  nodes,
  title = "Knowledge Graph Nodes",
}: {
  nodes: KnowledgeGraphNode[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted">
          registry-derived nodes that will anchor future planning, memory and execution
        </span>
      </CardHeader>
      <CardContent className="ui-table-wrap">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-fg-secondary">
            <tr>
              <th className="pb-3 pr-4 font-medium">Node</th>
              <th className="pb-3 pr-4 font-medium">Registry</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 pr-4 font-medium">Owner</th>
              <th className="pb-3 pr-4 font-medium">Updated</th>
              <th className="pb-3 pr-4 font-medium">Health</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id} className="border-t border-border/70">
                <td className="py-3 pr-4">
                  <p className="font-medium text-fg">{node.title}</p>
                  <p className="text-xs text-fg-muted">{node.metadata.sourceRecordId}</p>
                </td>
                <td className="py-3 pr-4 text-fg-secondary">{node.registryType}</td>
                <td className="py-3 pr-4 text-fg-secondary">{node.status}</td>
                <td className="py-3 pr-4 text-fg-secondary">{node.metadata.owner}</td>
                <td className="py-3 pr-4 text-fg-secondary">{node.metadata.updatedLabel}</td>
                <td className="py-3 pr-4 text-fg-secondary">{node.metadata.health}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
