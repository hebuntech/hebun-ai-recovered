import { AgentRegistry } from "@/features/agent-runtime";
import { EnterpriseTransformationEngine, type TransformationRuntimeSnapshot } from "@/features/enterprise-transformation-runtime";
import { OrganizationalIntelligenceEngine } from "@/features/organizational-intelligence";
import {
  DepartmentRuntimeService,
  HumanRuntimeService,
  OrganizationRuntimeService,
} from "@/features/organization-runtime";
import { WorkflowRegistry } from "@/features/workflow-runtime";
import { ExecutiveConversationContext } from "./executive-conversation-context";
import type {
  DirectorAIRecommendation,
  ExecutiveContextModel,
  ExecutiveQuestion,
} from "./types";
import type { OrganizationalIntelligenceInsight } from "@/features/organizational-intelligence";

export const ExecutiveContextService = {
  getContext(input: {
    questions: ExecutiveQuestion[];
    recommendations: DirectorAIRecommendation[];
    insights: OrganizationalIntelligenceInsight[];
    transformationSnapshot?: TransformationRuntimeSnapshot;
  }): ExecutiveContextModel {
    const company = OrganizationRuntimeService.getCompany();
    const departments = DepartmentRuntimeService.listDepartments();
    const humans = HumanRuntimeService.listHumans();
    const agents = AgentRegistry.listAgents();
    const workflows = WorkflowRegistry.listWorkflows();
    const intelligence = OrganizationalIntelligenceEngine.getSnapshot();
    const transformation = input.transformationSnapshot ?? EnterpriseTransformationEngine.buildSnapshot(intelligence.observations);

    return {
      generatedAt: new Date().toISOString(),
      company,
      departments,
      humans,
      agents,
      workflows,
      intelligence,
      transformation,
      conversation: ExecutiveConversationContext.create({
        questions: input.questions,
        recommendations: input.recommendations,
        insights: input.insights,
        focusSummary: `Enterprise health ${intelligence.health.overallEnterpriseHealth}% with ${intelligence.risks.length} active risks and ${transformation.gaps.length} transformation gaps.`,
      }),
    };
  },
};
