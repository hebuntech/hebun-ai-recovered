import type { KnowledgeCategory, KnowledgeDoc } from "@/types";

export const knowledgeCounts: Record<KnowledgeCategory, number> = {
  Articles: 84,
  Policies: 12,
  "Product Docs": 28,
  "Internal Docs": 18,
};

export const recentlyUpdated: KnowledgeDoc[] = [
  {
    id: "kb-201",
    title: "Refund policy for annual plans",
    category: "Policies",
    updatedBy: "Knowledge Base Agent",
    updated: "1h ago",
  },
  {
    id: "kb-198",
    title: "Connecting Supabase to the event bus",
    category: "Product Docs",
    updatedBy: "Knowledge Base Agent",
    updated: "3h ago",
  },
  {
    id: "kb-195",
    title: "Troubleshooting stuck workflow runs",
    category: "Articles",
    updatedBy: "Support Agent",
    updated: "5h ago",
  },
  {
    id: "kb-190",
    title: "Escalation matrix — SLA breach handling",
    category: "Internal Docs",
    updatedBy: "Ticket Management Agent",
    updated: "yesterday",
  },
  {
    id: "kb-186",
    title: "Renewal outreach playbook",
    category: "Internal Docs",
    updatedBy: "Renewal Agent",
    updated: "yesterday",
  },
  {
    id: "kb-181",
    title: "Custom MCP server setup guide",
    category: "Product Docs",
    updatedBy: "Knowledge Base Agent",
    updated: "2d ago",
  },
];
