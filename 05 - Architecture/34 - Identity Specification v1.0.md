# Identity Specification v1.0

> Stage 1 — Identity module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Identity in Hebun AI.
> It specifies the existing module. It adds no features. It defines boundaries.

**Status:** Definitive · **Scope:** Identity module only · **Grounded in:** `src/db/schema/{company,user,membership,role,organization,department,agent,permission,policy}.ts` and `_base.ts`, `_enums.ts`.

---

## 1. Purpose

### Why Identity exists

Hebun AI is a digital company operating system. Every other module — Mission, Goals, Memory, Knowledge, Decision, Departments, Agents — assumes it can answer one question deterministically: **"Who or what is acting, and on behalf of which company?"** Identity is the module that answers it. Without it, nothing else can be owned, attributed, authorized, or audited.

Identity is the **system of record for every actor and every organizational container in the platform.** An actor is anything that can cause a change: a human user, an AI agent, a system account, a service account. A container is anything that owns or groups actors: a company, an organization, a department, a team, a role.

### Business problem it solves

Enterprises fail at three things Identity fixes:

1. **Attribution.** Every action must trace to exactly one accountable actor. "The system did it" is never an acceptable answer to an auditor.
2. **Ownership.** Every record, every agent, every decision belongs to exactly one company (tenant). Cross-tenant leakage is a fatal enterprise defect.
3. **Authorization surface.** Permissions must resolve from a stable, versioned graph of who-belongs-where-as-what — not from ad-hoc checks scattered across code.

Identity provides the single, deterministic source these three depend on.

### Its responsibility

- Own the lifecycle of every actor and container (create → activate → suspend → archive → delete → restore).
- Guarantee tenant isolation: every tenant-owned identity references exactly one `company`.
- Resolve the identity graph: `company → organization → department → team → role → member (human | agent | system | service)`.
- Provide the authoritative answer to `whoIs(actorId)` and `belongsTo(actorId, companyId)`.
- Emit identity events so every other module can react without querying Identity's internal state.
- Preserve an immutable audit trail of every identity mutation.

### What is explicitly NOT its responsibility

- **It does not evaluate business permissions.** It stores the RBAC/ABAC *inputs* (memberships, roles, permission catalog). The *decision* "may this actor run this command" is computed by the Governance / Policy layer using Identity data. Identity answers "who," never "may."
- **It does not authenticate.** Credential verification, password/OTP/session handling belongs to the auth provider (Supabase Auth, mapped via `users.authId`). Identity consumes a verified `authId`; it never validates a secret.
- **It does not model agent behavior, memory, or reasoning.** An `agent` in Identity is only a name, a role label, and an ownership edge. What the agent *knows* or *decides* belongs to Memory, Knowledge, Reasoning.
- **It does not own business data.** Goals, workflows, tickets, finance records reference identities but are owned by their own modules.
- **It does not do org-chart analytics or HR performance.** Hierarchy structure is Identity's; hiring, reviews, org-health scoring are HR/Governance concerns that *read* the hierarchy.

---

## 2. Mental Model

Identity is the **skeleton** of the digital company. Every other module is muscle or organ hanging off that skeleton. If the skeleton is malformed, everything above it collapses.

The mental model in one line: **Company is the tenant root; every identity is either the company itself, a container inside it, or an actor inside a container. Everything else in Hebun points *at* an identity but is *not* an identity.**

### Relationship with each module

| Module | Relationship to Identity |
|---|---|
| **Mission** | A Mission belongs to a Company (identity). It is authored and owned by human/agent actors resolved through Identity. Identity supplies the ownership edge; Mission supplies the content. |
| **Goals** | Goals are assigned *to* departments, teams, or agents. Identity provides the assignable targets and the accountable owner. Goals never define who an agent is. |
| **Memory** | Memory rows are scoped by `tenantId` (a company identity) and attributed to an actor (`createdBy`). Identity guarantees the scope; Memory owns the content and `memoryKind`. |
| **Knowledge** | Same as Memory: tenant-scoped, actor-attributed. Identity draws the boundary; Knowledge fills it. |
| **Decision** | A decision is made *by* an actor (human or agent) and *within* a company. Identity resolves the actor and enforces the tenant. The reasoning and approval chain live in Reasoning/Approval. |
| **Departments** | Departments **are** an Identity container (`departments` table). Identity owns their lifecycle and hierarchy position. Department *capability* (what Sales does) is defined by the Department module. |
| **Agents** | Agents **are** an Identity actor (`agents` table) — "digital employees." Identity owns their existence and ownership edge. Their skills, tools, and runtime belong to the Agent/Execution modules. |
| **Company** | The Company **is** the tenant-root Identity (`companies` table). It is the anchor every tenant-owned identity references via `tenantId`. |
| **Users** | Users **are** the global human Identity (`users` table, `rootColumns`, not tenant-owned). A user reaches a company only through a `membership`. |
| **Permissions** | The permission catalog (`permissions`) and roles (`roles`) are Identity-owned *inputs*. Identity stores them; Governance evaluates them. |
| **Digital Twin** | The whole Identity graph **is** the org-structure layer of the company's Digital Twin. The twin's "who works here, in what shape" is exactly Identity. The twin's "how they perform / what they're doing" is other modules reading Identity. |

### The two spines

- **Ownership spine (vertical):** `company → organization → department → team → member`. Answers "where does this live."
- **Authority spine (lateral):** `member → role → permissions`. Answers "what may this actor be granted."

Every identity sits at a known point on both spines. That is the invariant the whole platform relies on.

---

## 3. Core Domain Objects

Each object below maps to an existing schema table or a specified refinement of one. Common fields come from `_base.ts`:

- **`rootColumns`** (global, not tenant-owned): `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `version`, `lifecycleStatus` (`active | archived | deleted`), `deletedAt`.
- **`tenantColumns`** = `rootColumns` + `tenantId` (FK → `companies.id`, NOT NULL).

`createdBy` / `updatedBy` are **actor references**. `_base.ts` notes the FK is "added when the identity domain is wired" — **this specification is that wiring**: both columns reference an actor identity (see §3.9 Actor).

---

### 3.1 Company

- **Purpose.** The tenant root. Every tenant-owned identity and every business record belongs to exactly one company.
- **Table.** `companies` (`rootColumns`).
- **Fields.** `id`, `name`, `slug` (unique), `plan` (default `free`), lifecycle/audit fields.
- **Required.** `name`, `slug`, `plan`.
- **Optional.** none beyond base.
- **Lifecycle.** Created at onboarding → active → may be suspended (billing/compliance) → archived → never hard-deleted while it owns live records (see §5).
- **Relationships.** `hasMany` organizations, departments, agents, registries, memberships, roles. Is the target of every `tenantId`.
- **Ownership.** Owns itself. Root of the ownership spine.
- **Example.** `Turkish Rug House`, slug `turkish-rug-house`, plan `growth`.

### 3.2 Organization

- **Purpose.** Sub-structure inside a company: a holding division, a subsidiary, a country entity, a brand. Optional layer between company and department.
- **Table.** `organizations` (`tenantColumns`).
- **Fields.** `id`, `tenantId`, `name`, `slug`, base fields.
- **Required.** `tenantId`, `name`, `slug`.
- **Lifecycle.** Create → active → archive. Deleting requires re-parenting or archiving its departments first.
- **Relationships.** `belongsTo` company; `hasMany` departments (a department may reference an organization).
- **Ownership.** Owned by its company.
- **Example.** Company `Hebun Holding` → Organization `Hebun Commerce EU`.

### 3.3 Department

- **Purpose.** The primary functional container — Sales, Finance, Legal, HR. Where agents and human members actually operate.
- **Table.** `departments` (`tenantColumns`, optional `organizationId`).
- **Fields.** `id`, `tenantId`, `organizationId?`, `name`, `slug`, base fields.
- **Required.** `tenantId`, `name`, `slug`.
- **Optional.** `organizationId`.
- **Lifecycle.** Create → active → suspend (freeze) → archive. On merge/split see §5.
- **Relationships.** `belongsTo` company, optionally `belongsTo` organization; `hasMany` agents; is the target of goal/policy assignment.
- **Ownership.** Owned by its company.
- **Example.** `Sales & Customer Operations` under `Hebun Commerce EU`.

### 3.4 Team *(hierarchy layer — see §4)*

- **Purpose.** Optional grouping below a department (a squad inside Sales). Present in the hierarchy model; realized as a self-referential department subtype or membership grouping. Kept in the spec so the hierarchy has no gap between department and member.
- **Fields.** Same shape as department, plus a parent department reference.
- **Ownership.** Owned by company, nested under a department.

### 3.5 Role

- **Purpose.** A named bundle of authority defined **per tenant**. The lateral (authority) spine's anchor.
- **Table.** `roles` (`tenantColumns`).
- **Fields.** `id`, `tenantId`, `name`, `type` (`roleTypeEnum`: `owner | director | operator | auditor | member`, default `member`), base fields.
- **Required.** `tenantId`, `name`, `type`.
- **Lifecycle.** Create → active → archive. A role in use by any membership cannot be deleted, only archived.
- **Relationships.** `belongsTo` company; referenced by memberships; maps to permission grants via the Governance layer.
- **Ownership.** Owned by its company.
- **Example.** `Sales Director` (type `director`), `Read-Only Auditor` (type `auditor`).

### 3.6 User (Human, global)

- **Purpose.** The global human identity. A person exists **once** across the whole platform; company access is granted through memberships.
- **Table.** `users` (`rootColumns` — NOT tenant-owned).
- **Fields.** `id`, `authId` (maps to Supabase Auth), `email` (unique), `name?`, base fields.
- **Required.** `email`.
- **Optional.** `authId`, `name`.
- **Lifecycle.** Register → active → suspend (platform-wide) → archive. A user is never hard-deleted while memberships reference them.
- **Relationships.** `hasMany` memberships (one per company). Reached from a company only via membership.
- **Ownership.** Owns itself globally. Not owned by any tenant.
- **Example.** `senol@hebun.ai`, member of three companies with different roles in each.

### 3.7 Membership (User ↔ Company edge)

- **Purpose.** The bridge that places a global user inside a specific company with a specific role. The single source of "does this user belong to this tenant."
- **Table.** `memberships` (`tenantColumns`). Unique index on `(tenantId, userId)` — **one membership per user per company.**
- **Fields.** `id`, `tenantId`, `userId` (FK → users), `roleId?` (FK → roles), base fields.
- **Required.** `tenantId`, `userId`.
- **Optional.** `roleId` (a member may exist before a role is assigned).
- **Lifecycle.** Create (invite/accept) → active → suspend (revoke access without deleting history) → archive.
- **Relationships.** `belongsTo` user, company, role.
- **Ownership.** Owned by the company.
- **Example.** User `senol@hebun.ai` in company `Turkish Rug House` with role `Owner`.

### 3.8 Agent (AI actor / digital employee)

- **Purpose.** A digital employee — an AI actor that can be assigned goals and act inside a department. In Identity terms, only an actor with a name, a role label, and ownership edges.
- **Table.** `agents` (`tenantColumns`, optional `departmentId`).
- **Fields.** `id`, `tenantId`, `departmentId?`, `name`, `role?`, base fields.
- **Required.** `tenantId`, `name`.
- **Optional.** `departmentId`, `role`.
- **Lifecycle.** Create → activate → suspend (pause) → replace (ownership transfer of its work) → archive.
- **Relationships.** `belongsTo` company, optionally `belongsTo` department. Referenced by execution/reasoning as the acting identity.
- **Ownership.** Owned by the company; operationally assigned to a department.
- **Example.** `Atlas` — role `Sales SDR`, in `Sales & Customer Operations`.

### 3.9 Actor (abstract — the `createdBy` / `updatedBy` target)

- **Purpose.** The unifying abstraction behind every mutation's `createdBy` / `updatedBy`. An Actor is any identity that can cause a change: **Human (user), AI Agent, System Account, or Service Account.**
- **Realization.** Not a new table. An actor reference is a `(actorType, actorId)` pair where `actorType ∈ {human, agent, system, service}` and `actorId` points to `users.id`, `agents.id`, or a system/service account id. This resolves `_base.ts`'s deferred FK deterministically without a speculative cross-table cycle.
- **System Account.** A non-human, non-agent identity representing the platform itself (migrations, schedulers, event processors). Owns actions no human triggered. Company-scoped or platform-global.
- **Service Account.** A non-human identity representing an external integration or API caller acting on a company's behalf. Scoped to one company, granted a narrow role.
- **Why it exists.** Auditability requires that *every* row's `createdBy` resolves to exactly one accountable actor of a known type. The Actor abstraction guarantees this for humans, agents, and machines alike.

### 3.10 Permission (catalog entry — Identity input)

- **Purpose.** The **global catalog** of grantable rights. Identity stores the catalog; Governance decides grants.
- **Table.** `permissions` (`rootColumns` — global).
- **Fields.** `id`, `key` (unique), `scope` (`permissionScopeEnum`: `command | registry | governance | finance | hr | legal | platform`), `description?`, base fields.
- **Required.** `key`, `scope`.
- **Ownership.** Platform-owned (global), not tenant-owned.
- **Example.** `key: finance.invoice.approve`, `scope: finance`.

### 3.11 Policy (Identity input for ABAC)

- **Purpose.** Versioned business/AI/operational rules that Governance evaluates against identity attributes. Identity holds them tenant-scoped and versioned.
- **Table.** `policies` (`tenantColumns`, `status` default `draft`, versioned via `version`).
- **Note.** Included because ABAC (see §6) reads policies against identity attributes; Identity owns the tenant scoping and versioning, Governance owns evaluation.

---

## 4. Identity Hierarchy

The complete container/actor hierarchy. Each layer exists for a distinct, non-overlapping reason. Layers marked *(present)* exist as tables today; *(specified)* are defined by this document as refinements of existing structures — **no new modules**.

```
Platform (global root)
└── Tenant  = Company            (present: companies)          — billing + isolation boundary
    └── Organization             (present: organizations)      — division / subsidiary / country entity
        └── Department           (present: departments)        — functional unit (Sales, Finance…)
            └── Team              (specified)                   — squad inside a department
                └── Role          (present: roles)             — authority bundle, per tenant
                    └── Actor, one of:
                        ├── Human          (present: users + memberships)
                        ├── AI Agent       (present: agents)
                        ├── System Account (specified: actorType=system)
                        └── Service Account(specified: actorType=service)

Cross-cutting scopes (not levels of the tree):
- Workspace   (specified)  — a working context inside a company (a project space)
- Environment (specified)  — simulation / dry-run / live (mirrors providerStatusEnum posture)
- Tenant      (present: companies.id via tenantId) — the isolation key itself
```

### Why every layer exists

- **Platform.** The one global root above all tenants. Holds global identities (`users`, `permissions`). Enables one person to belong to many companies without duplication.
- **Tenant / Company.** The hard isolation and billing boundary. `tenantId` on every tenant-owned row makes cross-tenant leakage structurally impossible. Non-negotiable.
- **Organization.** Optional. Exists so holdings, subsidiaries, brands, and country entities can group departments without forcing every company to be flat. A single-company customer simply omits it.
- **Department.** The unit where work actually happens and where goals/policies attach. The functional spine of the digital company.
- **Team.** Optional. Exists so a large department can be subdivided without inventing a second department, keeping the ownership spine continuous.
- **Role.** Exists to decouple *authority* from *position*. A person's department says where they sit; their role says what they may be granted. Two orthogonal axes.
- **Human / Agent / System / Service.** Four actor types exist because accountability differs: a human is legally responsible, an agent is operationally responsible under a human owner, a system account is the platform itself, a service account is an external caller. Merging them would destroy audit clarity.
- **Workspace.** A context boundary *within* a company (e.g. a project, a client engagement) so access can be scoped narrower than the whole company without a new tenant.
- **Environment.** The execution posture (simulation / dry-run / live). Identity records which environment an actor is operating in so a live action is never mistaken for a simulated one. Mirrors the existing `providerStatusEnum`.

---

## 5. Identity Lifecycle

Every identity moves through a deterministic state machine backed by `lifecycleStatus` (`active | archived | deleted`), `deletedAt`, and `version`. **No hard delete of any identity that owns live records.**

| Operation | Definition | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Create** | Bring identity into existence | Passes duplicate-prevention (§5 below); parent exists and is active | Row inserted, `lifecycleStatus=active`, `version=1`, `createdBy` set | `IdentityCreated` |
| **Activate** | Move a provisioned/suspended identity to operational | Identity exists, not archived/deleted | `lifecycleStatus=active` | `IdentityActivated` |
| **Suspend** | Temporarily revoke ability to act without losing history | Identity active | Access blocked at authorization time; row retained | `IdentitySuspended` |
| **Archive** | Retire without deletion | No active children (or children archived first) | `lifecycleStatus=archived` | `IdentityArchived` |
| **Delete** (soft) | Mark removed, preserve for audit | Owns no live records, or records re-owned first | `lifecycleStatus=deleted`, `deletedAt` set | `IdentityDeleted` |
| **Restore** | Reverse archive/soft-delete | Was archived/deleted; parent still active | `lifecycleStatus=active`, `deletedAt=null` | `IdentityRestored` |
| **Version** | Record a mutation | Any update | `version` incremented, prior state captured in audit | `IdentityUpdated` |
| **Audit** | Read the immutable trail | — | No state change; returns append-only history | — |
| **Ownership transfer** | Move owned records/agents to a new owner | New owner active and in same tenant | Ownership edges re-pointed; original identity may then archive | `IdentityOwnershipTransferred` |
| **Merge** | Collapse two identities into one | Same tenant (or explicit cross-tenant M&A flow) | Losing identity's edges re-pointed to survivor; loser archived | `IdentityMerged` |
| **Split** | Divide one identity into two | — | New identity created; subset of edges moved | `IdentitySplit` |

### Duplicate prevention

Enforced structurally, not by convention:

- **User uniqueness:** `users.email` unique index — one person, one global identity.
- **Membership uniqueness:** `(tenantId, userId)` unique index — a user cannot be a member of the same company twice.
- **Company uniqueness:** `companies.slug` unique index.
- **Permission uniqueness:** `permissions.key` unique index.
- **Organization / Department / Team:** unique `(tenantId, slug)` within their parent scope.
- **Agent:** unique `(tenantId, name)` within a company (name is the operational handle).

On a create that would violate uniqueness, the operation is rejected and no partial state is written.

### Hard delete

Reserved for GDPR/legal erasure only, executed by an explicit, approval-gated Governance flow — never by ordinary Identity operations. Soft delete is the default terminal state.

---

## 6. Permissions

Identity **stores the inputs**; the Governance/Policy layer **computes decisions**. This section specifies the inputs and the resolution rules Identity must support. Identity never returns "allowed/denied" — it returns the graph the decision is computed from.

### RBAC — Role-Based Access Control

- Anchored on `roles` (`roleTypeEnum`: `owner | director | operator | auditor | member`) and `memberships.roleId`.
- A member's base authority = the permission set mapped to their role's `type`, scoped to their company via `tenantId`.
- Role types are ordered by authority: `owner > director > operator > member`, with `auditor` a read-only lateral role.

### ABAC — Attribute-Based Access Control

- Evaluated on identity attributes: department, organization, environment (simulation/live), lifecycle status, workspace.
- Rules live in `policies` (versioned, tenant-scoped). Example attribute rule: "finance.invoice.approve allowed only if `department=Finance` AND `environment=live` AND `roleType>=director`."
- Identity supplies the attributes; Policy holds the rule; Governance evaluates.

### Inheritance

- Permissions flow **down the ownership spine**: company → organization → department → team → member, unless explicitly restricted at a lower node.
- A director of an organization inherits visibility into its departments; a department member does not inherit upward.

### Delegation

- An actor may grant a subset of *their own* current permissions to another actor for a bounded scope. Delegation can never exceed the delegator's set (no privilege amplification). Recorded as an identity-linked grant with a delegator reference.

### Temporary permissions

- A grant with an expiry attribute. After expiry, Identity marks it inactive and the permission silently drops from resolution. Used for contractors, coverage during leave, time-boxed projects.

### Emergency ("break-glass") permissions

- A pre-declared elevated grant activated under a named emergency. Always: (a) time-boxed, (b) fully audited with heightened event severity, (c) auto-revoked at window end. Never silent — activation emits a high-priority event.

### Approval-based permissions

- Some grants require an approval chain before becoming active (ties to the existing `approvalStateEnum`: `not-required | pending | approved | rejected`). The permission is inert while `pending` and activates only on `approved`.

### Department permissions

- Scoped to a `departments` node. Grant applies to all actors whose membership/assignment resolves into that department, respecting team-level restrictions.

### Cross-company permissions

- For holdings/M&A: an actor in company A may be granted a narrow, explicit, audited grant in company B. Never implicit. Requires a cross-tenant grant record naming both tenants and is always separately auditable. Default posture: **denied**.

### Agent permissions

- Agents receive permissions like any actor, but always **bounded by their human owner's authority** and by the department they are assigned to. An agent can never hold a permission its owning human could not. Live-action permissions for agents additionally require the `environment=live` attribute; otherwise the agent resolves in simulation.

---

## 7. Events

Every identity mutation emits exactly one domain event. Events are the module's public reaction surface — other modules subscribe; they never read Identity's tables directly. Payloads carry `actorRef` (`{actorType, actorId}`), `tenantId`, `identityId`, `version`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `IdentityCreated` | Any identity created | identityType, parentId, initial attributes | Memory, Knowledge, Governance, Dashboard | New actor/container becomes addressable platform-wide |
| `IdentityUpdated` | Field change / re-version | changedFields, oldVersion→newVersion | Audit, Dashboard | Attribute drift propagates to dependent views |
| `IdentityActivated` | Provision/suspend → active | previousStatus | Governance, Execution | Actor may now act |
| `IdentitySuspended` | Access revoked temporarily | reason | Governance, Execution, Notifications | All actions by/for this identity blocked at auth time |
| `IdentityArchived` | Retired | childrenState | Dashboard, Reporting | Removed from active org views, history kept |
| `IdentityDeleted` | Soft delete | deletedAt, recordsReowned | Audit, Compliance | Terminal state; references frozen |
| `IdentityRestored` | Archive/delete reversed | restoredFromStatus | Governance, Dashboard | Identity re-enters active graph |
| `IdentityOwnershipTransferred` | Owner changed | fromOwnerRef, toOwnerRef, movedRecordCount | Every module owning records | Accountability re-points; dashboards re-attribute |
| `IdentityMerged` | Two identities collapsed | survivorId, losingId, movedEdges | All modules | Downstream references must resolve to survivor |
| `IdentitySplit` | One identity divided | sourceId, newId, movedEdges | All modules | New container/actor appears with subset of edges |
| `MembershipGranted` | User added to company | userId, roleId | Governance, Notifications | User gains company access |
| `MembershipRevoked` | User removed from company | userId, reason | Governance, Execution | User loses company access immediately |
| `RoleAssigned` | Membership role set/changed | fromRoleId, toRoleId | Governance | Authority set recomputed |
| `PermissionGranted` | Grant added (any type) | permissionKey, grantType, expiry?, delegatorRef? | Governance, Audit | New capability enters resolution |
| `PermissionRevoked` | Grant removed/expired | permissionKey, reason | Governance, Audit | Capability drops from resolution |
| `EmergencyAccessActivated` | Break-glass invoked | window, invokerRef | Security, Audit, Notifications (high severity) | Elevated access live and watched |
| `AgentOwnershipReassigned` | Agent's owning human changed | fromOwnerRef, toOwnerRef | Execution, Governance | Agent's permission ceiling recomputed |

Ordering and idempotency: events carry `version` so consumers detect and discard stale/duplicate deliveries. Emission is transactional with the mutation — the event is never emitted unless the state change committed.

---

## 8. APIs

Public operations, described by contract only (no implementation). Every operation is tenant-scoped except those on global identities (users, permission catalog), enforces lifecycle preconditions from §5, and emits the §7 events. Every mutation requires a resolved `actorRef` (no anonymous writes).

**Actor & container creation / mutation**
- `createCompany(name, slug, plan)` → Company
- `createOrganization(tenantId, name, slug)` → Organization
- `createDepartment(tenantId, name, slug, organizationId?)` → Department
- `createTeam(tenantId, departmentId, name, slug)` → Team
- `createRole(tenantId, name, type)` → Role
- `registerUser(email, authId?, name?)` → User *(global)*
- `createAgent(tenantId, name, departmentId?, role?)` → Agent
- `createSystemAccount(scope)` / `createServiceAccount(tenantId, name)` → Actor
- `updateIdentity(id, changedFields)` → Identity *(re-versions)*

**Membership & assignment**
- `grantMembership(tenantId, userId, roleId?)` → Membership
- `revokeMembership(membershipId, reason)` → void
- `assignRole(membershipId, roleId)` → Membership
- `assignAgentToDepartment(agentId, departmentId)` → Agent

**Lifecycle**
- `activate(id)` · `suspend(id, reason)` · `archive(id)` · `softDelete(id)` · `restore(id)`
- `transferOwnership(id, toActorRef)` → Identity
- `mergeIdentities(survivorId, losingId)` → Identity
- `splitIdentity(sourceId, spec)` → Identity

**Permissions (input side only)**
- `grantPermission(actorRef, permissionKey, grantType, {expiry?, delegatorRef?, approvalRef?})`
- `revokePermission(grantId, reason)`
- `activateEmergencyAccess(actorRef, window, justification)`
- `resolveAuthorityGraph(actorRef)` → materialized role + grants + attributes *(input for Governance; does NOT return allow/deny)*

**Query / read**
- `whoIs(actorId)` → resolved identity + type
- `belongsTo(actorId, companyId)` → boolean edge check
- `getHierarchy(companyId)` → ownership tree
- `search(criteria)` → identities *(by name, email, role, department, status, type)*
- `filter(criteria)` → scoped list with tenant guard
- `listMemberships(userId | companyId)` → memberships

**Audit / integrity**
- `getAuditTrail(identityId)` → append-only history
- `getVersion(identityId, version)` → point-in-time snapshot
- `checkIntegrity(companyId)` → orphan/broken-edge report *(read-only)*
- `permissionCheckInputs(actorRef, permissionKey)` → the resolved inputs Governance needs *(Identity stops here; the decision is Governance's)*

---

## 9. Database Model

Conceptual model only. No SQL.

### Primary entities

`companies` (tenant root), `users` (global), `memberships` (user↔company), `roles`, `organizations`, `departments`, `agents`, `permissions` (global catalog), `policies`. Specified additions realized without new modules: `teams` (department-nested), actor-type discrimination for `createdBy`/`updatedBy`, workspace/environment scope attributes, and grant records for the permission input side.

### Relationships

- `companies (1) —— (N) organizations | departments | agents | memberships | roles | policies` via `tenantId`.
- `organizations (1) —— (N) departments`.
- `departments (1) —— (N) agents` and `(N) teams`.
- `users (1) —— (N) memberships (N) —— (1) companies` (many-to-many resolved by memberships).
- `roles (1) —— (N) memberships`.
- `permissions` global, referenced by grant records, not by `tenantId`.

### Indexes

- Unique: `users.email`, `companies.slug`, `permissions.key`, `memberships(tenantId, userId)`.
- Specified unique: `organizations(tenantId, slug)`, `departments(tenantId, slug)`, `teams(departmentId, slug)`, `agents(tenantId, name)`.
- Performance: every tenant-owned table indexed on `tenantId`; `memberships.userId`; `agents.departmentId`; `lifecycleStatus` partial index for active-only scans.

### Constraints

- `tenantId` NOT NULL and FK → `companies.id` on every tenant-owned table (structural isolation).
- Parent FKs (`organizationId`, `departmentId`, `roleId`, `userId`) enforced; no dangling child.
- Lifecycle: `deletedAt` non-null iff `lifecycleStatus='deleted'`.

### Versioning

- Every row carries `version` (from `_base.ts`), incremented on each mutation. Point-in-time reads resolve through the audit history keyed by `(id, version)`.

### Soft delete

- `lifecycleStatus` + `deletedAt` are the universal soft-delete contract. Default reads filter to `active`. No identity row is physically removed except under legal erasure (§5).

### Audit strategy

- Append-only history per identity: every mutation writes an immutable record `(identityId, version, actorRef, changedFields, occurredAt)`. History is never updated or deleted. This is the source for `getAuditTrail` and for every compliance/integrity KPI in §14.

---

## 10. Dashboard Representation

Where Identity surfaces across the product. Identity provides data; each surface renders a view.

| Surface | What Identity shows |
|---|---|
| **Executive Dashboard** | Company-level identity health: total actors, active vs suspended, hierarchy integrity score, risk score (§14). One tile, drill-down to detail. |
| **Director Dashboard** | Department/organization view: members and agents in the director's scope, roles, pending permission approvals, temporary/emergency grants active. |
| **Department Dashboard** | Roster of that department's humans and agents, their roles, assignment status, inactive-identity flags. |
| **Admin Dashboard** | Full CRUD surface: create/suspend/archive identities, manage memberships and roles, review permission grants, run integrity checks, view audit trail. The only surface with lifecycle-mutation authority. |
| **Mobile** | Read-first: who's who, my memberships, approve/deny pending grants, receive emergency-access alerts. No destructive operations. |
| **Notifications** | Membership granted/revoked, role changed, emergency access activated (high priority), ownership transferred, approval requested. |
| **Audit** | Timeline per identity: every version, actor, change. Immutable, exportable for compliance. |
| **Search** | Global identity search across users, agents, departments — by name, email, role, status. Tenant-guarded. |

Identity never *owns* a dashboard page's business logic; it supplies `getHierarchy`, `search`, `getAuditTrail`, and the health/risk KPIs the surfaces render.

---

## 11. Enterprise Scenarios

Behavior of Identity in 25+ real enterprise situations. In every case Identity mutates only ownership/hierarchy/lifecycle edges and emits events; other modules react.

1. **Company acquisition (M&A).** Acquirer and target are two companies. `mergeIdentities` at company level (explicit cross-tenant flow): target's departments/agents/memberships re-parent under acquirer or a new organization; target company archived. `IdentityMerged` emitted; audit retains both lineages.
2. **Department merge.** Two departments combine. Agents and members re-assigned to survivor department via `transferOwnership`/reassignment; losing department archived. Goals/policies attached to the loser are re-pointed by their owning modules reacting to `IdentityMerged`.
3. **Department split.** Sales splits into Inbound and Outbound. `splitIdentity`: new department created, subset of agents/members moved; both active. `IdentitySplit` emitted.
4. **Employee resignation.** `revokeMembership` → user loses company access immediately (`MembershipRevoked`). Global user identity retained (may still belong to other companies). Their owned agents require `transferOwnership` before archive (see orphan-agent, §12).
5. **Employee transfer between departments.** Membership retained; department assignment changed. Permissions recomputed via inheritance from new department.
6. **AI Agent replacement.** New agent created; `transferOwnership` moves the old agent's work/records to the new agent; old agent archived. Permission ceiling recomputed from the new agent's owner/department.
7. **AI Agent owner leaves.** `AgentOwnershipReassigned` to a new human owner; agent's permission ceiling recomputed against the new owner. Never left owner-less (§12).
8. **Subsidiary creation.** New `organization` under the company; departments created beneath it. Ownership spine extends without a new tenant.
9. **Franchise.** Each franchisee is a separate company (tenant) with its own hierarchy; a franchisor may hold explicit, audited cross-company grants into franchisee companies. Default cross-tenant posture denied.
10. **Multi-country organization.** One company, several `organizations` (one per country), each with country-specific departments and environment attributes for local compliance.
11. **Holding structure.** Holding is a company; each held business an `organization` (or its own tenant for hard isolation). Cross-entity visibility only via explicit cross-company grants.
12. **Temporary contractor.** User registered globally, granted membership with a role and a **temporary permission** carrying an expiry. Access auto-drops at expiry; membership can then be revoked.
13. **Coverage during leave.** Delegation: the absent director delegates a subset of permissions to a deputy for a bounded window. Never exceeds delegator's set; auto-expires.
14. **New hire onboarding.** `registerUser` (or reuse existing global user) → `grantMembership` with role → department assignment. `IdentityCreated`/`MembershipGranted` drive downstream provisioning.
15. **Bulk reorg.** Multiple departments archived/merged/created in one governed batch; each mutation individually versioned and audited; no partial-state left if any step fails.
16. **Role redefinition.** A role's authority mapping changes. Roles are versioned; every membership using it recomputes authority; `RoleAssigned`/`IdentityUpdated` propagate.
17. **Company rename / rebrand.** `updateIdentity` on company `name`; `slug` uniqueness re-checked; version incremented; downstream views update from `IdentityUpdated`.
18. **Spin-off.** A department + its agents split out into a brand-new company (tenant). `splitIdentity` at department scope followed by tenant creation and re-parenting; audit lineage preserved.
19. **Vendor / partner API access.** A **service account** created in the company with a narrow role; acts on the company's behalf; every action attributed to the service actor, never to a human.
20. **Platform automation.** Migrations, schedulers, and event processors act as the **system account**; their mutations are attributed and audited like any actor.
21. **Emergency access during incident.** `activateEmergencyAccess` grants time-boxed elevated rights; `EmergencyAccessActivated` fires at high severity; auto-revoked at window end.
22. **Auditor onboarding.** User granted a membership with role type `auditor` — read-only lateral authority across scoped departments; cannot mutate.
23. **Suspended company (billing/compliance).** Company `suspend`ed: all its actors blocked at auth time; data retained; restorable via `restore` once resolved.
24. **User in multiple companies.** One global user, many memberships, different roles per company. Switching company context changes the resolved authority graph without touching the user identity.
25. **Digital Twin bootstrap.** A new company's full hierarchy (org → departments → agents → roles) created as one governed setup, forming the org-structure layer of its Digital Twin.
26. **Ownership transfer of a founder's estate.** Founder leaves; `transferOwnership` moves all owned agents/records to a successor before the founder's membership is archived.
27. **Cross-company shared service.** A shared Finance service agent operates for several companies in a holding via explicit per-company cross grants, each separately audited.

---

## 12. Failure Scenarios

At least 20 failure modes and the system's deterministic reaction. The governing rule: **Identity fails closed** — on ambiguity it denies and preserves state, never guesses.

1. **Duplicate identity attempt.** Reject at the unique constraint (email/slug/key/`(tenantId,userId)`/`(tenantId,name)`). No partial write.
2. **Two people, same email.** Impossible by `users.email` unique index. Second registration rejected; existing user reused via membership.
3. **Permission conflict (grant vs restriction).** Most-specific restriction wins; explicit deny beats inherited allow. Conflict logged for review; access denied while ambiguous.
4. **Deleted owner with live agents (orphan agent).** Soft-delete of an owner is blocked until its agents are re-owned via `transferOwnership`. If detected post-hoc, agent is auto-suspended and flagged, never left acting under a dead owner.
5. **Orphan agent (no owner / no department).** `checkIntegrity` flags it; agent auto-suspended; remediation prompt raised on Admin Dashboard.
6. **Missing department for an agent.** Agent retained but flagged "unassigned"; excluded from department-scoped permission inheritance until reassigned.
7. **Broken hierarchy (parent archived, child active).** Restore/re-parent required. Child auto-flagged; reads still resolve, but new grants against the broken branch are refused.
8. **Membership without a role.** Allowed transiently (`roleId` optional). Member resolves with zero authority until a role is assigned — fails closed, not open.
9. **Cross-tenant leakage attempt.** Any query/mutation whose `tenantId` guard doesn't match the actor's tenant is refused. Structural `tenantId` FK makes silent leakage impossible.
10. **Circular hierarchy (A parent of B parent of A).** Rejected at write time by a cycle check on the ownership spine.
11. **Deleting a role still in use.** Blocked; role may only be archived. Memberships must be reassigned first.
12. **Deleting a company that owns live records.** Blocked; requires archive of children or explicit legal-erasure flow.
13. **Concurrent update (version conflict).** Optimistic concurrency on `version`: the stale writer is rejected and must re-read. No lost update.
14. **Expired temporary permission still cached downstream.** `PermissionRevoked` on expiry forces downstream re-resolution; Identity's resolution never returns the expired grant.
15. **Delegation exceeding delegator's authority.** Rejected — a delegate can never receive more than the delegator currently holds. Checked at grant time.
16. **Privilege escalation via self-grant.** An actor cannot grant themselves permissions beyond their role ceiling; such a request is refused and logged as a security event.
17. **Emergency access never revoked.** Auto-revocation at window end is mandatory; a watchdog also force-revokes overdue windows and raises a high-severity alert.
18. **Merge of identities in different tenants without M&A flow.** Refused. Cross-tenant merge only via the explicit acquisition flow with approval.
19. **Suspended actor still emitting actions.** Authorization resolves `suspended` → deny at action time even if a stale session exists; the action is blocked and logged.
20. **Audit trail write failure.** Because event emission is transactional with the mutation, a failed audit write rolls back the mutation. No un-audited change can commit.
21. **Restore of a child whose parent is deleted.** Refused until the parent is restored or the child is re-parented.
22. **Service account acting after integration removed.** Its membership/grant is revoked with the integration; subsequent calls resolve to a non-existent/inactive actor → denied.
23. **Ownership transfer to an inactive/other-tenant owner.** Refused; target must be active and within the same tenant (or the explicit cross-company flow).
24. **Agent granted a live-action permission its owner lacks.** Refused — agent permission ceiling is bounded by the owning human; over-ceiling grants are rejected.

---

## 13. Security

Identity is the platform's primary attack surface for anything involving "who." Its security posture is defensive and audit-first.

- **Identity spoofing.** Authentication is delegated to the auth provider via `users.authId`; Identity never trusts a claimed identity without a verified `authId`. Every actor reference is `(actorType, actorId)` resolved server-side — clients cannot assert an actor they are not.
- **Privilege escalation.** Enforced ceilings: role type bounds a human; a human bounds their agents; delegation ≤ delegator; self-grant above ceiling refused. Emergency access is the only elevation path and it is time-boxed and loudly audited.
- **Audit integrity.** Append-only, immutable history; audit write is transactional with the mutation (§9). No mutation commits un-audited; no history row is ever updated or deleted. Tamper-evidence via monotonic `version` per identity.
- **Access control.** Structural tenant isolation (`tenantId` FK on every tenant-owned row). Fail-closed resolution: missing role = zero authority; ambiguous permission = deny. Identity supplies inputs; Governance decides — separation prevents a single bug from both defining and granting access.
- **Separation of duties.** The actor who *requests* a sensitive grant cannot be the one who *approves* it (approval-based permissions, `approvalStateEnum`). Auditor role is read-only and cannot mutate what it audits.
- **Compliance.** Soft-delete + immutable audit satisfy retention requirements; the explicit legal-erasure flow satisfies GDPR right-to-erasure without breaking referential audit for everyone else. Every access decision's inputs are reconstructable point-in-time via versioned reads.
- **Least privilege by default.** New memberships start with the narrowest role; permissions are granted, never assumed. Cross-tenant default is deny.

---

## 14. KPIs

Identity's health measured deterministically from its own audit and structure.

| KPI | Definition | Source |
|---|---|---|
| **Identity health** | % of identities in a valid state (active, correctly parented, no integrity flags) | `checkIntegrity`, lifecycle |
| **Permission accuracy** | % of grants that resolve consistently with role ceilings and policies (no conflicts) | grant records + policy eval |
| **Ownership consistency** | % of owned records/agents whose owner is active and in-tenant (0 orphans = 100%) | ownership edges |
| **Audit completeness** | % of mutations with a matching immutable audit record (target: 100% by construction) | audit history vs event log |
| **Hierarchy integrity** | % of identities with an unbroken parent chain to the tenant root (no orphan/cycle/broken branch) | hierarchy scan |
| **Inactive identities** | Count/% of memberships or agents with no activity over a threshold window | activity vs lifecycle |
| **Risk score** | Composite: emergency grants active, over-ceiling attempts, stale suspended actors, integrity flags, expired-but-referenced grants | weighted rollup of the above |

These feed the Executive/Admin dashboards (§10) and are computed from Identity's own tables and audit trail — no external inference.

---

## 15. Future Compatibility

How Identity absorbs future demands **without redesign**, because the core abstractions were chosen to be extension points.

- **Multi-company.** Already native: global `users` + per-company `memberships` + `tenantId` isolation. Adding companies is data, not schema change.
- **Marketplace.** Agents and service accounts are already first-class actors; a marketplace listing references an identity — no new identity primitive needed.
- **Plugins.** A plugin acts as a **service account** with a scoped role; the existing actor abstraction covers it.
- **External APIs.** External callers map to service accounts; every call attributed and permission-checked through the existing input/decision split.
- **Federated Identity.** `users.authId` already indirects to an external auth authority. Federation adds providers behind `authId`; Identity's model is unchanged.
- **Enterprise SSO.** SSO resolves to a verified `authId` → existing user (or provisions one). Identity consumes the assertion; it does not re-model users.
- **OIDC.** OIDC subject maps to `authId`; claims map to identity attributes consumed by ABAC. No structural change.
- **SAML.** SAML assertion resolves to `authId` + attributes, same as OIDC. The provider differs; the Identity contract does not.
- **SCIM.** SCIM provisioning maps directly onto the existing lifecycle API (`registerUser`, `grantMembership`, `suspend`, `softDelete`) and the standard events. SCIM is a client of Identity's existing operations, not a new subsystem.

The invariant enabling all of the above: **authentication is external (behind `authId`); identity attributes are extensible; the actor abstraction is polymorphic; the input/decision split isolates authorization change.** New identity sources plug into these seams without touching the ownership or authority spines.

---

## 16. What this module will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Identity to do any of these, the answer is: it belongs to another module.

- **Never authenticate.** No password, OTP, session, or credential verification. That is the auth provider's job behind `authId`.
- **Never decide "allowed / denied."** Identity supplies inputs; Governance/Policy decides. Identity returns graphs, never verdicts.
- **Never store business data.** No goals, workflows, tickets, invoices, memories, or knowledge. Those modules reference identities; Identity references none of them.
- **Never model agent capability, memory, reasoning, or runtime.** An agent here is a name + role label + ownership edge. Nothing more.
- **Never run analytics or scoring on people/agents.** Org-health, performance, evaluation belong to HR/Governance/Intelligence reading Identity's structure.
- **Never allow cross-tenant access implicitly.** Cross-company reach is always an explicit, audited, approval-gated grant. Default is deny.
- **Never hard-delete by default.** Soft delete + immutable audit is the terminal state; physical erasure only via the explicit legal-erasure flow.
- **Never let an actor exceed its ceiling.** No self-escalation, no delegation beyond the delegator, no agent above its owner.
- **Never mutate without an actor and an audit record.** Anonymous or un-audited change is structurally impossible.
- **Never redefine other modules' ownership.** Identity draws the boundary lines; each module owns what sits inside its own lines.

---

*End of Identity Specification v1.0. This document specifies the existing Identity module in full and defines its permanent boundaries. No features added. No other module modified.*
