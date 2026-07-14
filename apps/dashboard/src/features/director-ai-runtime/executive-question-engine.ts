import type {
  DirectorAIResponse,
  ExecutiveContextModel,
  ExecutiveQuestion,
  ExecutiveQuestionCategory,
} from "./types";
import { ExecutiveExplanationEngine } from "./executive-explanation-engine";
import { ExecutiveNavigationEngine } from "./executive-navigation-engine";
import { ExecutiveRecommendationEngine } from "./executive-recommendation-engine";

const DEFAULT_QUESTIONS: ExecutiveQuestion[] = [
  { id: "company-status", category: "company-status", title: "What is happening?", prompt: "Summarize the company’s current operating state." },
  { id: "health", category: "health", title: "What needs attention?", prompt: "Explain the weakest health surfaces right now." },
  { id: "departments", category: "departments", title: "Which department needs help?", prompt: "Identify the department under the most strain." },
  { id: "agents", category: "agents", title: "Where is workforce imbalance?", prompt: "Highlight agent overload and unused capacity." },
  { id: "workflows", category: "workflows", title: "Where is execution slowing?", prompt: "Show workflow bottlenecks and blocked paths." },
  { id: "risks", category: "risks", title: "What is the highest risk?", prompt: "Identify the most serious active runtime risk." },
  { id: "opportunities", category: "opportunities", title: "What should happen next?", prompt: "Surface the strongest organizational leverage opportunity." },
  { id: "governance", category: "governance", title: "Where is governance friction?", prompt: "Explain where approvals or policy load are slowing the company." },
  { id: "transformation", category: "transformation", title: "How transformation-ready are we?", prompt: "Explain current AI transformation maturity and the next milestone." },
];

export const ExecutiveQuestionEngine = {
  listQuestions(): ExecutiveQuestion[] {
    return DEFAULT_QUESTIONS;
  },

  answerQuestion(
    context: ExecutiveContextModel,
    questionId: string,
  ): DirectorAIResponse | undefined {
    const question = DEFAULT_QUESTIONS.find((candidate) => candidate.id === questionId);
    if (!question) return undefined;

    const recommendations = ExecutiveRecommendationEngine.buildRecommendations(context)
      .filter((recommendation) => matchesCategory(recommendation, question.category))
      .slice(0, 3);
    const explanation = ExecutiveExplanationEngine.explain(context, question);
    const navigation = ExecutiveNavigationEngine.buildTargets(context, question.category);

    return {
      question,
      explanation,
      recommendations,
      navigation,
    };
  },
};

function matchesCategory(
  recommendation: DirectorAIResponse["recommendations"][number],
  category: ExecutiveQuestionCategory,
): boolean {
  if (category === "risks") return recommendation.priority === "critical" || recommendation.priority === "high";
  if (category === "opportunities") return recommendation.priority === "medium" || recommendation.priority === "low";
  if (category === "departments") return Boolean(recommendation.affectedDepartment);
  if (category === "workflows") return Boolean(recommendation.affectedWorkflow);
  if (category === "agents") return recommendation.affectedAgents.length > 0;
  if (category === "transformation") return recommendation.id.includes("recommendation-");
  return true;
}
