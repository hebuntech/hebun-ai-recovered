import {
  ExecutiveContextService,
} from "./executive-context-service";
import { EnterpriseTransformationEngine, type TransformationRuntimeSnapshot } from "@/features/enterprise-transformation-runtime";
import { ExecutiveExplanationEngine } from "./executive-explanation-engine";
import { ExecutiveNavigationEngine } from "./executive-navigation-engine";
import { ExecutiveQuestionEngine } from "./executive-question-engine";
import { ExecutiveRecommendationEngine } from "./executive-recommendation-engine";
import type { DirectorAIRuntimeSurface } from "./types";

export const DirectorAIRuntime = {
  getRuntimeSurface(options: { transformationSnapshot?: TransformationRuntimeSnapshot } = {}): DirectorAIRuntimeSurface {
    const questions = ExecutiveQuestionEngine.listQuestions();
    const transformationSnapshot =
      options.transformationSnapshot ?? EnterpriseTransformationEngine.getSnapshot();
    const seedContext = ExecutiveContextService.getContext({
      questions,
      recommendations: [],
      insights: [],
      transformationSnapshot,
    });
    const recommendations = ExecutiveRecommendationEngine.buildRecommendations(seedContext);
    const dashboardInsights = [
      ...seedContext.intelligence.executiveInsights,
      ...seedContext.intelligence.risks.slice(0, 2),
      ...seedContext.intelligence.opportunities.slice(0, 1),
    ].slice(0, 4);
    const context = ExecutiveContextService.getContext({
      questions,
      recommendations,
      insights: dashboardInsights,
      transformationSnapshot,
    });

    return {
      generatedAt: new Date().toISOString(),
      context,
      questions,
      recommendations,
      explanations: questions
        .slice(0, 4)
        .map((question) => ExecutiveExplanationEngine.explain(context, question)),
      navigation: ExecutiveNavigationEngine.buildTargets(context, "company-status"),
      dashboardInsights,
    };
  },
};
