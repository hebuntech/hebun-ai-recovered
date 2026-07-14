# Organization Runtime v1.0

## 1. Purpose

The Organization Runtime defines how a real company operates inside Hebun.

It is the operational architecture that turns Hebun from a collection of modules into a living company model.

Its purpose is to define:

- how work enters the organization
- how responsibility is assigned and transferred
- how humans and AI agents cooperate
- how knowledge and memory move through the company
- how execution happens across departments
- how organizational learning changes future behavior

The Organization Runtime is not a database schema.

It is not a UI.

It is not an execution engine.

It is the model of organizational life inside Hebun.

After this layer exists, it should be clear that Hebun does not merely store company records.

It hosts the operating structure of the company itself.

## 2. Mental Model

The Organization Runtime should be understood as a living organizational system.

The core mental model is:

Organization

↓

Business Units

↓

Departments

↓

Teams

↓

Humans

+

AI Agents

↓

Shared Knowledge

↓

Execution

↓

Organizational Intelligence

This model matters because Hebun does not treat work as abstract tickets moving through software.

It treats work as activity happening inside a real organization:

- with intent
- with ownership
- with authority
- with human and AI participants
- with memory
- with governed knowledge
- with consequences

The organization is not just a set of users.

It is a structured, adaptive operating system:

- strategic
- operational
- collaborative
- governed
- learning

## 3. Organization Anatomy

The Organization Runtime needs a coherent anatomy of the company.

### Company

The company is the highest operating subject.

It owns:

- mission
- strategic priorities
- organizational health
- global governance posture
- shared knowledge and memory systems

The company is the primary entity that Director AI, the Dashboard, and Organizational Intelligence reason about.

### Business Units

Business Units group major parts of the enterprise that operate with shared objectives, economics, or responsibilities.

Examples:

- Revenue
- Operations
- Corporate Functions
- Product and Engineering
- Risk and Governance

Business Units provide an intermediate operating scope between company and department.

They allow Hebun to model large organizations without flattening everything to one departmental layer.

### Departments

Departments are the core operational units of the company.

Examples:

- Marketing
- Sales
- Finance
- HR
- Operations
- Engineering
- Customer Success
- Legal

Each department has:

- goals
- workflows
- humans
- AI agents
- policies
- knowledge
- memory
- health

Departments are where most daily operating behavior becomes visible.

### Teams

Teams are the local execution groups within departments.

Even where current implementation does not yet model teams as a first-class persistence structure, the runtime architecture must support them conceptually.

Teams exist to capture:

- narrower ownership
- tighter collaboration groups
- specialized execution responsibility
- local memory and knowledge patterns

### Roles

Roles define how responsibility and authority are distributed.

Examples:

- executive roles
- department leaders
- managers
- reviewers
- operators
- stewards
- governance owners
- AI agent roles

Roles matter because Hebun must understand not only who exists, but who is allowed, expected, or accountable to do what.

### Humans

Humans remain core operating actors.

They provide:

- authority
- judgment
- accountability
- approval
- escalation handling
- domain expertise
- exception handling

Humans are not “fallbacks.”

They are constitutional participants in the organization runtime.

### Agents

AI Agents are first-class organizational workers.

They are not plug-ins or helper bots.

They participate in:

- execution
- reasoning
- workflow completion
- support work
- planning support
- compliance support
- learning support

Agents belong to the company in the same structural sense that teams and humans do, but under explicit governance and authority boundaries.

### Assets

Assets are the reusable organizational resources the company operates through.

Examples:

- workflows
- plans
- execution blueprints
- policies
- tools
- models
- capabilities
- governed documents

Assets are what make organizational capability durable instead of purely human-dependent.

### Knowledge

Knowledge is the governed truth layer of the organization.

It stores:

- what the company believes
- what it has validated
- what it can rely on
- what is outdated and needs review

### Policies

Policies are the rule layer of organizational behavior.

They define:

- boundaries
- required controls
- allowed and disallowed actions
- approval expectations

### Governance

Governance is the authority and decision layer.

It determines:

- who may decide
- what requires review
- what may be escalated
- what must be justified

Together, these pieces form the anatomy of an AI-native company in Hebun.

## 4. Operational Model

The operational model explains how the organization actually works.

### How work enters the organization

Work can enter through many sources:

- customer demand
- strategic intent
- mission-driven goals
- operational incidents
- human requests
- compliance obligations
- recurring workflows
- Director decisions
- learning-generated improvements

Hebun should treat all such inputs as organizational work signals.

### How work flows

Work flows through the organization as a structured progression:

signal

→ interpretation

→ prioritization

→ goal or plan alignment

→ ownership assignment

→ workflow or task formation

→ execution

→ review

→ learning

→ organizational memory and intelligence

The runtime should make this visible and traceable.

### How responsibility moves

Responsibility is not static.

It can move:

- from company to business unit
- from business unit to department
- from department to team
- from human to agent
- from agent back to human
- from one department to another in cross-functional work

Responsibility transfer must preserve:

- ownership history
- decision context
- authority boundary
- state continuity

### How execution happens

Execution happens through workflows, tasks, plans, commands, humans, and agents acting within governed boundaries.

Execution is not just task completion.

It is the operational realization of organizational intent.

### How learning feeds back

Every meaningful outcome should feed back into:

- memory
- knowledge
- policy review
- governance refinement
- future planning
- organizational intelligence

This makes the organization adaptive instead of static.

## 5. Human + AI Collaboration

Hebun must model human and AI collaboration as a constitutional operating relationship.

### Responsibilities

Humans and agents can both contribute to work, but not in identical ways.

Humans primarily provide:

- authority
- supervision
- approvals
- exception handling
- strategic judgment
- ethical and organizational accountability

AI agents primarily provide:

- throughput
- pattern execution
- structured reasoning support
- repetitive or high-volume work handling
- workflow continuity

### Ownership

Ownership must always be explicit.

Questions Hebun should always be able to answer:

- who owns this work now?
- which agent is executing it?
- which human is accountable?
- where does authority sit?

### Delegation

Humans may delegate operational work to agents.

Agents may not self-assign authority.

Delegation should preserve:

- intent
- context
- constraints
- required evidence
- escalation rules

### Escalation

Escalation exists for:

- ambiguity
- policy conflict
- authority threshold
- exception handling
- high-risk consequence

AI agents should escalate rather than silently overextend their role.

### Supervision

Supervision is an operating responsibility, not merely a safety mechanism.

It includes:

- reviewing outputs
- evaluating risk
- managing approvals
- validating important knowledge
- deciding when autonomy should expand or contract

### Authority boundaries

Authority boundaries must remain visible and enforceable at the organizational model level.

Key principle:

- humans hold ultimate authority
- agents operate within delegated scope
- governance controls authority transitions

This keeps the organization AI-native without making it AI-sovereign.

## 6. Department Runtime

Departments are not isolated software domains.

They are cooperating operating organs of the company.

### Marketing

Marketing runtime should own:

- demand generation
- campaigns
- messaging assets
- market learning
- brand and audience knowledge

Its outputs often feed:

- Sales
- Customer Success
- Director intelligence

### Sales

Sales runtime should own:

- pipeline motion
- opportunities
- negotiations
- renewals
- revenue-linked workflows

It depends heavily on:

- Marketing context
- Legal approvals
- Finance terms
- Customer Success health

### Finance

Finance runtime should own:

- budgets
- cash flow
- invoice and payment processes
- financial controls
- financial risk intelligence

It cooperates with:

- Sales
- Operations
- Legal
- Director

### HR

HR runtime should own:

- hiring
- onboarding
- workforce development
- people operations
- performance support

It cooperates with:

- every department
- Director
- Learning
- Governance where hiring or access controls matter

### Operations

Operations runtime should own:

- service execution
- ticket and workflow routing
- process continuity
- throughput stability

It is often the highest-volume execution layer.

### Engineering

Engineering runtime should own:

- product and technical delivery
- systems evolution
- architecture support
- reliability and implementation capacity

It cooperates with:

- Director
- Product or strategic planning
- Operations
- Governance

### Customer Success

Customer Success runtime should own:

- retention
- customer health
- lifecycle support
- renewal coordination

It is a major bridge between external reality and internal organizational learning.

### Legal

Legal runtime should own:

- contracts
- compliance review
- legal risk
- policy interpretation
- governance-sensitive approvals

It is often a control bottleneck and therefore a critical part of operational intelligence.

### How departments cooperate

Departments cooperate through:

- shared goals
- shared plans
- cross-functional workflows
- governed handoffs
- shared knowledge
- shared memory
- approval and escalation paths

Hebun should never model departments as completely separate silos.

It should model them as interdependent operating units with visible collaboration surfaces.

## 7. Cross-functional Work

Cross-functional work is a core property of real organizations.

Hebun must model how work moves across departmental boundaries.

### How work crosses departments

Cross-functional work may move:

- sequentially
- in parallel
- through approval gates
- through shared ownership phases

Examples:

- Sales → Legal → Finance
- HR → Governance
- Learning → Governance → Architecture
- Marketing → Sales → Customer Success

### How ownership changes

When work crosses departments, local execution ownership may change while global accountability remains stable.

Hebun should preserve:

- source department
- current department
- responsible human
- responsible agent
- approving authority
- handoff reason

### How context is preserved

Context must move with the work.

That includes:

- originating goal
- current state
- prior decisions
- constraints
- evidence
- relevant knowledge
- relevant memory
- policy context

Cross-functional work should never lose meaning at the handoff boundary.

This is one of the most important differences between Hebun and ordinary workflow software.

## 8. Organizational Memory

Organizations need memory to avoid starting over every day.

Hebun should model memory at multiple scopes.

### How organizations remember

The organization remembers through:

- company memory
- departmental memory
- team memory
- decision memory
- procedural memory
- learning memory
- conversation summaries

### How departments remember

Departments should accumulate memory around:

- recurring patterns
- playbooks
- incident responses
- operational lessons
- approval behaviors
- customer or process context

### How teams remember

Teams should preserve:

- tactical learnings
- local practices
- coordination patterns
- common failure modes

Organizational memory should be:

- reusable
- scoped
- traceable
- governed where necessary

Without memory, the organization becomes reactive and brittle.

## 9. Knowledge Flow

Knowledge flow defines how organizational truth moves through the company.

### Creation

Knowledge can emerge from:

- execution
- human expertise
- reasoning
- learning
- policy work
- governance decisions

### Validation

New knowledge should be assessed before it is treated as authoritative.

Validation may involve:

- human review
- governance review
- evidence review
- cross-reference with existing knowledge

### Promotion

Validated knowledge becomes promoted organizational truth when it is:

- useful
- supported
- scoped
- stewarded
- approved where required

### Consumption

Knowledge should be consumable by:

- humans
- agents
- workflows
- reasoning
- Director AI
- Organizational Intelligence

### Retirement

Knowledge must also be able to age, deprecate, and retire.

An organization that only adds knowledge and never retires it becomes noisy and dangerous.

Knowledge flow is therefore a living lifecycle, not a static repository.

## 10. Operational Health

Operational health must exist at multiple scopes.

### Company

Measures whether the organization as a whole is operating effectively.

### Department

Measures whether local operational units are healthy, overloaded, risky, or drifting.

### Team

Measures the health of the local delivery group.

### Human

Measures decision burden, approval burden, workload concentration, and escalation pressure.

### Agent

Measures utilization, queue pressure, execution reliability, confidence stability, and governance friction.

Health should be understood as:

- contextual
- explainable
- dynamic
- affected by dependencies

An organization is healthy when its structure, labor, knowledge, workflows, and governance are working together effectively.

## 11. Organization Lifecycle

The Organization Runtime must support organizations at different maturity stages.

### Startup

Characteristics:

- flat structure
- fewer departments
- higher human context sharing
- rapid role changes
- low formalization

Hebun should support flexibility and rapid adaptation here.

### Growth

Characteristics:

- more departments
- repeatable workflows emerging
- knowledge and memory becoming important
- approval structures starting to matter

Hebun should strengthen coordination and shared truth at this stage.

### Scale

Characteristics:

- more teams
- cross-functional complexity
- higher specialization
- growing governance and policy needs

Hebun should emphasize traceability, visibility, and organizational intelligence.

### Enterprise

Characteristics:

- multiple business units
- complex authority chains
- stronger governance and compliance needs
- broader knowledge surfaces

Hebun should support layered structure and controlled delegation here.

### Transformation

Characteristics:

- organizational redesign
- rapid reprioritization
- structural migration
- workflow and workforce change

Hebun should support organizations changing form, not only remaining stable.

## 12. Relationship to Other Runtime Modules

### Director AI

Director AI reasons about the organization runtime.

The organization is the subject Director AI understands.

### Dashboard

The Dashboard presents the organization runtime through executive intelligence views.

### Mission

Mission gives the organization a strategic North Star.

### Workflow

Workflow is one of the primary operational execution structures inside the organization.

### Execution

Execution is where organizational work becomes observable action.

### Knowledge

Knowledge gives the organization durable, governed truth.

### Learning

Learning gives the organization the ability to improve.

### Governance

Governance gives the organization structured authority and decision legitimacy.

The Organization Runtime is the layer that connects these modules into one living organizational system.

Without it, they remain powerful but fragmented capabilities.

## 13. Non-goals

This stage does not define:

- implementation
- code
- schema
- database structure
- migrations
- UI
- provider behavior
- model routing
- live execution logic

It also does not attempt to:

- replace existing domain engines
- redesign departments as software components
- define detailed HR policy
- define detailed ERP or CRM behavior
- turn Director AI into an operator

## Final Definition

The Organization Runtime is the answer to the question:

How does an organization actually operate inside Hebun?

It operates as a living system of:

- strategy
- structure
- humans
- agents
- knowledge
- memory
- execution
- governance
- learning

Work enters the company, moves through responsible organizational units, crosses departments with preserved context, executes through humans and agents under authority boundaries, feeds memory and knowledge, and becomes visible to organizational intelligence and Director AI.

That is what makes Hebun an operating environment for a real company rather than a collection of software modules.
