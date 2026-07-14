import type {
  DirectorAIRecommendation,
  ExecutiveConversationContextModel,
  ExecutiveQuestion,
} from "./types";
import type { OrganizationalIntelligenceInsight } from "@/features/organizational-intelligence";

export const ExecutiveConversationContext = {
  create(input: {
    questions: ExecutiveQuestion[];
    recommendations: DirectorAIRecommendation[];
    insights: OrganizationalIntelligenceInsight[];
    focusSummary: string;
  }): ExecutiveConversationContextModel {
    return {
      generatedAt: new Date().toISOString(),
      focusSummary: input.focusSummary,
      activeQuestionIds: input.questions.slice(0, 6).map((question) => question.id),
      topRecommendationIds: input.recommendations.slice(0, 4).map((recommendation) => recommendation.id),
      topInsightIds: input.insights.slice(0, 4).map((insight) => insight.id),
    };
  },
};
