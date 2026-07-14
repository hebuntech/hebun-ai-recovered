import type { AgentEmployeeRuntimeModel } from "@/features/agent-runtime";
import type { TransformationRuntimeSnapshot } from "@/features/enterprise-transformation-runtime";
import type { OrganizationalIntelligenceInsight, OrganizationalIntelligenceSnapshot } from "@/features/organizational-intelligence";
import type {
  CompanyRuntimeModel,
  DepartmentRuntimeModel,
  HumanRuntimeModel,
} from "@/features/organization-runtime";
import type { WorkflowRuntimeModel } from "@/features/workflow-runtime";

export type ExecutiveQuestionCategory =
  | "company-status"
  | "organization"
  | "departments"
  | "agents"
  | "workflows"
  | "health"
  | "risks"
  | "opportunities"
  | "knowledge"
  | "memory"
  | "governance"
  | "transformation";

export interface ExecutiveQuestion {
  id: string;
  category: ExecutiveQuestionCategory;
  title: string;
  prompt: string;
}

export interface DirectorAIRecommendation {
  id: string;
  title: string;
  summary: string;
  reason: string;
  confidence: number;
  priority: "critical" | "high" | "medium" | "low";
  affectedOrganization?: string;
  affectedDepartment?: string;
  affectedWorkflow?: string;
  affectedAgents: string[];
  recommendedActions: string[];
  supportingEvidence: string[];
}

export interface DirectorAIExplanation {
  id: string;
  title: string;
  summary: string;
  evidence: string[];
  whyItMatters: string;
}

export interface ExecutiveNavigationTarget {
  id: string;
  label: string;
  href: string;
  reason: string;
}

export interface ExecutiveConversationContextModel {
  generatedAt: string;
  focusSummary: string;
  activeQuestionIds: string[];
  topRecommendationIds: string[];
  topInsightIds: string[];
}

export interface ExecutiveContextModel {
  generatedAt: string;
  company: CompanyRuntimeModel;
  departments: DepartmentRuntimeModel[];
  humans: HumanRuntimeModel[];
  agents: AgentEmployeeRuntimeModel[];
  workflows: WorkflowRuntimeModel[];
  intelligence: OrganizationalIntelligenceSnapshot;
  transformation: TransformationRuntimeSnapshot;
  conversation: ExecutiveConversationContextModel;
}

export interface DirectorAIResponse {
  question: ExecutiveQuestion;
  explanation: DirectorAIExplanation;
  recommendations: DirectorAIRecommendation[];
  navigation: ExecutiveNavigationTarget[];
}

export interface DirectorAIRuntimeSurface {
  generatedAt: string;
  context: ExecutiveContextModel;
  questions: ExecutiveQuestion[];
  recommendations: DirectorAIRecommendation[];
  explanations: DirectorAIExplanation[];
  navigation: ExecutiveNavigationTarget[];
  dashboardInsights: OrganizationalIntelligenceInsight[];
}
