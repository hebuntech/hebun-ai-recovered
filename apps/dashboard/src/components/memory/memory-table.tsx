import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemoryRecord } from "@/features/memory";

export function MemoryTable({
  memories,
  title = "Memory Table",
}: {
  memories: MemoryRecord[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted">
          persistent company memory referencing registries and graph objects
        </span>
      </CardHeader>
      <CardContent className="ui-table-wrap">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-fg-secondary">
            <tr>
              <th className="pb-3 pr-4 font-medium">Memory</th>
              <th className="pb-3 pr-4 font-medium">Type</th>
              <th className="pb-3 pr-4 font-medium">Owner</th>
              <th className="pb-3 pr-4 font-medium">Registries</th>
              <th className="pb-3 pr-4 font-medium">Graph Refs</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {memories.map((memory) => (
              <tr key={memory.id} className="border-t border-border/70">
                <td className="py-3 pr-4">
                  <p className="font-medium text-fg">{memory.title}</p>
                  <p className="text-xs text-fg-muted">{memory.id}</p>
                </td>
                <td className="py-3 pr-4 text-fg-secondary">{memory.category}</td>
                <td className="py-3 pr-4 text-fg-secondary">{memory.owner}</td>
                <td className="py-3 pr-4 text-fg-secondary">{memory.registryIds.length}</td>
                <td className="py-3 pr-4 text-fg-secondary">
                  {memory.graphNodeIds.length}/{memory.graphRelationshipIds.length}
                </td>
                <td className="py-3 pr-4 text-fg-secondary">{memory.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
