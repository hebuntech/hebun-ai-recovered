import { buildKnowledgeGraphEdges } from "@/features/knowledge-graph/graph-builder";
import { knowledgeGraphNodes } from "@/features/knowledge-graph/nodes";

export const knowledgeGraphEdges = buildKnowledgeGraphEdges(knowledgeGraphNodes);
