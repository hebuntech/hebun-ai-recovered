import type { RegistryKey, RegistryRecord } from "@/features/registries/types";

export const registryRecords: Record<RegistryKey, RegistryRecord[]> = {
  agents: [
    { id: "AG-001", name: "Sales Agent", status: "active", owner: "Sales", consumers: ["Sales Dashboard", "Renewals"], dependency: "Capability Registry", updated: "5m ago", change: "Prompt template updated", health: 97 },
    { id: "AG-002", name: "Contract Review Agent", status: "active", owner: "Legal", consumers: ["Governance", "Legal Center"], dependency: "Tool Registry", updated: "11m ago", change: "Access scope tightened", health: 95 },
    { id: "AG-003", name: "Learning & Development Agent", status: "active", owner: "HR", consumers: ["Learning Center"], dependency: "Model Registry", updated: "1h ago", change: "Capability attached", health: 94 },
    { id: "AG-004", name: "Legacy Outreach Agent", status: "deprecated", owner: "Sales", consumers: ["Archive"], dependency: "Workflow Registry", updated: "3d ago", change: "Deprecated after plan merge", health: 82 },
  ],
  goals: [
    { id: "GO-101", name: "Reduce churn below 8%", status: "active", owner: "Director", consumers: ["Plan Registry"], dependency: "Entity Registry", updated: "12m ago", change: "Success threshold revised", health: 96 },
    { id: "GO-102", name: "Launch enterprise tier", status: "active", owner: "Director", consumers: ["Plan Registry", "Risk Registry"], dependency: "Entity Registry", updated: "43m ago", change: "Risk owner added", health: 92 },
    { id: "GO-103", name: "SOC2 readiness", status: "active", owner: "Legal", consumers: ["Governance Registry"], dependency: "Policy Registry", updated: "2h ago", change: "Approval stage updated", health: 91 },
    { id: "GO-104", name: "Legacy CRM sunset", status: "archived", owner: "Operations", consumers: ["Archive"], dependency: "Workflow Registry", updated: "2w ago", change: "Archived after completion", health: 99 },
  ],
  plans: [
    { id: "PL-201", name: "Q3 Churn Reduction Plan", status: "active", owner: "Planning Engine", consumers: ["Execution Registry"], dependency: "Goal Registry", updated: "9m ago", change: "Milestone added", health: 95 },
    { id: "PL-202", name: "Enterprise Launch Plan", status: "active", owner: "Planning Engine", consumers: ["Execution Registry", "Governance Registry"], dependency: "Goal Registry", updated: "36m ago", change: "Legal dependency linked", health: 92 },
    { id: "PL-203", name: "Hiring Velocity Plan", status: "active", owner: "Planning Engine", consumers: ["Execution Registry"], dependency: "Entity Registry", updated: "1h ago", change: "Owner changed", health: 90 },
    { id: "PL-204", name: "Migration Sprint 04", status: "archived", owner: "Planning Engine", consumers: ["Archive"], dependency: "Workflow Registry", updated: "6d ago", change: "Archived after rollout", health: 98 },
  ],
  executions: [
    { id: "EX-2051", name: "Globex renewal outreach", status: "active", owner: "Execution Core", consumers: ["Experience Registry", "Governance Registry"], dependency: "Plan Registry", updated: "just now", change: "Node status updated", health: 96 },
    { id: "EX-2050", name: "Contract review — Acme MSA", status: "active", owner: "Execution Core", consumers: ["Governance Registry"], dependency: "Workflow Registry", updated: "3m ago", change: "Approval checkpoint added", health: 89 },
    { id: "EX-2046", name: "Compliance monitor sweep", status: "archived", owner: "Execution Core", consumers: ["Audit"], dependency: "Tool Registry", updated: "5h ago", change: "Failure details attached", health: 85 },
    { id: "EX-1988", name: "Legacy invoice import", status: "deprecated", owner: "Execution Core", consumers: ["Archive"], dependency: "Entity Registry", updated: "10d ago", change: "Deprecated after workflow replacement", health: 80 },
  ],
  experience: [
    { id: "XP-301", name: "Enterprise segment converts 3.1×", status: "active", owner: "Experience Store", consumers: ["Learning", "Recommendations"], dependency: "Execution Registry", updated: "18m ago", change: "Tagged for sales playbook", health: 93 },
    { id: "XP-302", name: "Earlier renewal outreach wins", status: "active", owner: "Experience Store", consumers: ["Learning Registry"], dependency: "Execution Registry", updated: "42m ago", change: "Adoption note added", health: 95 },
    { id: "XP-303", name: "Permission deny spike", status: "active", owner: "Experience Store", consumers: ["Governance Registry"], dependency: "Event Registry", updated: "2h ago", change: "Risk category updated", health: 88 },
    { id: "XP-304", name: "Legacy support macro lesson", status: "archived", owner: "Experience Store", consumers: ["Archive"], dependency: "Workflow Registry", updated: "8d ago", change: "Archived after obsolescence", health: 84 },
  ],
  learning: [
    { id: "LR-401", name: "Retention playbook v2", status: "active", owner: "Learning Engine", consumers: ["Capabilities", "Director"], dependency: "Experience Registry", updated: "27m ago", change: "Marked adopted", health: 92 },
    { id: "LR-402", name: "Permission recertification lesson", status: "active", owner: "Learning Engine", consumers: ["Governance Registry"], dependency: "Governance Registry", updated: "59m ago", change: "Evidence attached", health: 90 },
    { id: "LR-403", name: "Candidate fairness threshold", status: "active", owner: "Learning Engine", consumers: ["HR", "Explainability"], dependency: "Experience Registry", updated: "3h ago", change: "Review scheduled", health: 87 },
    { id: "LR-404", name: "Old routing heuristic", status: "deprecated", owner: "Learning Engine", consumers: ["Archive"], dependency: "Model Registry", updated: "2w ago", change: "Deprecated after policy change", health: 79 },
  ],
  tools: [
    { id: "TL-501", name: "GitHub Connector", status: "active", owner: "Tool Layer", consumers: ["Agents", "Governance"], dependency: "Model Registry", updated: "13m ago", change: "Scope refreshed", health: 98 },
    { id: "TL-502", name: "Supabase Connector", status: "active", owner: "Tool Layer", consumers: ["Entities", "Finance"], dependency: "Capability Registry", updated: "1h ago", change: "Connection health verified", health: 97 },
    { id: "TL-503", name: "OpenAI Responses Tool", status: "active", owner: "Tool Layer", consumers: ["Model Router"], dependency: "Model Registry", updated: "2h ago", change: "Cost metadata updated", health: 96 },
    { id: "TL-504", name: "Legacy scraper", status: "archived", owner: "Tool Layer", consumers: ["Archive"], dependency: "Workflow Registry", updated: "9d ago", change: "Archived after API migration", health: 83 },
  ],
  models: [
    { id: "MD-601", name: "gpt-5.5", status: "active", owner: "Model Router", consumers: ["Director", "Planning"], dependency: "Tool Registry", updated: "17m ago", change: "Routing tier raised", health: 97 },
    { id: "MD-602", name: "gpt-5.4", status: "active", owner: "Model Router", consumers: ["Operations", "Legal"], dependency: "Tool Registry", updated: "2h ago", change: "Latency benchmark updated", health: 95 },
    { id: "MD-603", name: "gpt-5.4-mini", status: "active", owner: "Model Router", consumers: ["Workflow Engine"], dependency: "Capability Registry", updated: "4h ago", change: "Low-cost route expanded", health: 94 },
    { id: "MD-604", name: "legacy-fast-model", status: "deprecated", owner: "Model Router", consumers: ["Archive"], dependency: "Tool Registry", updated: "12d ago", change: "Deprecated after quality audit", health: 81 },
  ],
  capabilities: [
    { id: "CP-701", name: "Contract risk scoring", status: "active", owner: "Capability Planner", consumers: ["Legal", "Governance"], dependency: "Model Registry", updated: "14m ago", change: "Threshold tuned", health: 95 },
    { id: "CP-702", name: "Budget approval forecasting", status: "active", owner: "Capability Planner", consumers: ["Finance", "Director"], dependency: "Learning Registry", updated: "1h ago", change: "Consumer added", health: 94 },
    { id: "CP-703", name: "Candidate fairness review", status: "active", owner: "Capability Planner", consumers: ["HR"], dependency: "Governance Registry", updated: "3h ago", change: "Governance gate linked", health: 90 },
    { id: "CP-704", name: "Manual CRM export helper", status: "archived", owner: "Capability Planner", consumers: ["Archive"], dependency: "Tool Registry", updated: "6d ago", change: "Archived after automation", health: 84 },
  ],
  events: [
    { id: "EV-801", name: "approval.escalated", status: "active", owner: "Event Bus", consumers: ["Governance", "Director"], dependency: "Governance Registry", updated: "just now", change: "Triggered by Globex override", health: 96 },
    { id: "EV-802", name: "execution.completed", status: "active", owner: "Event Bus", consumers: ["Experience Registry", "Dashboard"], dependency: "Execution Registry", updated: "2m ago", change: "Payload normalized", health: 95 },
    { id: "EV-803", name: "policy.updated", status: "active", owner: "Event Bus", consumers: ["Governance", "Audit"], dependency: "Policy Registry", updated: "48m ago", change: "Schema version appended", health: 92 },
    { id: "EV-804", name: "legacy.mailhook", status: "deprecated", owner: "Event Bus", consumers: ["Archive"], dependency: "Entity Registry", updated: "14d ago", change: "Deprecated after connector migration", health: 80 },
  ],
  workflows: [
    { id: "WF-901", name: "Contract Review Workflow", status: "active", owner: "Workflow Engine", consumers: ["Legal", "Governance"], dependency: "Agent Registry", updated: "8m ago", change: "Approval step inserted", health: 96 },
    { id: "WF-902", name: "Renewal Outreach Workflow", status: "active", owner: "Workflow Engine", consumers: ["Sales", "Experience"], dependency: "Model Registry", updated: "33m ago", change: "Learning signal added", health: 95 },
    { id: "WF-903", name: "HR Screening Workflow", status: "active", owner: "Workflow Engine", consumers: ["HR", "Explainability"], dependency: "Governance Registry", updated: "2h ago", change: "Reasoning summary linked", health: 91 },
    { id: "WF-904", name: "Legacy import flow", status: "archived", owner: "Workflow Engine", consumers: ["Archive"], dependency: "Entity Registry", updated: "7d ago", change: "Archived after decommission", health: 84 },
  ],
  entities: [
    { id: "EN-1001", name: "Globex", status: "active", owner: "Entity Service", consumers: ["Sales", "Finance", "Legal"], dependency: "Event Registry", updated: "19m ago", change: "Contract link added", health: 98 },
    { id: "EN-1002", name: "Acme GmbH", status: "active", owner: "Entity Service", consumers: ["Legal", "Governance"], dependency: "Risk Registry", updated: "1h ago", change: "Compliance note updated", health: 95 },
    { id: "EN-1003", name: "Northwind", status: "active", owner: "Entity Service", consumers: ["Finance", "Operations"], dependency: "Goal Registry", updated: "3h ago", change: "Vendor tier changed", health: 93 },
    { id: "EN-1004", name: "Legacy Vendor 07", status: "archived", owner: "Entity Service", consumers: ["Archive"], dependency: "Risk Registry", updated: "12d ago", change: "Archived after sunset", health: 85 },
  ],
  governance: [
    { id: "GV-1101", name: "Approval lineage set", status: "active", owner: "Governance Core", consumers: ["Director", "Audit"], dependency: "Execution Registry", updated: "7m ago", change: "New approval linked", health: 97 },
    { id: "GV-1102", name: "Permission exception record", status: "active", owner: "Governance Core", consumers: ["Security", "Risk"], dependency: "Event Registry", updated: "38m ago", change: "Conflict attached", health: 94 },
    { id: "GV-1103", name: "Explainability evidence bundle", status: "active", owner: "Governance Core", consumers: ["HR", "Director"], dependency: "Learning Registry", updated: "2h ago", change: "Coverage score updated", health: 92 },
    { id: "GV-1104", name: "Legacy override waiver", status: "archived", owner: "Governance Core", consumers: ["Archive"], dependency: "Policy Registry", updated: "9d ago", change: "Archived after policy rewrite", health: 86 },
  ],
  risk: [
    { id: "RK-1201", name: "Approval backlog delays enterprise deals", status: "active", owner: "Risk Engine", consumers: ["Director", "Governance"], dependency: "Governance Registry", updated: "5m ago", change: "Mitigation status changed", health: 93 },
    { id: "RK-1202", name: "HR role conflict", status: "active", owner: "Risk Engine", consumers: ["Governance", "HR"], dependency: "Entity Registry", updated: "51m ago", change: "New reviewer assigned", health: 90 },
    { id: "RK-1203", name: "Explainability gap in screening", status: "active", owner: "Risk Engine", consumers: ["HR", "Director"], dependency: "Learning Registry", updated: "2h ago", change: "Trend changed to up", health: 88 },
    { id: "RK-1204", name: "Legacy vendor exposure", status: "archived", owner: "Risk Engine", consumers: ["Archive"], dependency: "Entity Registry", updated: "13d ago", change: "Closed after remediation", health: 91 },
  ],
  policies: [
    { id: "PO-1301", name: "Executive Approval Thresholds", status: "active", owner: "Policy Registry", consumers: ["Governance", "Sales"], dependency: "Governance Registry", updated: "2d ago", change: "Version 3.1 published", health: 96 },
    { id: "PO-1302", name: "AI Explainability Standard", status: "active", owner: "Policy Registry", consumers: ["HR", "Director"], dependency: "Learning Registry", updated: "4h ago", change: "Review note attached", health: 93 },
    { id: "PO-1303", name: "Tool Permission Policy", status: "active", owner: "Policy Registry", consumers: ["Security", "Governance"], dependency: "Tool Registry", updated: "1w ago", change: "Recertification schedule updated", health: 95 },
    { id: "PO-1304", name: "Legacy access waiver", status: "deprecated", owner: "Policy Registry", consumers: ["Archive"], dependency: "Risk Registry", updated: "3w ago", change: "Deprecated after cleanup", health: 82 },
  ],
};
