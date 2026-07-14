ALTER TABLE "organizations" ADD COLUMN "owner_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "owner_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "manager_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "manager_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "owner_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "owner_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "manager_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "manager_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "authority_rank" integer;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "system_role" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "policy_refs" jsonb;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "effective_from" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "effective_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "delegated_by_type" "actor_type";--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "delegated_by_id" uuid;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "authority_scope" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "human_owner_type" "actor_type";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "human_owner_id" uuid;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "manager_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "manager_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "agent_lifecycle_status" "agent_lifecycle_status";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "agent_health" "agent_health";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "agent_type" "agent_type";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "risk_level" "agent_risk_level";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "authority_ceiling" jsonb;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "config_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "retired_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "replaced_by_agent_id" uuid;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_replaced_by_agent_id_agents_id_fk" FOREIGN KEY ("replaced_by_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;