CREATE TABLE "knowledge_facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"created_by_type" "actor_type",
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_by_type" "actor_type",
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"deleted_by_type" "actor_type",
	"tenant_id" uuid NOT NULL,
	"fact_key" text NOT NULL,
	"domain_key" text NOT NULL,
	"knowledge_scope" "knowledge_scope" NOT NULL,
	"active_knowledge_node_id" uuid,
	"previous_knowledge_node_id" uuid,
	"governance_session_id" uuid,
	"ratification_decision_id" uuid,
	"selected_at" timestamp with time zone,
	"selected_by_actor_type" "actor_type",
	"selected_by_actor_id" uuid,
	"fact_version" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "relationship_category" text;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "edge_lifecycle_status" text;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "edge_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "domain_key" text;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "scope_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "governance_session_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "ratification_decision_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "effective_from" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "effective_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "supersedes_knowledge_edge_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "statement" text;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "knowledge_lifecycle_status" "knowledge_lifecycle_status";--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "knowledge_health" "knowledge_health";--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "knowledge_scope" "knowledge_scope";--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "knowledge_authority" "knowledge_authority";--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "domain_key" text;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "category_key" text;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "owner_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "owner_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "steward_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "steward_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "source_attribution" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "references" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "dependencies" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "memory_refs" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "governance_session_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "ratification_decision_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "ratified_by_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "ratified_by_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "ratified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "effective_from" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "effective_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "review_cadence" text;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "next_review_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "freshness_evaluated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "deprecated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "retired_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "knowledge_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD COLUMN "supersedes_knowledge_node_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_facts" ADD CONSTRAINT "knowledge_facts_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_facts" ADD CONSTRAINT "knowledge_facts_active_knowledge_node_id_knowledge_nodes_id_fk" FOREIGN KEY ("active_knowledge_node_id") REFERENCES "public"."knowledge_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_facts" ADD CONSTRAINT "knowledge_facts_previous_knowledge_node_id_knowledge_nodes_id_fk" FOREIGN KEY ("previous_knowledge_node_id") REFERENCES "public"."knowledge_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_facts" ADD CONSTRAINT "knowledge_facts_governance_session_id_governance_sessions_id_fk" FOREIGN KEY ("governance_session_id") REFERENCES "public"."governance_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_facts" ADD CONSTRAINT "knowledge_facts_ratification_decision_id_decision_records_id_fk" FOREIGN KEY ("ratification_decision_id") REFERENCES "public"."decision_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_facts_tenant_domain_scope_fact_key_uidx" ON "knowledge_facts" USING btree ("tenant_id","domain_key","knowledge_scope","fact_key");--> statement-breakpoint
CREATE INDEX "knowledge_facts_active_knowledge_node_id_idx" ON "knowledge_facts" USING btree ("active_knowledge_node_id");--> statement-breakpoint
CREATE INDEX "knowledge_facts_tenant_domain_scope_idx" ON "knowledge_facts" USING btree ("tenant_id","domain_key","knowledge_scope");--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD CONSTRAINT "knowledge_edges_governance_session_id_governance_sessions_id_fk" FOREIGN KEY ("governance_session_id") REFERENCES "public"."governance_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD CONSTRAINT "knowledge_edges_ratification_decision_id_decision_records_id_fk" FOREIGN KEY ("ratification_decision_id") REFERENCES "public"."decision_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD CONSTRAINT "knowledge_edges_supersedes_knowledge_edge_id_knowledge_edges_id_fk" FOREIGN KEY ("supersedes_knowledge_edge_id") REFERENCES "public"."knowledge_edges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_governance_session_id_governance_sessions_id_fk" FOREIGN KEY ("governance_session_id") REFERENCES "public"."governance_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_ratification_decision_id_decision_records_id_fk" FOREIGN KEY ("ratification_decision_id") REFERENCES "public"."decision_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_supersedes_knowledge_node_id_knowledge_nodes_id_fk" FOREIGN KEY ("supersedes_knowledge_node_id") REFERENCES "public"."knowledge_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "knowledge_edges_tenant_domain_key_idx" ON "knowledge_edges" USING btree ("tenant_id","domain_key");--> statement-breakpoint
CREATE INDEX "knowledge_edges_supersedes_knowledge_edge_id_idx" ON "knowledge_edges" USING btree ("supersedes_knowledge_edge_id");--> statement-breakpoint
CREATE INDEX "knowledge_nodes_tenant_domain_scope_idx" ON "knowledge_nodes" USING btree ("tenant_id","domain_key","knowledge_scope");--> statement-breakpoint
CREATE INDEX "knowledge_nodes_next_review_at_idx" ON "knowledge_nodes" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "knowledge_nodes_supersedes_knowledge_node_id_idx" ON "knowledge_nodes" USING btree ("supersedes_knowledge_node_id");