import { knowledgeGraphEdges } from "@/features/knowledge-graph/edges";
import { knowledgeGraphNodes } from "@/features/knowledge-graph/nodes";
import type { CompanyKnowledgeGraph } from "@/features/knowledge-graph/types";

export const companyKnowledgeGraph: CompanyKnowledgeGraph = {
  nodes: knowledgeGraphNodes,
  edges: knowledgeGraphEdges,
};
