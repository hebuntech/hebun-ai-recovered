import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchMemories } from "@/features/memory";

export function MemorySearch({ query = "approval" }: { query?: string }) {
  const result = searchMemories(query);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Search</CardTitle>
        <span className="text-xs text-fg-muted">
          summary-only retrieval preview over computed company memory
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Default Query
          </p>
          <p className="mt-1 text-sm text-fg">{result.query}</p>
        </div>
        {result.results.map((memory) => (
          <div key={memory.id} className="rounded-md border bg-surface-sunken p-3">
            <p className="text-sm font-semibold text-fg">{memory.title}</p>
            <p className="mt-1 text-sm text-fg-secondary">{memory.summary}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {memory.category} · {memory.tags.join(" · ")}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
