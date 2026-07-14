import type {
  ExecutiveContextModel,
  ExecutiveNavigationTarget,
  ExecutiveQuestionCategory,
} from "./types";

export const ExecutiveNavigationEngine = {
  buildTargets(
    context: ExecutiveContextModel,
    category: ExecutiveQuestionCategory,
  ): ExecutiveNavigationTarget[] {
    if (category === "risks" || category === "governance") {
      return [
        { id: "nav-governance", label: "Governance", href: "/director/governance", reason: "Review approvals, policies, and governance pressure." },
        { id: "nav-risk", label: "Risk", href: "/director/governance/risk", reason: "Inspect active operational and compliance risks." },
      ];
    }

    if (category === "workflows") {
      return [
        { id: "nav-workflows", label: "Workflow Registry", href: "/director/registries/workflows", reason: "Inspect the current workflow operating state." },
        { id: "nav-execution", label: "Execution Center", href: "/director/execution-center", reason: "Drill into execution pressure and blocked paths." },
      ];
    }

    if (category === "agents") {
      return [
        { id: "nav-agents", label: "Agent Registry", href: "/director/registries/agents", reason: "Inspect workload, readiness, and authority distribution." },
        { id: "nav-organization", label: "Organization", href: "/director/organization", reason: "Review where agent ownership sits inside the company." },
      ];
    }

    if (category === "departments" || category === "organization") {
      return context.departments.slice(0, 2).map((department) => ({
        id: `nav-department-${department.identity.id}`,
        label: department.identity.name,
        href: "/director/organization",
        reason: `${department.identity.name} is part of the current executive operating view.`,
      }));
    }

    if (category === "transformation") {
      return [
        { id: "nav-dashboard", label: "Dashboard", href: "/dashboard", reason: "Review the AI Transformation section in the executive dashboard." },
        { id: "nav-recommendations", label: "Recommendations", href: "/director/intelligence/recommendations", reason: "Inspect proposed transformation initiatives and their evidence." },
      ];
    }

    return [
      { id: "nav-dashboard", label: "Dashboard", href: "/dashboard", reason: "Return to the executive operating overview." },
      { id: "nav-intelligence", label: "Intelligence", href: "/director/intelligence", reason: "Inspect the intelligence surfaces behind the recommendation." },
    ];
  },
};
