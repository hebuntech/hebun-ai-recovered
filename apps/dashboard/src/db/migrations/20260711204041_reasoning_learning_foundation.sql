CREATE TABLE "improvement_proposals" (
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
	"learning_session_id" uuid,
	"improvement_proposal_type" "improvement_proposal_type",
	"target_module" text,
	"target_type" text,
	"target_id" text,
	"proposal" jsonb,
	"expected_benefit" jsonb,
	"supporting_evidence" jsonb,
	"conflicting_evidence" jsonb,
	"risk_assessment" jsonb,
	"validation_plan" jsonb,
	"rollback_plan" jsonb,
	"provenance" jsonb,
	"proposal_version" integer DEFAULT 1 NOT NULL,
	"governance_session_id" uuid,
	"decision_record_id" uuid,
	"proposed_by_actor_type" "actor_type",
	"proposed_by_actor_id" uuid,
	"approved_at" timestamp with time zone,
	"applied_at" timestamp with time zone,
	"rolled_back_at" timestamp with time zone,
	"supersedes_proposal_id" uuid
);
--> statement-breakpoint
CREATE TABLE "learning_sessions" (
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
	"learning_type" "learning_type",
	"learning_lifecycle_status" "learning_lifecycle_status",
	"learning_health" "learning_health",
	"subject_type" text,
	"subject_id" text,
	"reasoning_trace_refs" jsonb,
	"execution_refs" jsonb,
	"memory_refs" jsonb,
	"knowledge_refs" jsonb,
	"human_feedback_refs" jsonb,
	"expected_outcome" jsonb,
	"actual_outcome" jsonb,
	"detected_patterns" jsonb,
	"root_cause_analysis" jsonb,
	"safety_checks" jsonb,
	"drift_signals" jsonb,
	"regression_signals" jsonb,
	"bias_signals" jsonb,
	"hallucination_reinforcement_signals" jsonb,
	"cost_metadata" jsonb,
	"correlation_id" text,
	"causation_id" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"learning_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "agent_id" uuid;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "working_memory_id" uuid;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "mission_id" uuid;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "mission_version" integer;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "goal_version" integer;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "plan_version" integer;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "task_id" uuid;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "workflow_id" uuid;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "execution_id" uuid;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "reasoning_lifecycle_status" "reasoning_lifecycle_status";--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "reasoning_health" "reasoning_health";--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "reasoning_strategy" "reasoning_strategy";--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "input_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "knowledge_refs" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "canonical_fact_refs" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "memory_refs" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "policy_refs" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "constraint_refs" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "supporting_evidence" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "conflicting_evidence" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "assumptions" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "hypotheses" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "alternatives" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "uncertainty" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "conclusion" text;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "recommendation" text;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "citation_map" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "verification_result" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "escalation_reason" text;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "human_review_required" text;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "provider_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "token_usage" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "cost_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "concluded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "disposed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "reasoning_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD COLUMN "supersedes_reasoning_trace_id" uuid;--> statement-breakpoint
ALTER TABLE "improvement_proposals" ADD CONSTRAINT "improvement_proposals_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "improvement_proposals" ADD CONSTRAINT "improvement_proposals_learning_session_id_learning_sessions_id_fk" FOREIGN KEY ("learning_session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "improvement_proposals" ADD CONSTRAINT "improvement_proposals_governance_session_id_governance_sessions_id_fk" FOREIGN KEY ("governance_session_id") REFERENCES "public"."governance_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "improvement_proposals" ADD CONSTRAINT "improvement_proposals_decision_record_id_decision_records_id_fk" FOREIGN KEY ("decision_record_id") REFERENCES "public"."decision_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "improvement_proposals" ADD CONSTRAINT "improvement_proposals_supersedes_proposal_id_improvement_proposals_id_fk" FOREIGN KEY ("supersedes_proposal_id") REFERENCES "public"."improvement_proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "improvement_proposals_learning_session_id_idx" ON "improvement_proposals" USING btree ("learning_session_id");--> statement-breakpoint
CREATE INDEX "improvement_proposals_target_idx" ON "improvement_proposals" USING btree ("target_module","target_type","target_id");--> statement-breakpoint
CREATE INDEX "improvement_proposals_supersedes_proposal_id_idx" ON "improvement_proposals" USING btree ("supersedes_proposal_id");--> statement-breakpoint
CREATE INDEX "learning_sessions_agent_id_idx" ON "learning_sessions" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "learning_sessions_subject_idx" ON "learning_sessions" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "learning_sessions_correlation_id_idx" ON "learning_sessions" USING btree ("correlation_id");--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_working_memory_id_working_memories_id_fk" FOREIGN KEY ("working_memory_id") REFERENCES "public"."working_memories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_execution_id_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."executions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_supersedes_reasoning_trace_id_reasoning_traces_id_fk" FOREIGN KEY ("supersedes_reasoning_trace_id") REFERENCES "public"."reasoning_traces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reasoning_traces_agent_id_idx" ON "reasoning_traces" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "reasoning_traces_working_memory_id_idx" ON "reasoning_traces" USING btree ("working_memory_id");--> statement-breakpoint
CREATE INDEX "reasoning_traces_supersedes_reasoning_trace_id_idx" ON "reasoning_traces" USING btree ("supersedes_reasoning_trace_id");