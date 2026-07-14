CREATE TABLE "working_memories" (
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
	"agent_id" uuid,
	"session_key" text NOT NULL,
	"context_type" text,
	"context_id" uuid,
	"summary" text,
	"memory_state" jsonb,
	"active_context" jsonb,
	"constraints" jsonb,
	"working_memory_lifecycle_status" "working_memory_lifecycle_status",
	"working_memory_health" "working_memory_health",
	"expires_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone,
	"compressed_at" timestamp with time zone,
	"disposed_at" timestamp with time zone,
	"working_memory_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "scope" "memory_scope";--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "namespace" text;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "collection" text;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "lineage" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "trust" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "quality" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "promotion_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "retention_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "aging_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "correction_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "supersession_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "storage_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "memory_lifecycle_status" "memory_lifecycle_status";--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "memory_health" "memory_health";--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "memory_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "supersedes_memory_id" uuid;--> statement-breakpoint
ALTER TABLE "working_memories" ADD CONSTRAINT "working_memories_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "working_memories" ADD CONSTRAINT "working_memories_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "working_memories_tenant_session_key_idx" ON "working_memories" USING btree ("tenant_id","session_key");--> statement-breakpoint
CREATE INDEX "working_memories_agent_id_idx" ON "working_memories" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "working_memories_expires_at_idx" ON "working_memories" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_supersedes_memory_id_memories_id_fk" FOREIGN KEY ("supersedes_memory_id") REFERENCES "public"."memories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memories_tenant_scope_namespace_idx" ON "memories" USING btree ("tenant_id","scope","namespace");--> statement-breakpoint
CREATE INDEX "memories_supersedes_memory_id_idx" ON "memories" USING btree ("supersedes_memory_id");