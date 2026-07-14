/*
 * Knowledge fact registry — canonical fact identity and active-node selection.
 *
 * This is NOT a second Knowledge content store. It carries only fact identity,
 * scope, selection lineage, and governance-selection metadata. Knowledge content
 * remains in `knowledge_nodes`.
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { actorTypeEnum, knowledgeScopeEnum } from "./_enums";
import { decisionRecords, governanceSessions } from "./governance";
import { knowledgeNodes } from "./knowledge";

export const knowledgeFacts = pgTable(
  "knowledge_facts",
  {
    ...tenantColumns,
    factKey: text("fact_key").notNull(),
    domainKey: text("domain_key").notNull(),
    knowledgeScope: knowledgeScopeEnum("knowledge_scope").notNull(),
    activeKnowledgeNodeId: uuid("active_knowledge_node_id").references(
      () => knowledgeNodes.id,
    ),
    previousKnowledgeNodeId: uuid("previous_knowledge_node_id").references(
      () => knowledgeNodes.id,
    ),
    governanceSessionId: uuid("governance_session_id").references(
      () => governanceSessions.id,
    ),
    ratificationDecisionId: uuid("ratification_decision_id").references(
      () => decisionRecords.id,
    ),
    selectedAt: timestamp("selected_at", { withTimezone: true }),
    selectedByActorType: actorTypeEnum("selected_by_actor_type"),
    selectedByActorId: uuid("selected_by_actor_id"),
    factVersion: integer("fact_version").notNull().default(1),
    metadata: jsonb("metadata"),
  },
  (t) => [
    uniqueIndex("knowledge_facts_tenant_domain_scope_fact_key_uidx").on(
      t.tenantId,
      t.domainKey,
      t.knowledgeScope,
      t.factKey,
    ),
    index("knowledge_facts_active_knowledge_node_id_idx").on(
      t.activeKnowledgeNodeId,
    ),
    index("knowledge_facts_tenant_domain_scope_idx").on(
      t.tenantId,
      t.domainKey,
      t.knowledgeScope,
    ),
  ],
);
