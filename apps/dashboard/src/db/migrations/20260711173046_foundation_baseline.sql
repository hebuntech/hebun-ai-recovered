CREATE TYPE "public"."agent_capability" AS ENUM('reasoning', 'planning', 'memory', 'knowledge-retrieval', 'tool-usage', 'browser-usage', 'mcp-usage', 'llm-usage', 'document-analysis', 'code-generation', 'research', 'communication', 'scheduling', 'monitoring');--> statement-breakpoint
CREATE TYPE "public"."agent_health" AS ENUM('unknown', 'healthy', 'degraded', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."agent_lifecycle_status" AS ENUM('created', 'configured', 'training', 'active', 'busy', 'idle', 'paused', 'suspended', 'replaced', 'retired', 'archived');--> statement-breakpoint
CREATE TYPE "public"."agent_risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."agent_type" AS ENUM('executive', 'director', 'department', 'specialist', 'operator', 'research', 'creative', 'coding', 'support', 'finance', 'hr', 'legal', 'sales', 'marketing', 'custom');--> statement-breakpoint
CREATE TYPE "public"."approval_state" AS ENUM('not-required', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."command_execution_type" AS ENUM('local', 'remote', 'async', 'sync', 'event', 'scheduled', 'interactive', 'human');--> statement-breakpoint
CREATE TYPE "public"."command_health" AS ENUM('unknown', 'healthy', 'degraded', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."command_lifecycle_status" AS ENUM('created', 'validated', 'queued', 'released', 'accepted', 'executing', 'completed', 'failed', 'cancelled', 'expired', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."command_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."command_source" AS ENUM('ui', 'voice', 'system', 'scheduler', 'api');--> statement-breakpoint
CREATE TYPE "public"."command_status" AS ENUM('queued', 'running', 'completed', 'cancelled', 'failed', 'simulated');--> statement-breakpoint
CREATE TYPE "public"."command_target_type" AS ENUM('agent', 'human', 'llm', 'mcp-server', 'browser', 'api', 'database', 'queue', 'webhook', 'email', 'file-system', 'operating-system', 'scheduler', 'external-saas', 'robot');--> statement-breakpoint
CREATE TYPE "public"."execution_health" AS ENUM('unknown', 'healthy', 'degraded', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."execution_lifecycle_status" AS ENUM('pending', 'accepted', 'preparing', 'executing', 'validating', 'committing', 'completed', 'failed', 'cancelled', 'timed-out', 'compensated', 'archived');--> statement-breakpoint
CREATE TYPE "public"."execution_status" AS ENUM('pending', 'running', 'completed', 'cancelled', 'failed', 'simulated');--> statement-breakpoint
CREATE TYPE "public"."goal_health" AS ENUM('unknown', 'on-track', 'at-risk', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."goal_lifecycle_status" AS ENUM('draft', 'proposed', 'approved', 'active', 'achieved', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."goal_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."goal_scope" AS ENUM('strategic', 'department', 'team', 'operational');--> statement-breakpoint
CREATE TYPE "public"."governance_decision_type" AS ENUM('approve', 'ratify', 'promote', 'certify', 'suspend', 'revoke', 'delegate-authority', 'escalate-authority', 'reject', 'appeal');--> statement-breakpoint
CREATE TYPE "public"."governance_domain" AS ENUM('mission', 'goal', 'plan', 'workflow', 'command', 'memory-promotion', 'knowledge-ratification', 'learning', 'agent-registration', 'provider-tool', 'emergency', 'authority-delegation');--> statement-breakpoint
CREATE TYPE "public"."governance_gate_type" AS ENUM('compliance', 'security', 'audit', 'legal', 'financial', 'operational', 'ai-safety');--> statement-breakpoint
CREATE TYPE "public"."governance_health" AS ENUM('unknown', 'healthy', 'degraded', 'stalled');--> statement-breakpoint
CREATE TYPE "public"."governance_lifecycle_status" AS ENUM('created', 'intake', 'classified', 'under-review', 'deliberating', 'decided', 'recorded', 'appealed', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."improvement_proposal_type" AS ENUM('skill', 'procedure', 'workflow', 'prompt', 'calibration', 'optimization');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('connected', 'pending', 'syncing', 'error');--> statement-breakpoint
CREATE TYPE "public"."knowledge_authority" AS ENUM('authoritative', 'provisional');--> statement-breakpoint
CREATE TYPE "public"."knowledge_health" AS ENUM('unknown', 'current', 'stale', 'contested');--> statement-breakpoint
CREATE TYPE "public"."knowledge_lifecycle_status" AS ENUM('draft', 'proposed', 'under-review', 'ratified', 'superseded', 'deprecated', 'retired', 'archived');--> statement-breakpoint
CREATE TYPE "public"."knowledge_scope" AS ENUM('company-wide', 'department', 'domain');--> statement-breakpoint
CREATE TYPE "public"."learning_health" AS ENUM('unknown', 'healthy', 'degraded', 'diverging');--> statement-breakpoint
CREATE TYPE "public"."learning_lifecycle_status" AS ENUM('created', 'collecting', 'analyzing', 'proposing', 'under-review', 'approved', 'applied', 'rolled-back', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."learning_type" AS ENUM('personal', 'organizational', 'cross-agent');--> statement-breakpoint
CREATE TYPE "public"."lifecycle_status" AS ENUM('active', 'archived', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."memory_health" AS ENUM('unknown', 'trusted', 'degraded', 'conflicted');--> statement-breakpoint
CREATE TYPE "public"."memory_kind" AS ENUM('episodic', 'semantic', 'procedural');--> statement-breakpoint
CREATE TYPE "public"."memory_lifecycle_status" AS ENUM('proposed', 'active', 'corrected', 'superseded', 'aged', 'archived', 'soft-deleted', 'purged');--> statement-breakpoint
CREATE TYPE "public"."memory_scope" AS ENUM('personal', 'shared', 'organizational');--> statement-breakpoint
CREATE TYPE "public"."mission_lifecycle_status" AS ENUM('draft', 'proposed', 'ratified', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('unread', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."permission_scope" AS ENUM('command', 'registry', 'governance', 'finance', 'hr', 'legal', 'platform');--> statement-breakpoint
CREATE TYPE "public"."plan_health" AS ENUM('unknown', 'on-track', 'at-risk', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."plan_lifecycle_status" AS ENUM('draft', 'proposed', 'approved', 'active', 'completed', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."plan_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."plan_scope" AS ENUM('strategic', 'department', 'team', 'operational');--> statement-breakpoint
CREATE TYPE "public"."policy_authority" AS ENUM('authoritative', 'provisional');--> statement-breakpoint
CREATE TYPE "public"."policy_domain" AS ENUM('security', 'compliance', 'financial', 'operational', 'legal', 'hr', 'data-governance', 'privacy', 'ai-safety', 'risk-control');--> statement-breakpoint
CREATE TYPE "public"."policy_health" AS ENUM('unknown', 'current', 'stale', 'conflicted');--> statement-breakpoint
CREATE TYPE "public"."policy_lifecycle_status" AS ENUM('draft', 'proposed', 'under-review', 'ratified', 'superseded', 'deprecated', 'expired', 'retired', 'archived');--> statement-breakpoint
CREATE TYPE "public"."policy_scope" AS ENUM('company-wide', 'department', 'domain');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('simulation', 'dry-run', 'read-only', 'blocked', 'live');--> statement-breakpoint
CREATE TYPE "public"."reasoning_health" AS ENUM('unknown', 'healthy', 'degraded', 'stalled');--> statement-breakpoint
CREATE TYPE "public"."reasoning_lifecycle_status" AS ENUM('created', 'hydrated', 'reasoning', 'deliberating', 'verifying', 'concluded', 'escalated', 'failed', 'disposed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."reasoning_strategy" AS ENUM('deliberative', 'deterministic', 'non-deterministic', 'multi-model', 'parallel', 'reflective', 'simulation', 'counterfactual');--> statement-breakpoint
CREATE TYPE "public"."risk_class" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('owner', 'director', 'operator', 'auditor', 'member');--> statement-breakpoint
CREATE TYPE "public"."rule_type" AS ENUM('allow', 'require', 'forbid', 'constrain', 'obligation');--> statement-breakpoint
CREATE TYPE "public"."stage_status" AS ENUM('passed', 'failed', 'skipped', 'done');--> statement-breakpoint
CREATE TYPE "public"."task_execution_type" AS ENUM('human', 'agent', 'hybrid', 'external-system', 'scheduled', 'event-driven', 'manual');--> statement-breakpoint
CREATE TYPE "public"."task_health" AS ENUM('unknown', 'healthy', 'at-risk', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."task_lifecycle_status" AS ENUM('draft', 'planned', 'ready', 'assigned', 'waiting', 'running', 'completed', 'cancelled', 'failed', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."task_risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'running', 'blocked', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."voting_mode" AS ENUM('single', 'multi-stage', 'vote', 'consensus', 'quorum');--> statement-breakpoint
CREATE TYPE "public"."workflow_execution_strategy" AS ENUM('sequential', 'parallel', 'conditional', 'event-driven', 'scheduled', 'human-in-loop', 'multi-agent', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."workflow_health" AS ENUM('unknown', 'healthy', 'degraded', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."workflow_lifecycle_status" AS ENUM('draft', 'planned', 'approved', 'released', 'running', 'paused', 'completed', 'failed', 'cancelled', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."workflow_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."working_memory_health" AS ENUM('unknown', 'healthy', 'degraded', 'overflow', 'corrupted');--> statement-breakpoint
CREATE TYPE "public"."working_memory_lifecycle_status" AS ENUM('created', 'hydrated', 'active', 'updated', 'compressed', 'expired', 'disposed', 'archived');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"auth_id" text,
	"email" text NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "role_type" DEFAULT 'member' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"key" text NOT NULL,
	"scope" "permission_scope" NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"status" "provider_status" DEFAULT 'simulation' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"department_id" uuid,
	"name" text NOT NULL,
	"role" text
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid,
	"title" text NOT NULL,
	"status" "task_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid,
	"status" "execution_status" DEFAULT 'pending' NOT NULL,
	"retries" integer DEFAULT 0 NOT NULL,
	"duration" text
);
--> statement-breakpoint
CREATE TABLE "registries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"owner" text,
	"health" integer DEFAULT 100 NOT NULL,
	"total_records" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"provider_id" uuid,
	"name" text NOT NULL,
	"status" "integration_status" DEFAULT 'pending' NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"trace_id" text NOT NULL,
	"command_type" text NOT NULL,
	"source" "command_source" DEFAULT 'ui' NOT NULL,
	"actor" text NOT NULL,
	"status" "command_status" DEFAULT 'queued' NOT NULL,
	"approval_state" "approval_state" DEFAULT 'not-required' NOT NULL,
	"context" jsonb,
	"payload" jsonb,
	"lifecycle" jsonb,
	"dispatched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"command_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entry" text NOT NULL,
	"previous_state" text,
	"new_state" text,
	"simulation" boolean DEFAULT true NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telemetry_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"command_id" uuid,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"value" integer,
	"duration_ms" integer,
	"data" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"risk" text,
	"requested_by" text,
	"state" "approval_state" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"agent_id" uuid,
	"kind" "memory_kind" DEFAULT 'episodic' NOT NULL,
	"content" text NOT NULL,
	"importance" integer DEFAULT 0 NOT NULL,
	"source_command_id" uuid
);
--> statement-breakpoint
CREATE TABLE "knowledge_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"from_node_id" uuid NOT NULL,
	"to_node_id" uuid NOT NULL,
	"relation" text NOT NULL,
	"weight" double precision DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"type" text NOT NULL,
	"ref_id" text,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reasoning_traces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"command_id" uuid,
	"confidence" integer,
	"stages" jsonb,
	"evidence" jsonb
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"agent_id" uuid,
	"subject" text
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"token_count" integer
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"storage_path" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"lifecycle_status" "lifecycle_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"status" "notification_status" DEFAULT 'unread' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registries" ADD CONSTRAINT "registries_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_audit" ADD CONSTRAINT "command_audit_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_audit" ADD CONSTRAINT "command_audit_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_events" ADD CONSTRAINT "telemetry_events_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_events" ADD CONSTRAINT "telemetry_events_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD CONSTRAINT "knowledge_edges_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD CONSTRAINT "knowledge_edges_from_node_id_knowledge_nodes_id_fk" FOREIGN KEY ("from_node_id") REFERENCES "public"."knowledge_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_edges" ADD CONSTRAINT "knowledge_edges_to_node_id_knowledge_nodes_id_fk" FOREIGN KEY ("to_node_id") REFERENCES "public"."knowledge_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasoning_traces" ADD CONSTRAINT "reasoning_traces_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "companies_slug_uq" ON "companies" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_key_uq" ON "permissions" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_tenant_user_uq" ON "memberships" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "providers_key_uq" ON "providers" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "registries_tenant_slug_uq" ON "registries" USING btree ("tenant_id","slug");