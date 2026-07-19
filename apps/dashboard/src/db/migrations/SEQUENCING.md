# Migration Sequencing (S0–S12)

Derived from `05 - Architecture/51 - Architecture-to-Code Gap Analysis v1.0.md` §9.
Each stage is a **small, reversible** migration with its own validation. **Never
one giant migration.** Additive-first; destructive shape changes use dual-write /
dual-read windows before removing the old shape. No stage removes a working
feature before its replacement is validated.

| Stage | Name | Prerequisites | Affected tables | Data migration | Rollback | Validation | Risk |
|---|---|---|---|---|---|---|---|
| **S0 ✅ DONE** | Baseline (incl. inert enums) | none | 27 tables + 72 enum types (13 legacy + 59 canonical inert) | none | delete baseline `.sql`+snapshot, reset journal | ✅ generated offline; tsc=0; build green; no DROP/destructive; app still on memory adapter | Low |
| **S1 (absorbed → S0)** | Inert enums | — | folded into S0 (no prior history to diff) | — | — | — | — |
| **S2** | Actor reference wiring | S1 | all (createdBy/updatedBy FK) | backfill NULLs allowed | drop FK constraints | FK valid; NULLs tolerated | Med |
| **S3 ✅ DONE** | Audit + event foundations | S0, S2 | +`audit_log`, +`event_log` (additive; `command_audit` **untouched**) | none (no dual-write yet) | drop 2 new tables + `audit_result` enum | ✅ generated offline; 2 CREATE TABLE + 8 idx + 2 FK→companies; 0 DROP; command_audit intact; tsc/build green | Med |
| **S4 ✅ DONE** | Governance + Policy (schema only) | S2, S3 | +`governance_sessions`,+`decision_records`; extend `policies` (+20 cols) | none — `status` kept (dual-column), `policy_lifecycle_status` added alongside | drop 2 tables + 20 policy cols | ✅ generated offline; 2 CREATE TABLE + 20 ADD COLUMN + 8 idx + 5 FK; 0 DROP; `status` intact; bootstrap-authority flag documented; tsc/build green | Med |
| **S5 ✅ DONE** | Identity reconciliation | S2, S4 | +35 cols across users/memberships/roles/organizations/departments/agents; 1 self-ref FK (agent succession) | none (all nullable/defaulted) | drop added cols | ✅ generated offline; 35 ADD COLUMN; 0 DROP; auth_id untouched; actor-resolution contract added; tsc/build green | Med |
| **S6 ✅ DONE** | Mission / Goal / Plan / Task foundation | S4, S5 | +`missions`,+`goals`,+`plans`; extend `tasks` (+lineage,+owner/assignment,+canonical anatomy) | none — `tasks.tenant_id` already existed via `tenantColumns`; new task cols are nullable | drop 3 tables + added task cols | ✅ generated offline; 3 CREATE TABLE + 29 ADD COLUMN + 18 idx + 18 FK + 1 partial unique index; 0 DROP; legacy `tasks.status` + `workflow_id` intact; no workflow/command/execution changes | Med |
| **S7 ✅ DONE** | Workflow / Command / Execution reconciliation | S6 | extend `workflows`(+lineage,+governed lifecycle/health,+graph/recovery metadata); extend `commands`(+full lineage,+idempotency,+correlation,+governed lifecycle/health,+execution metadata); extend `executions`(+command lineage,+governed lifecycle/health,+provider/effect metadata) | none — dual-shape window only; legacy runtime fields remain authoritative | drop added cols | ✅ generated offline; 83 ADD COLUMN/CONSTRAINT/INDEX statements; 0 DROP; `commands.status` + `commands.lifecycle` + `executions.status` + `workflows.name/description` intact; no dispatcher/queue/provider/runtime changes | High |
| **S8 ✅ DONE** | Agent cognitive binding foundation | S5, S6, S7 | extend `agents`(+cognitive/runtime binding metadata profiles, posture, preferences, limits, profile version) | none (additive) | drop added cols | ✅ generated offline; 22 ADD COLUMN + 1 INDEX; 0 DROP; existing lifecycle/health/owner/authority fields preserved; runtime adoption deferred | Med |
| **S9 ✅ DONE** | Working Memory / Long-term Memory foundation | S6, S7, S8 | +`working_memories`; extend `memories`(+canonical long-term metadata, lifecycle/health, self-supersession, versioning) | none (additive only) | drop new table + added cols | ✅ generated offline; 1 CREATE TABLE + 16 ADD COLUMN + 5 idx + 3 FK; 0 DROP; `memories.kind` preserved; knowledge graph untouched; retrieval/promotion runtime deferred | Med |
| **S10 ✅ DONE** | Knowledge reconciliation foundation | S9 | extend `knowledge_nodes`(+governed truth metadata, stewardship, ratification refs, review/freshness, version/supersession); extend `knowledge_edges`(+governed relationship metadata); +`knowledge_facts` identity/active-selection support table only | none (additive dual-shape) | drop added cols + support table | ✅ generated offline; 1 CREATE TABLE + additive node/edge cols + indexes/FKs; 0 DROP; `knowledge_nodes` remains canonical content store; `knowledge_edges` remains canonical relationship store; no duplicated content in `knowledge_facts`; runtime resolution deferred | High |
| **S11 ✅ DONE** | Reasoning / Learning foundation | S10 | extend `reasoning_traces`(+lineage,+lifecycle/health,+Knowledge/Memory/Policy refs,+evidence/conflict/uncertainty summaries,+verification/provider metadata); +`learning_sessions`; +`improvement_proposals` | none (additive only) | drop new tables + added reasoning cols | ✅ generated offline; 2 CREATE TABLE + additive reasoning cols + indexes/FKs; 0 DROP; `reasoning_traces` retained; raw hidden chain-of-thought explicitly excluded; Learning remains proposal-only; runtime activation deferred | High |
| **S12 ✅ DONE** | Additive authentication schema foundation | S5, S11 | +`auth_identities`, +`invitations`, +`user_session_contexts`, +`role_permissions`; nullable membership/company/audit extensions | none; legacy inventory and backfill deferred | keep schema inert or forward-fix after security writes | ✅ full 12-migration disposable PostgreSQL chain, second-run no-op, schema/constraint/FK checks, cleanup; authentication disabled | Med |

## Notes

- **S1 (this vicinity)**: the canonical enums are already defined in `_enums.ts`
  as **inert** (Tier 2). They are typecheck-stable and wired into **no table**
  yet. Wiring occurs from S4 onward.
- **Legacy projections**: `command_status`, `task_status`, `execution_status`
  are **kept** as coarse runtime projections; their governed supersets
  (`command_lifecycle_status`, `task_lifecycle_status`,
  `execution_lifecycle_status`) are separate. Do not drop the legacy ones.
- **High-risk stages**: S7 (Command/Execution) and S9 (Knowledge/Memory) require
  dual-shape / dual-model windows.
- **Circular Policy↔Governance**: bootstrap linearly — Identity → Policy schema →
  Governance engine → wire Policy ratification through Governance.
- **S12 activation boundary**: schema existence grants no authority. Legacy identity
  inventory/backfill, restrictive constraints, provider integration, session
  resolution, RLS, tenant isolation, and runtime activation remain separate gates.
