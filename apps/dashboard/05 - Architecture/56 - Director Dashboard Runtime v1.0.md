# Director Dashboard Runtime v1.0

## 1. Dashboard Philosophy

The Director Dashboard exists to be the operating system homepage of an AI-native company.

It is not:

- a BI dashboard
- an analytics console
- a monitoring wall
- a reporting page

Those products answer:

- what the numbers are
- whether systems are up
- what changed in a metric

The Director Dashboard answers:

- what the company is doing
- how the company is doing
- why the company is behaving this way
- where the company is healthy or under strain
- what needs executive attention now
- what the company should do next

The dashboard is the runtime presentation layer for organizational intelligence.

Its job is not to display every metric Hebun knows.

Its job is to convert the output of the Organizational Intelligence Engine into an executive operating picture that is immediately understandable at 8:00 AM.

If the CEO opens Hebun every morning, the dashboard should make three things obvious within seconds:

- the state of the company
- the causes behind that state
- the highest-leverage next actions

## 2. Director Mental Model

The Director Dashboard is organized around four executive questions.

### What is happening?

The dashboard should immediately show:

- overall company health
- which departments are healthy, overloaded, blocked, or drifting
- what major executions are active
- which risks and opportunities are currently material

### Why is it happening?

The dashboard should explain:

- why a department is underperforming
- why a goal is slipping
- why execution is slowing
- why risk is rising
- why an opportunity exists

The dashboard must favor explainable intelligence over unexplained scores.

### What needs attention?

The dashboard should isolate:

- critical risks
- aging approvals
- overloaded humans
- overloaded agents
- blocked workflows
- stale knowledge on active execution paths
- governance or policy bottlenecks

### What should happen next?

The dashboard should surface:

- recommended executive actions
- opportunities that deserve intervention
- departments that need support
- workflows that need drill-down
- decisions that need approval or escalation

This mental model should hold across the entire runtime.

## 3. Dashboard Layers

The Director Dashboard should be layered from most strategic to most operational.

### Layer 1: Executive Summary

The morning answer in one view:

- overall company condition
- major changes
- executive narrative
- top 3 attention items

### Layer 2: Organization Health

A company-wide view of:

- company health
- department health
- health trends
- workload distribution
- execution pressure

### Layer 3: Mission Alignment

A view of whether active work is still aligned with:

- mission
- goals
- plans
- strategic priorities

### Layer 4: Department Health

A comparative layer showing:

- which departments are strong
- which are constrained
- which are blocked
- which require executive help

### Layer 5: Agent Workforce

A view of AI labor across the company:

- utilization
- queue pressure
- health
- execution reliability
- reasoning confidence trends

### Layer 6: Human Workforce

A view of human load where executive coordination matters:

- approvals
- escalations
- ownership concentration
- decision latency
- review burden

### Layer 7: Critical Risks

A focused layer for:

- strategic risks
- governance risks
- execution risks
- policy and compliance risks
- operational risks

### Layer 8: Strategic Opportunities

A positive intelligence layer showing:

- growth opportunities
- efficiency gains
- reusable successful patterns
- high-leverage interventions

### Layer 9: Execution Overview

A live operating view of:

- active executions
- blocked executions
- retrying executions
- slowing workflows
- bottleneck stages

### Layer 10: Knowledge Growth

A view of organizational truth maturity:

- knowledge freshness
- coverage growth
- stewardship gaps
- stale critical knowledge

### Layer 11: Learning Trends

A view of whether the company is actually improving:

- learning velocity
- pattern discovery
- adopted improvements
- unresolved recommendations

### Layer 12: Policy and Governance

A control-layer view of:

- pending approvals
- compliance posture
- governance bottlenecks
- risk concentrations
- explainability coverage

### Layer 13: Recommended Actions

The executive action queue:

- what the Director should decide
- what the Director should unblock
- what the Director should escalate
- what the Director should delegate

## 4. Cards

The Director Dashboard should be composed of intelligence cards, not generic widgets.

Each card must have:

- purpose
- inputs
- displayed intelligence
- refresh model
- priority
- consumers

### 4.1 Executive Summary Card

Purpose:

- summarize the state of the company in one executive narrative

Inputs:

- company health snapshot
- top findings
- top risks
- top opportunities
- recommended actions

Displayed intelligence:

- current company condition
- main drivers of current state
- most important executive context

Refresh model:

- on dashboard load
- whenever top-level intelligence snapshot changes

Priority:

- highest

Consumers:

- CEO
- Director AI
- executive leadership

### 4.2 Company Health Card

Purpose:

- show whether the company is healthy, degrading, improving, or unstable

Inputs:

- company health snapshot
- trend inputs
- risk and execution pressure summaries

Displayed intelligence:

- current health
- trend direction
- health drivers

Refresh model:

- near-real-time snapshot refresh

Priority:

- highest

Consumers:

- CEO
- Director AI

### 4.3 Mission Alignment Card

Purpose:

- show whether current work still serves the company’s intended direction

Inputs:

- mission
- goals
- plans
- workflows
- reasoning traces

Displayed intelligence:

- aligned work
- drifting work
- blocked strategic work
- traceability gaps

Refresh model:

- refresh on strategic object change
- refresh on major workflow/execution state changes

Priority:

- highest

Consumers:

- CEO
- Director AI
- strategic planning layers

### 4.4 Department Health Matrix Card

Purpose:

- compare departments as operating units

Inputs:

- department health snapshots
- capacity
- workload
- execution throughput
- learning and governance signals

Displayed intelligence:

- strongest departments
- weakest departments
- trend changes
- overload areas

Refresh model:

- periodic snapshot refresh
- faster refresh when department health materially changes

Priority:

- high

Consumers:

- CEO
- Director AI
- department leadership

### 4.5 Agent Workforce Card

Purpose:

- show the condition of the AI labor system

Inputs:

- agent health
- queue size
- execution history
- confidence trends
- memory and reasoning support signals

Displayed intelligence:

- overloaded agents
- underused agents
- failing agents
- strong agents
- workforce imbalance

Refresh model:

- high-frequency refresh

Priority:

- high

Consumers:

- CEO
- Director AI
- future agent operations consumers

### 4.6 Human Workforce Card

Purpose:

- surface human bottlenecks in an AI-native company

Inputs:

- approvals
- escalations
- review load
- ownership concentration
- decision latency

Displayed intelligence:

- overloaded decision makers
- approval bottlenecks
- human dependency hotspots

Refresh model:

- event-driven refresh when approvals or escalations change

Priority:

- high

Consumers:

- CEO
- Director AI
- governance leadership

### 4.7 Critical Risks Card

Purpose:

- show the risks that can materially harm company execution or direction

Inputs:

- risk outputs from organizational intelligence
- governance
- policy
- execution
- knowledge freshness
- learning regression signals

Displayed intelligence:

- top risks
- risk severity
- risk drivers
- affected subjects

Refresh model:

- immediate refresh for critical changes
- snapshot refresh for lower-priority changes

Priority:

- highest

Consumers:

- CEO
- Director AI
- governance surfaces

### 4.8 Strategic Opportunities Card

Purpose:

- surface upside, not just downside

Inputs:

- performance patterns
- segment outperformance
- workflow efficiency gains
- successful learning outcomes

Displayed intelligence:

- opportunity summary
- leverage area
- expected business impact
- supporting evidence

Refresh model:

- periodic refresh
- refresh on new meaningful insight or adopted learning

Priority:

- high

Consumers:

- CEO
- Director AI
- planning

### 4.9 Execution Overview Card

Purpose:

- summarize live company work without forcing the CEO into execution detail immediately

Inputs:

- workflow health
- execution status
- retry state
- latency
- blocked states

Displayed intelligence:

- active execution pressure
- slowing areas
- blocked work
- execution reliability

Refresh model:

- high-frequency refresh

Priority:

- high

Consumers:

- CEO
- Director AI
- execution operations

### 4.10 Knowledge Growth Card

Purpose:

- show whether the company’s operational truth is becoming stronger or weaker

Inputs:

- knowledge growth
- freshness
- stewardship
- coverage
- review cadence

Displayed intelligence:

- where knowledge is maturing
- where knowledge is stale
- where active operations lack strong truth support

Refresh model:

- periodic snapshot refresh

Priority:

- medium-high

Consumers:

- CEO
- Director AI
- knowledge governance

### 4.11 Learning Trends Card

Purpose:

- show whether Hebun is learning and improving, not merely operating

Inputs:

- learning sessions
- patterns
- improvement proposals
- adopted improvements
- regression signals

Displayed intelligence:

- learning velocity
- recommendation throughput
- adoption rate
- improvement lag

Refresh model:

- periodic refresh
- refresh on completed learning sessions or proposal state changes

Priority:

- medium-high

Consumers:

- CEO
- Director AI
- learning systems

### 4.12 Policy and Governance Card

Purpose:

- summarize whether the control layer is protecting or slowing the company

Inputs:

- governance sessions
- approvals
- policy evaluations
- compliance state
- explainability coverage

Displayed intelligence:

- open approvals
- approval aging
- policy friction
- compliance posture
- governance bottlenecks

Refresh model:

- event-driven refresh for approvals and critical governance changes

Priority:

- high

Consumers:

- CEO
- Director AI
- governance leadership

### 4.13 Recommended Actions Card

Purpose:

- convert intelligence into executive decision readiness

Inputs:

- recommendations
- risks
- opportunities
- bottleneck findings
- mission alignment issues

Displayed intelligence:

- what action is proposed
- why it matters
- expected impact
- urgency
- confidence

Refresh model:

- refresh on intelligence snapshot update

Priority:

- highest

Consumers:

- CEO
- Director AI

## 5. Timeline

The Director Dashboard requires a change-oriented timeline because intelligence without temporal context is incomplete.

The timeline should answer:

- what changed since yesterday
- what changed since last week
- what changed since last month

### Since yesterday

Focus:

- acute operational change
- new risks
- new opportunities
- major blocked or recovered executions
- new approvals and escalations

### Since last week

Focus:

- department trend shifts
- learning adoption
- recurring bottlenecks
- mission alignment movement
- changes in company health drivers

### Since last month

Focus:

- strategic progress
- organization-level drift
- sustained health changes
- knowledge growth or decay
- structural improvements or regressions

The timeline should not be a raw event log.

It should be a curated intelligence timeline:

- event
- interpreted significance
- affected subject
- time horizon

## 6. Health Overview

Organizational health should be visualized as a hierarchy, not a single badge.

The health overview should show:

- company health
- department health
- mission health
- goal health
- workflow health
- execution health
- knowledge health
- human and agent workload health

The visual model should emphasize:

- current state
- trend
- drivers
- instability

Key health principles:

- every health view must be independently meaningful
- health must be explainable
- health must not hide risk concentration
- health must show where weakness is localized

The dashboard should let a CEO understand:

- whether the company is broadly healthy
- where health is deteriorating
- what is causing deterioration
- where intervention would improve health fastest

## 7. Risk Center

The Risk Center is where the Director sees what can materially harm company performance or direction.

It should classify risks by:

- strategic risk
- operational risk
- execution risk
- governance risk
- policy and compliance risk
- knowledge risk
- workforce risk

Each surfaced risk should include:

- title
- affected subject
- severity
- confidence
- why it exists
- what is being impacted
- recommended response path

The Risk Center should prioritize:

- company-level risks
- department-level risks with strategic consequence
- recurring risks, not only one-off incidents
- risks with compounding behavior

The Director should never have to infer risk from raw telemetry.

## 8. Opportunity Center

The Opportunity Center is the positive counterpart to the Risk Center.

It should surface:

- high-performing operational patterns
- departments outperforming baseline
- workflows with reusable efficiency gains
- successful learning patterns worth scaling
- segment or strategy advantages

Each opportunity should include:

- title
- leverage area
- expected upside
- why the opportunity exists
- confidence
- recommended next move

The purpose is to make Hebun a growth and leverage system, not just a warning system.

## 9. Recommended Actions

Recommended Actions are an executive decision layer, not a task list.

This stage defines only the architecture.

Recommended actions should be produced from:

- risks
- opportunities
- alignment gaps
- governance friction
- execution bottlenecks
- workload imbalances
- knowledge or learning weaknesses

Each recommended action should architecturally contain:

- action title
- target subject
- rationale
- expected impact
- urgency
- confidence
- linked evidence
- likely drill-down destination

Recommended actions should be grouped by executive mode:

- decide
- approve
- escalate
- support
- delegate
- investigate

This keeps the dashboard action-oriented without turning it into an automated system.

## 10. Director Questions

The dashboard must be architected so the Director can ask natural executive questions and immediately find the answer path.

Examples:

- Why are sales down?
- Why is Marketing behind?
- Which department needs help?
- Which Agent is overloaded?
- Where is execution slowing?
- Which goal is drifting?
- What is blocking enterprise growth?
- Why are approvals aging?
- Is the company learning or repeating mistakes?
- Which opportunity should I act on first?

Each question should be answerable through a combination of:

- top-level card summary
- supporting explanation
- linked evidence
- drill-down navigation

The Director should not have to assemble answers manually across ten product areas.

## 11. Navigation Model

The navigation model should follow organizational and operational lineage.

### Primary drill-down path

Company

↓

Department

↓

Team

↓

Workflow

↓

Execution

↓

Command

### Supporting drill-down paths

The runtime should also support:

- Company → Mission → Goal → Plan → Workflow
- Company → Department → Agent
- Company → Risk → affected departments and workflows
- Company → Opportunity → supporting pattern and impacted domain
- Company → Knowledge issue → affected execution path
- Company → Governance issue → approval chain and blocked subject

Navigation must preserve context:

- where the user came from
- why the subject was surfaced
- which intelligence object initiated the drill-down

The Director should feel like they are moving through one living company model, not hopping between disconnected pages.

## 12. Future Director AI Integration

Director AI should consume the dashboard as a structured intelligence surface, not a visual surface.

The dashboard runtime should therefore be architected so every displayed card has a machine-consumable equivalent:

- executive summary snapshot
- health snapshot
- risk set
- opportunity set
- action set
- timeline delta set
- drill-down context

Director AI should use this to:

- explain the company’s current state
- answer executive questions conversationally
- justify recommended actions
- summarize changes since yesterday, last week, and last month
- support deeper drill-down into departments, workflows, executions, and governance states

The dashboard becomes the human-facing control center.

Director AI becomes the conversational operating partner built on the same intelligence contracts.

They should share one runtime model, not two separate truths.

## Final Definition

The Director Dashboard is the control center of an AI-native company.

It is where organizational intelligence becomes executive clarity.

When the CEO opens Hebun AI every morning, the dashboard should immediately reveal:

- how the company is doing
- why it is doing that way
- what requires attention
- where the leverage is
- what should happen next

That is what makes Hebun not another dashboard.

It is the operating homepage of the company itself.
