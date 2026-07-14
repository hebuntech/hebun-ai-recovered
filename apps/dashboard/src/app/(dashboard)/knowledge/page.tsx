import { FileText, ScrollText, BookOpen, FolderLock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CommandAction } from "@/components/command/command-action";
import { knowledgeCounts, recentlyUpdated } from "@/features/knowledge/mock";
import type { KnowledgeCategory } from "@/types";

const categoryIcons: Record<KnowledgeCategory, React.ReactNode> = {
  Articles: <FileText className="size-4" />,
  Policies: <ScrollText className="size-4" />,
  "Product Docs": <BookOpen className="size-4" />,
  "Internal Docs": <FolderLock className="size-4" />,
};

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        title="Knowledge Base Center"
        context="Curated by the Knowledge Base Agent — every resolved ticket feeds it."
        action={
          <CommandAction
            label="New Document"
            commandType="document.create"
            variant="outline"
            summary="Add a new document to the knowledge base with ownership and tags."
          />
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Category counts */}
        {(Object.keys(knowledgeCounts) as KnowledgeCategory[]).map((category) => (
          <div key={category} className="col-span-12 sm:col-span-6 xl:col-span-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
                  {categoryIcons[category]}
                </span>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {knowledgeCounts[category]}
                  </p>
                  <p className="text-xs text-fg-secondary">{category}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Recently updated */}
        <div className="col-span-12">
          <Card>
            <CardHeader>
              <CardTitle>Recently Updated</CardTitle>
              <span className="text-xs text-fg-muted">
                {recentlyUpdated.length} documents
              </span>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {recentlyUpdated.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{doc.title}</p>
                    <p className="text-xs text-fg-muted">
                      Updated by {doc.updatedBy} · {doc.updated}
                    </p>
                  </div>
                  <Badge variant="neutral" className="shrink-0">
                    {doc.category}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
