# Organizational Intelligence Engine v1.0

## 1. Purpose

The Organizational Intelligence Engine is the intelligence layer of the Hebun Operating System.

Its purpose is to continuously assemble a living operational model of a company from the systems Hebun already understands:

- mission
- goals
- plans
- tasks
- workflows
- executions
- commands
- knowledge
- memory
- reasoning
- learning
- governance
- policy
- humans
- AI agents
- organizations
- departments

It does not exist to display historical metrics.

It exists to answer higher-order operational questions such as:

- What is the company trying to do right now?
- What is helping or hurting progress?
- Where is the organization healthy, overloaded, drifting, blocked, or under-governed?
- Which patterns are emerging across departments, humans, agents, workflows, and decisions?
- What should Director AI understand before it recommends action?

This engine turns the rest of Hebun from a set of product modules into an operating intelligence system.

## 2. Mental Model

The engine should be understood as a company-scale situational awareness layer.

Business Intelligence asks:

- What happened?
- How much happened?
- How did a metric change?

Organizational Intelligence asks:

- Why is the company behaving this way?
- What operational structures are producing current outcomes?
- Which missions, goals, workflows, agents, policies, and decisions are interacting well or poorly?
- What is likely to become a bottleneck, risk, opportunity, or recommendation?

The engine is not a dashboard widget collection.

It is a semantic model of organizational reality:

- intent model
- work model
- execution model
- knowledge model
- memory model
- governance model
- learning model
- health model

It should ultimately let Director AI reason about the company the way an experienced operator would, but with complete cross-domain visibility and consistent contracts.

## 3. Engine Responsibilities

The Organizational Intelligence Engine is responsible for:

- observing runtime-adjacent organizational state across all existing Hebun domains
- normalizing that state into one shared intelligence view
- preserving the distinction between raw facts and interpreted intelligence
- producing organization-level, department-level, human-level, agent-level, workflow-level, mission-level, goal-level, execution-level, and knowledge-level health views
- identifying bottlenecks, drift, load imbalance, governance friction, and learning signals
- expressing findings in a form consumable by Director Dashboard, Director AI, agents, reports, and future APIs
- providing high-level organizational scoring without becoming a source of runtime authority
- supporting future recommendations, alerts, predictions, and opportunities without yet implementing them

The engine is not responsible for:

- executing work
- mutating data
- approving governance actions
- enforcing policy
- calling providers
- making runtime decisions directly
- replacing existing domain engines

## 4. Observed Domains

The current project already gives the engine visibility into the following domains.

### Strategic intent domains

- Mission
  - company North Star
  - mission versioning
  - ratification and review timing
- Goal
  - mission-derived outcomes
  - progress, success metrics, confidence, health, review cadence
- Plan
  - strategy records under goals
  - milestones, dependencies, readiness, risks, resources, approval gates
- Task
  - executable work units
  - assignment, execution type, dependencies, capabilities, acceptance criteria

### Operational work domains

- Workflow
  - execution graph
  - orchestration metadata
  - lifecycle and health
- Execution
  - run status
  - retries
  - duration
  - execution context
  - provider resolution
  - timestamps
  - lineage to workflow, task, plan, goal, mission, command
- Command
  - decision-to-action linkage
  - execution causation surface

### Intelligence foundation domains

- Knowledge
  - governed knowledge nodes and edges
  - authority, scope, freshness, stewardship, provenance, ratification
- Memory
  - episodic, semantic, procedural, decision, learning, conversation memory
  - importance, status, lineage, trust, promotion metadata
- Reasoning
  - auditable reasoning summaries
  - evidence, assumptions, alternatives, uncertainty, recommendations, verification
- Learning
  - learning sessions
  - pattern detection
  - root cause analysis
  - drift and regression signals
  - improvement proposals

### Control domains

- Governance
  - sessions
  - decisions
  - authority lineage
  - gates
  - approval chains
  - risk class
- Policy
  - policy anatomy
  - domain
  - authority
  - constraints
  - enforcement contract definitions

### Organizational actor domains

- Agent
  - ownership, capability, role, performance surfaces
- Human
  - ownership, approvals, workload, escalation, review participation
- Organization
  - company sub-structure and ownership
- Department
  - departmental ownership and management scope

### Product-facing observational surfaces

- Director Dashboard
- Director intelligence pages
- organization health surfaces
- execution center
- governance center
- policy center
- reasoning panels
- memory and knowledge surfaces
- live organization view

These are not the engine itself, but they prove the product already expects cross-domain intelligence outputs.

## 5. Signals

Signals are the raw operational indicators the engine can observe before interpretation.

Examples include:

- Mission alignment
  - whether goals, plans, workflows, and reasoning traces still align with the active mission
- Goal progress
  - stated progress, target movement, confidence, review aging, blocked status
- Workflow health
  - lifecycle state, throughput, stuck stages, rollback patterns, compensation frequency
- Execution success
  - completion rate, retries, failures, duration, waiting states, blocked states
- Knowledge growth
  - new nodes, new edges, governed truth coverage, domain expansion
- Learning velocity
  - number and quality of learning sessions, improvement proposals, adoption cadence
- Agent utilization
  - queue size, running tasks, response time, health, execution history
- Human workload
  - approval load, escalation burden, review burden, ownership concentration
- Policy violations
  - watch/fail results, blocked decisions, control gaps
- Governance bottlenecks
  - approval aging, session buildup, authority concentration, review chain delay
- Operational risk
  - open high-severity risks, recurring failures, drift, low-confidence execution
- Strategic drift
  - work executing without clear mission or goal alignment
- Decision latency
  - time between signal, reasoning, governance, and decision closure
- Approval latency
  - time waiting on humans, managers, executives, or emergency layers
- Execution latency
  - plan-to-task, task-to-execution, execution-to-completion timing
- Knowledge freshness
  - overdue reviews, stale authoritative knowledge, outdated domain truth
- Memory promotion
  - whether useful experience is becoming reusable organizational memory
- Reasoning quality
  - evidence coverage, assumption quality, conflict handling, verification depth, confidence stability
- Organization health
  - cross-department composite of capacity, execution, governance, learning, and risk
- Department health
  - localized operational condition

Additional signal families the engine should support:

- capacity imbalance
- approval concentration
- dependency fragility
- execution volatility
- governance saturation
- learning adoption lag
- knowledge fragmentation
- mission-to-work traceability gaps
- policy-to-execution friction
- human/agent coordination gaps

## 6. Derived Intelligence

Raw observations become intelligence in stages.

### Stage A: Observation

The engine collects declared state from observed domains:

- statuses
- lineage
- ownership
- timing
- health
- relationships
- evidence
- risks
- approvals
- patterns

At this stage the engine only knows facts.

### Stage B: Correlation

The engine links facts across domains:

- mission to goals
- goals to plans
- plans to tasks
- tasks to workflows
- workflows to executions
- executions to reasoning
- reasoning to knowledge and memory
- learning to recommendations and governance
- policy to blocked or delayed work
- departments to humans and agents

At this stage the engine knows connected operational context.

### Stage C: Interpretation

The engine identifies meaning from correlated facts:

- recurring delays become bottlenecks
- repeated failures become execution instability
- approval accumulation becomes governance friction
- stale knowledge under active workflows becomes freshness risk
- repeated successful patterns become reusable operational strengths
- misaligned active work becomes strategic drift

At this stage the engine knows what the facts imply.

### Stage D: Intelligence packaging

The engine returns structured outputs such as:

- findings
- insights
- risks
- opportunities
- recommendations
- predictions
- alerts
- health views

At this stage the engine becomes useful to Director AI and product consumers.

## 7. Insight Model

The engine must preserve a strict hierarchy between levels of interpretation.

### Observation

A directly observed fact.

Examples:

- a workflow has been waiting 42 minutes
- a goal is at 45% progress
- a policy check failed
- Legal has 6 pending approvals

### Finding

A localized interpretation of one or more observations.

Examples:

- Legal approval load exceeds its recent operating baseline
- this workflow is blocked by governance, not execution failure
- knowledge review coverage is slipping in one domain

### Insight

A broader organizational truth derived from multiple findings.

Examples:

- Legal is becoming the bottleneck for enterprise expansion
- renewal retention improvements are linked to earlier intervention timing
- high-risk workflows correlate with missing knowledge stewardship

### Recommendation

A proposed action in response to insights.

Examples:

- add contract review capacity
- shorten an approval chain for medium-risk agreements
- prioritize knowledge freshness work in one domain

### Prediction

A forward-looking estimate based on current signals and patterns.

Examples:

- current approval aging will delay a launch milestone
- hiring lag will reduce next-quarter execution velocity

### Alert

An immediate or near-immediate issue requiring attention.

Examples:

- compliance gap blocks current enterprise motion
- permission deny spike indicates operational anomaly

### Opportunity

A positive condition the organization can exploit.

Examples:

- one segment converts materially above baseline
- one workflow pattern has become reusable company playbook material

### Risk

A condition with downside potential and operational consequence.

Examples:

- strategic drift
- authority bottleneck
- stale knowledge on active execution path
- overloaded department

This hierarchy matters because Director AI should not confuse facts with conclusions, or conclusions with actions.

## 8. Health Model

Health is not a single company score.

The engine must support independent health for multiple entity types because organizational weakness is rarely uniform.

### Company health

Represents overall operational condition across strategy, execution, governance, learning, knowledge, and organizational load.

### Department health

Represents local operating condition within a department based on workload, execution, governance burden, learning, and risk.

### Team health

Reserved as a future layer below department.

Current architecture should allow it even though the current schema does not yet model teams as a first-class table.

### Human health

Represents workload, approval burden, escalation load, ownership concentration, review latency, and decision pressure for a person.

### Agent health

Represents utilization, confidence stability, queue pressure, execution outcomes, memory quality, governance friction, and learning contribution for an AI agent.

### Mission health

Represents whether the mission is still active, ratified, current, reviewed, and adequately represented by downstream goals and plans.

### Goal health

Represents progress integrity, confidence, risk, dependencies, review timeliness, and strategic alignment.

### Workflow health

Represents orchestration stability, execution success, recovery burden, stuck states, and dependency quality.

### Knowledge health

Represents freshness, authority, stewardship, review cadence, and alignment between active operations and available truth.

### Execution health

Represents success rate, latency, retries, blocking, provider friction, and completion reliability.

Health should always be contextual:

- a healthy company may still contain an unhealthy department
- a healthy department may depend on an unhealthy workflow
- a healthy workflow may run on stale knowledge
- a healthy goal may be delayed by governance bottlenecks

This is one of the central differences from classical BI rollups.

## 9. Scoring Model

Scoring is required, but this stage defines only the high-level model.

The engine should score through weighted interpretation of signal groups, not a single metric family.

Important scoring principles:

- score by entity type, not one global formula
- separate health scoring from risk scoring
- allow positive and negative signals to coexist
- preserve unknown and low-confidence states instead of fabricating certainty
- include recency and trend, not only current snapshot
- incorporate lineage and dependency importance
- distinguish structural weakness from temporary noise
- treat governance and policy friction as first-class health inputs
- treat stale knowledge and weak learning loops as organizational intelligence debt

Score families should eventually include:

- health score
- risk score
- confidence score
- drift score
- execution reliability score
- governance friction score
- learning maturity score
- knowledge freshness score
- utilization pressure score

## 10. Output Contracts

The engine should return structured, typed product contracts rather than raw aggregates.

High-level output families:

- `OrganizationalObservation`
  - raw observed fact
- `OrganizationalFinding`
  - interpreted local issue or strength
- `OrganizationalInsight`
  - multi-signal organizational truth
- `OrganizationalRecommendation`
  - suggested action with confidence, impact, and rationale
- `OrganizationalPrediction`
  - forward-looking projected condition
- `OrganizationalAlert`
  - urgent or elevated condition
- `OrganizationalOpportunity`
  - leverageable positive condition
- `OrganizationalRisk`
  - downside condition with severity and driver set
- `OrganizationalHealthSnapshot`
  - company/department/team/human/agent/mission/goal/workflow/knowledge/execution health view
- `OrganizationalIntelligenceSnapshot`
  - the complete assembled picture for a consumer

Each output should support:

- subject identity
- entity type
- confidence
- severity or priority
- time horizon
- related domains
- evidence references
- reasoning references
- knowledge references
- memory references
- governance or policy references when relevant
- explainable summary text

The engine should be designed so future APIs can request:

- a full intelligence snapshot
- intelligence for one subject
- health for one subject
- risks for one subject
- recommendations for one subject
- cross-domain drift analysis

## 11. Consumers

### Director Dashboard

Needs:

- organization health
- executive insights
- alerts
- recommendations
- cross-domain bottlenecks
- company operating summary

### Director AI

Will be the primary intelligence consumer.

It should use the engine to understand:

- current organizational state
- what matters most
- why a recommendation exists
- where risk is concentrated
- what is drifting
- what is improving
- what should be escalated

Director AI should consume intelligence, not reconstruct it.

### Agent Runtime

Future agent runtime consumers may need:

- local department health
- workflow health
- knowledge freshness warnings
- policy friction context
- workload and approval signals

This is context support only, not authority transfer.

### Reports

Reports should consume structured intelligence outputs rather than directly summarizing raw tables.

### Notifications

Notifications should consume alerts, aging risks, bottlenecks, and escalations produced by the engine.

### Automation

Future automation should react to engine outputs such as:

- risk thresholds
- bottleneck detection
- stale knowledge alerts
- execution instability signals

### Future APIs

External and internal APIs should be able to query organizational intelligence without knowing how the underlying domains work.

## 12. Non-goals

This stage does not introduce:

- runtime behavior
- live engine execution
- AI provider usage
- LLM calls
- background jobs
- new persistence behavior
- schema changes
- database migrations
- recommendations in production
- predictive models in production
- automated actions
- organizational mutations
- governance mutations
- policy enforcement changes
- UI redesign
- execution engine changes

The engine is also not:

- a BI warehouse
- an analytics dashboard
- a reporting-only layer
- a replacement for reasoning, learning, governance, planning, or execution modules

## 13. Future Evolution

Version 1 defines the architecture boundary.

Future phases can evolve it into:

- a runtime intelligence assembler
- a cross-domain signal normalization pipeline
- an entity-centric health engine
- a bottleneck and drift detector
- a recommendation substrate for Director AI
- a prediction surface for planning and governance
- a structured alerting surface
- a continuous organizational learning layer

Expected evolution path:

1. Define contracts and boundaries
2. Assemble read-only intelligence snapshots from existing modules
3. Add entity health derivation
4. Add findings and insight derivation
5. Add recommendations, risks, opportunities, and alerts
6. Add Director AI consumption
7. Add selective agent runtime consumption
8. Add future API exposure

## Final Definition

Organizational Intelligence in Hebun is the continuously updated understanding of how a company is actually operating across intent, work, execution, knowledge, memory, reasoning, learning, governance, policy, humans, and agents.

It exists because no single existing module knows enough on its own.

- Execution knows what ran.
- Governance knows what was allowed.
- Policy knows what should be allowed.
- Knowledge knows what the company believes.
- Memory knows what the company remembers.
- Reasoning knows why a conclusion was reached.
- Learning knows what improved or regressed.
- Planning knows what should happen next.
- Director needs all of them together.

The Organizational Intelligence Engine is the product layer that joins them into one living operational model of the company.
