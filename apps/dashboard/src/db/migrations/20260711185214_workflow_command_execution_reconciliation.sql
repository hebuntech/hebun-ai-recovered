ALTER TABLE "workflows" ADD COLUMN "mission_id" uuid;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "mission_version" integer;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "goal_version" integer;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "plan_version" integer;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "workflow_lifecycle_status" "workflow_lifecycle_status";--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "workflow_health" "workflow_health";--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "workflow_execution_strategy" "workflow_execution_strategy";--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "owner_actor_type" "actor_type";--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "owner_actor_id" uuid;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "released_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "execution_graph" jsonb;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "orchestration_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "rollback_strategy" jsonb;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "compensation_strategy" jsonb;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "workflow_version" integer;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "supersedes_workflow_id" uuid;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "command_id" uuid;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "task_id" uuid;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "mission_id" uuid;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "execution_lifecycle_status" "execution_lifecycle_status";--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "execution_health" "execution_health";--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "attempt_number" integer;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "effect_ledger_id" uuid;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "execution_context_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "provider_resolution" jsonb;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "resolved_target" jsonb;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "execution_metrics" jsonb;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "simulation_mode" "provider_status";--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "validated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "committed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "execution_version" integer;--> statement-breakpoint
ALTER TABLE "executions" ADD COLUMN "supersedes_execution_id" uuid;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "mission_id" uuid;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "mission_version" integer;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "goal_version" integer;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "plan_version" integer;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "task_id" uuid;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "task_version" integer;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "workflow_id" uuid;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "workflow_version" integer;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "workflow_node_id" text;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "command_lifecycle_status" "command_lifecycle_status";--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "command_health" "command_health";--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "command_target_type" "command_target_type";--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "command_execution_type" "command_execution_type";--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "command_priority" "command_priority";--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "correlation_id" text;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "causation_id" text;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "simulation_mode" "provider_status";--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "provider_constraints" jsonb;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "execution_context" jsonb;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "expected_result" jsonb;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "command_version" integer;--> statement-breakpoint
ALTER TABLE "commands" ADD COLUMN "supersedes_command_id" uuid;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_supersedes_workflow_id_workflows_id_fk" FOREIGN KEY ("supersedes_workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_supersedes_execution_id_executions_id_fk" FOREIGN KEY ("supersedes_execution_id") REFERENCES "public"."executions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_supersedes_command_id_commands_id_fk" FOREIGN KEY ("supersedes_command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workflows_tenant_plan_idx" ON "workflows" USING btree ("tenant_id","plan_id");--> statement-breakpoint
CREATE INDEX "workflows_lifecycle_health_idx" ON "workflows" USING btree ("workflow_lifecycle_status","workflow_health");--> statement-breakpoint
CREATE INDEX "workflows_owner_actor_idx" ON "workflows" USING btree ("owner_actor_type","owner_actor_id");--> statement-breakpoint
CREATE INDEX "workflows_supersedes_idx" ON "workflows" USING btree ("supersedes_workflow_id");--> statement-breakpoint
CREATE INDEX "executions_command_idx" ON "executions" USING btree ("command_id");--> statement-breakpoint
CREATE INDEX "executions_workflow_idx" ON "executions" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "executions_lifecycle_health_idx" ON "executions" USING btree ("execution_lifecycle_status","execution_health");--> statement-breakpoint
CREATE INDEX "executions_supersedes_idx" ON "executions" USING btree ("supersedes_execution_id");--> statement-breakpoint
CREATE INDEX "commands_workflow_idx" ON "commands" USING btree ("workflow_id","workflow_node_id");--> statement-breakpoint
CREATE INDEX "commands_task_idx" ON "commands" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "commands_correlation_idx" ON "commands" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "commands_idempotency_idx" ON "commands" USING btree ("tenant_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "commands_lifecycle_health_idx" ON "commands" USING btree ("command_lifecycle_status","command_health");--> statement-breakpoint
CREATE INDEX "commands_supersedes_idx" ON "commands" USING btree ("supersedes_command_id");