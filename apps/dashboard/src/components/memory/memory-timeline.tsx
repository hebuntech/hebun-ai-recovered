import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemoryRecord } from "@/features/memory";

export function MemoryTimeline({ memories }: { memories: MemoryRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Timeline</CardTitle>
        <span className="text-xs text-fg-muted">
          what the company should continue remembering over time
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {memories.map((memory) => (
          <div key={memory.id} className="border-l-2 border-border pl-4">
            <p className="text-sm font-semibold text-fg">{memory.title}</p>
            <p className="mt-1 text-sm text-fg-secondary">{memory.summary}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {memory.timestamp.slice(0, 10)} · {memory.category} · {memory.owner}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
