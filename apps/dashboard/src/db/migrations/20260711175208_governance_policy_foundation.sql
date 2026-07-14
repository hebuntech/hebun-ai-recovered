CREATE TABLE "decision_records" (
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
	"session_id" uuid,
	"decision_type" "governance_decision_type" NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" uuid,
	"actor_type" "actor_type" NOT NULL,
	"actor_id" uuid NOT NULL,
	"authority_source_actor_type" "actor_type",
	"authority_source_actor_id" uuid,
	"bootstrap" boolean DEFAULT false NOT NULL,
	"outcome" text NOT NULL,
	"justification" text NOT NULL,
	"evidence" jsonb,
	"gate_results" jsonb,
	"chain_results" jsonb,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decision_version" integer DEFAULT 1 NOT NULL,
	"supersedes_decision_id" uuid,
	"correlation_id" text,
	"causation_id" text
);
--> statement-breakpoint
CREATE TABLE "governance_sessions" (
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
	"governance_domain" "governance_domain" NOT NULL,
	"decision_type" "governance_decision_type" NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" uuid,
	"proposer_actor_type" "actor_type" NOT NULL,
	"proposer_actor_id" uuid NOT NULL,
	"risk_class" "risk_class" DEFAULT 'medium' NOT NULL,
	"voting_mode" "voting_mode",
	"authority_source_actor_type" "actor_type",
	"authority_source_actor_id" uuid,
	"justification" text,
	"evidence" jsonb,
	"gates" jsonb,
	"approval_chain" jsonb,
	"governance_lifecycle_status" "governance_lifecycle_status" DEFAULT 'created' NOT NULL,
	"governance_health" "governance_health" DEFAULT 'unknown' NOT NULL,
	"correlation_id" text,
	"causation_id" text,
	"governance_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "policy_lifecycle_status" "policy_lifecycle_status";--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "policy_health" "policy_health";--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "policy_domain" "policy_domain";--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "rule_type" "rule_type";--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "policy_scope" "policy_scope";--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "policy_authority" "policy_authority";--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "statement" text;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "conditions" jsonb;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "constraints" jsonb;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "enforcement_contract" jsonb;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "references" jsonb;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "owner_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "owner_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "steward_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "steward_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "effective_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "review_cadence" text;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "rationale" text;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "supersedes_policy_id" uuid;--> statement-breakpoint
ALTER TABLE "decision_records" ADD CONSTRAINT "decision_records_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_records" ADD CONSTRAINT "decision_records_session_id_governance_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."governance_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_records" ADD CONSTRAINT "decision_records_supersedes_decision_id_decision_records_id_fk" FOREIGN KEY ("supersedes_decision_id") REFERENCES "public"."decision_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "governance_sessions" ADD CONSTRAINT "governance_sessions_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "decision_records_tenant_idx" ON "decision_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "decision_records_session_idx" ON "decision_records" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "decision_records_subject_idx" ON "decision_records" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "decision_records_correlation_idx" ON "decision_records" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "governance_sessions_tenant_idx" ON "governance_sessions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "governance_sessions_subject_idx" ON "governance_sessions" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "governance_sessions_domain_idx" ON "governance_sessions" USING btree ("governance_domain");--> statement-breakpoint
CREATE INDEX "governance_sessions_correlation_idx" ON "governance_sessions" USING btree ("correlation_id");--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_supersedes_policy_id_policies_id_fk" FOREIGN KEY ("supersedes_policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;