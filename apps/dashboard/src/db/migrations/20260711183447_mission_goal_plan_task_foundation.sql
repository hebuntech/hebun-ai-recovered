CREATE TABLE "missions" (
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
	"statement" text NOT NULL,
	"description" text,
	"principles" jsonb,
	"constraints" jsonb,
	"owner_actor_type" "actor_type",
	"owner_actor_id" uuid,
	"scope" text DEFAULT 'company' NOT NULL,
	"mission_lifecycle_status" "mission_lifecycle_status" DEFAULT 'draft' NOT NULL,
	"ratified_by_actor_type" "actor_type",
	"ratified_by_actor_id" uuid,
	"ratified_at" timestamp with time zone,
	"effective_from" timestamp with time zone,
	"effective_until" timestamp with time zone,
	"review_at" timestamp with time zone,
	"supersedes_mission_id" uuid,
	"mission_version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "missions_scope_company_chk" CHECK ("missions"."scope" = 'company')
);
--> statement-breakpoint
CREATE TABLE "goals" (
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
	"mission_id" uuid NOT NULL,
	"mission_version" integer DEFAULT 1 NOT NULL,
	"parent_goal_id" uuid,
	"owner_actor_type" "actor_type",
	"owner_actor_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"goal_scope" "goal_scope" NOT NULL,
	"goal_priority" "goal_priority" NOT NULL,
	"goal_lifecycle_status" "goal_lifecycle_status" DEFAULT 'draft' NOT NULL,
	"goal_health" "goal_health" DEFAULT 'unknown' NOT NULL,
	"success_criteria" jsonb,
	"success_metrics" jsonb,
	"target_values" jsonb,
	"current_progress" jsonb,
	"dependencies" jsonb,
	"risks" jsonb,
	"assumptions" jsonb,
	"confidence" integer,
	"review_cadence" text,
	"next_review_at" timestamp with time zone,
	"supersedes_goal_id" uuid,
	"goal_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
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
	"mission_id" uuid NOT NULL,
	"mission_version" integer DEFAULT 1 NOT NULL,
	"goal_id" uuid NOT NULL,
	"goal_version" integer DEFAULT 1 NOT NULL,
	"parent_plan_id" uuid,
	"owner_actor_type" "actor_type",
	"owner_actor_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"plan_scope" "plan_scope" NOT NULL,
	"plan_priority" "plan_priority" NOT NULL,
	"plan_lifecycle_status" "plan_lifecycle_status" DEFAULT 'draft' NOT NULL,
	"plan_health" "plan_health" DEFAULT 'unknown' NOT NULL,
	"strategy" jsonb,
	"success_criteria" jsonb,
	"milestones" jsonb,
	"work_packages" jsonb,
	"dependencies" jsonb,
	"assumptions" jsonb,
	"risks" jsonb,
	"required_capabilities" jsonb,
	"required_resources" jsonb,
	"budget" jsonb,
	"estimated_duration" text,
	"review_cadence" text,
	"next_review_at" timestamp with time zone,
	"approval_gates" jsonb,
	"execution_readiness" jsonb,
	"supersedes_plan_id" uuid,
	"plan_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "plan_version" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "work_package_ref" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "goal_version" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "mission_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "mission_version" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "parent_task_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "owner_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "owner_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "assigned_agent_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "assigned_human_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_lifecycle_status" "task_lifecycle_status";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_health" "task_health";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_execution_type" "task_execution_type";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_priority" "task_priority";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_risk_level" "task_risk_level";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "estimated_duration" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "dependencies" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "required_capabilities" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "required_resources" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "required_inputs" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "expected_outputs" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "acceptance_criteria" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "retry_policy" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "timeout_policy" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "approval_requirement" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "execution_constraints" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "supersedes_task_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_version" integer;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_supersedes_mission_id_missions_id_fk" FOREIGN KEY ("supersedes_mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_parent_goal_id_goals_id_fk" FOREIGN KEY ("parent_goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_supersedes_goal_id_goals_id_fk" FOREIGN KEY ("supersedes_goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_parent_plan_id_plans_id_fk" FOREIGN KEY ("parent_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_supersedes_plan_id_plans_id_fk" FOREIGN KEY ("supersedes_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "missions_tenant_scope_idx" ON "missions" USING btree ("tenant_id","scope");--> statement-breakpoint
CREATE INDEX "missions_owner_actor_idx" ON "missions" USING btree ("owner_actor_type","owner_actor_id");--> statement-breakpoint
CREATE INDEX "missions_review_at_idx" ON "missions" USING btree ("review_at");--> statement-breakpoint
CREATE INDEX "missions_supersedes_idx" ON "missions" USING btree ("supersedes_mission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "missions_single_ratified_company_uq" ON "missions" USING btree ("tenant_id","scope") WHERE "missions"."scope" = 'company' and "missions"."mission_lifecycle_status" = 'ratified';--> statement-breakpoint
CREATE INDEX "goals_tenant_mission_idx" ON "goals" USING btree ("tenant_id","mission_id");--> statement-breakpoint
CREATE INDEX "goals_parent_goal_idx" ON "goals" USING btree ("parent_goal_id");--> statement-breakpoint
CREATE INDEX "goals_owner_actor_idx" ON "goals" USING btree ("owner_actor_type","owner_actor_id");--> statement-breakpoint
CREATE INDEX "goals_lifecycle_health_idx" ON "goals" USING btree ("goal_lifecycle_status","goal_health");--> statement-breakpoint
CREATE INDEX "goals_next_review_at_idx" ON "goals" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "goals_supersedes_idx" ON "goals" USING btree ("supersedes_goal_id");--> statement-breakpoint
CREATE INDEX "plans_tenant_goal_idx" ON "plans" USING btree ("tenant_id","goal_id");--> statement-breakpoint
CREATE INDEX "plans_tenant_mission_idx" ON "plans" USING btree ("tenant_id","mission_id");--> statement-breakpoint
CREATE INDEX "plans_parent_plan_idx" ON "plans" USING btree ("parent_plan_id");--> statement-breakpoint
CREATE INDEX "plans_owner_actor_idx" ON "plans" USING btree ("owner_actor_type","owner_actor_id");--> statement-breakpoint
CREATE INDEX "plans_lifecycle_health_idx" ON "plans" USING btree ("plan_lifecycle_status","plan_health");--> statement-breakpoint
CREATE INDEX "plans_next_review_at_idx" ON "plans" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "plans_supersedes_idx" ON "plans" USING btree ("supersedes_plan_id");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_human_id_users_id_fk" FOREIGN KEY ("assigned_human_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_supersedes_task_id_tasks_id_fk" FOREIGN KEY ("supersedes_task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;