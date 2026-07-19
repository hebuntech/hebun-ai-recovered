CREATE TYPE "public"."auth_identity_status" AS ENUM('pending', 'active', 'suspended', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('pending', 'active', 'suspended', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('provisioning', 'active', 'suspended', 'deleting', 'deleted');--> statement-breakpoint
CREATE TABLE "auth_identities" (
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
	"user_id" uuid NOT NULL,
	"provider" varchar(64) NOT NULL,
	"issuer" varchar(2048) NOT NULL,
	"subject" varchar(512) NOT NULL,
	"status" "auth_identity_status" DEFAULT 'pending' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"first_authenticated_at" timestamp with time zone,
	"last_authenticated_at" timestamp with time zone,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_by_type" "actor_type",
	"revoked_by_id" uuid,
	"revocation_reason" varchar(128),
	CONSTRAINT "auth_identities_provider_chk" CHECK ("auth_identities"."provider" ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
	CONSTRAINT "auth_identities_issuer_subject_chk" CHECK (char_length("auth_identities"."issuer") > 0 and "auth_identities"."issuer" = btrim("auth_identities"."issuer") and char_length("auth_identities"."subject") > 0 and "auth_identities"."subject" = btrim("auth_identities"."subject")),
	CONSTRAINT "auth_identities_revocation_actor_chk" CHECK (("auth_identities"."revoked_by_type" is null) = ("auth_identities"."revoked_by_id" is null)),
	CONSTRAINT "auth_identities_active_chk" CHECK ("auth_identities"."status" <> 'active' or ("auth_identities"."verified_at" is not null and "auth_identities"."revoked_at" is null and "auth_identities"."lifecycle_status" = 'active')),
	CONSTRAINT "auth_identities_revoked_chk" CHECK ("auth_identities"."status" <> 'revoked' or ("auth_identities"."revoked_at" is not null and "auth_identities"."revocation_reason" is not null and char_length(btrim("auth_identities"."revocation_reason")) > 0 and "auth_identities"."is_primary" = false)),
	CONSTRAINT "auth_identities_non_revoked_chk" CHECK ("auth_identities"."status" = 'revoked' or ("auth_identities"."revoked_at" is null and "auth_identities"."revocation_reason" is null)),
	CONSTRAINT "auth_identities_primary_active_chk" CHECK ("auth_identities"."is_primary" = false or "auth_identities"."status" = 'active'),
	CONSTRAINT "auth_identities_auth_time_chk" CHECK ("auth_identities"."first_authenticated_at" is null or "auth_identities"."last_authenticated_at" is null or "auth_identities"."first_authenticated_at" <= "auth_identities"."last_authenticated_at"),
	CONSTRAINT "auth_identities_revoked_time_chk" CHECK ("auth_identities"."revoked_at" is null or "auth_identities"."revoked_at" >= "auth_identities"."linked_at")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
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
	"normalized_email" varchar(320) NOT NULL,
	"intended_role_id" uuid NOT NULL,
	"organization_id" uuid,
	"inviter_type" "actor_type" NOT NULL,
	"inviter_id" uuid NOT NULL,
	"token_hash" char(64) NOT NULL,
	"token_version" integer DEFAULT 1 NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by_user_id" uuid,
	"revoked_at" timestamp with time zone,
	"revoked_by_type" "actor_type",
	"revoked_by_id" uuid,
	"revocation_reason" varchar(128),
	"last_sent_at" timestamp with time zone,
	"send_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "invitations_normalized_email_chk" CHECK ("invitations"."normalized_email" = lower(btrim("invitations"."normalized_email")) and char_length("invitations"."normalized_email") > 0),
	CONSTRAINT "invitations_token_hash_chk" CHECK ("invitations"."token_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "invitations_token_version_chk" CHECK ("invitations"."token_version" > 0),
	CONSTRAINT "invitations_send_count_chk" CHECK ("invitations"."send_count" >= 0),
	CONSTRAINT "invitations_expiry_chk" CHECK ("invitations"."expires_at" > "invitations"."issued_at"),
	CONSTRAINT "invitations_revocation_actor_chk" CHECK (("invitations"."revoked_by_type" is null) = ("invitations"."revoked_by_id" is null)),
	CONSTRAINT "invitations_accepted_chk" CHECK ("invitations"."status" <> 'accepted' or ("invitations"."accepted_at" is not null and "invitations"."accepted_by_user_id" is not null)),
	CONSTRAINT "invitations_revoked_chk" CHECK ("invitations"."status" <> 'revoked' or ("invitations"."revoked_at" is not null and "invitations"."revocation_reason" is not null and char_length(btrim("invitations"."revocation_reason")) > 0))
);
--> statement-breakpoint
CREATE TABLE "user_session_contexts" (
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
	"auth_identity_id" uuid NOT NULL,
	"provider_session_reference_hash" char(64) NOT NULL,
	"user_id" uuid NOT NULL,
	"active_tenant_id" uuid,
	"active_membership_id" uuid,
	"membership_version" integer,
	"session_version" integer DEFAULT 1 NOT NULL,
	"assurance_level" varchar(16) NOT NULL,
	"mfa_verified" boolean DEFAULT false NOT NULL,
	"authenticated_at" timestamp with time zone NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"last_activity_at" timestamp with time zone NOT NULL,
	"absolute_expires_at" timestamp with time zone NOT NULL,
	"inactivity_expires_at" timestamp with time zone NOT NULL,
	"recent_auth_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revocation_reason" varchar(64),
	CONSTRAINT "user_session_contexts_reference_hash_chk" CHECK ("user_session_contexts"."provider_session_reference_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "user_session_contexts_assurance_level_chk" CHECK ("user_session_contexts"."assurance_level" in ('aal1', 'aal2', 'aal3')),
	CONSTRAINT "user_session_contexts_mfa_chk" CHECK ("user_session_contexts"."mfa_verified" = false or "user_session_contexts"."assurance_level" in ('aal2', 'aal3')),
	CONSTRAINT "user_session_contexts_tenant_membership_chk" CHECK (("user_session_contexts"."active_tenant_id" is null) = ("user_session_contexts"."active_membership_id" is null)),
	CONSTRAINT "user_session_contexts_membership_version_chk" CHECK (("user_session_contexts"."active_membership_id" is null and "user_session_contexts"."membership_version" is null) or ("user_session_contexts"."active_membership_id" is not null and "user_session_contexts"."membership_version" is not null and "user_session_contexts"."membership_version" > 0)),
	CONSTRAINT "user_session_contexts_session_version_chk" CHECK ("user_session_contexts"."session_version" > 0),
	CONSTRAINT "user_session_contexts_time_order_chk" CHECK ("user_session_contexts"."authenticated_at" <= "user_session_contexts"."issued_at" and "user_session_contexts"."issued_at" <= "user_session_contexts"."last_activity_at" and "user_session_contexts"."inactivity_expires_at" <= "user_session_contexts"."absolute_expires_at"),
	CONSTRAINT "user_session_contexts_recent_auth_chk" CHECK ("user_session_contexts"."recent_auth_at" is null or ("user_session_contexts"."recent_auth_at" >= "user_session_contexts"."authenticated_at" and "user_session_contexts"."recent_auth_at" <= "user_session_contexts"."absolute_expires_at")),
	CONSTRAINT "user_session_contexts_revocation_chk" CHECK (("user_session_contexts"."revoked_at" is null) = ("user_session_contexts"."revocation_reason" is null)),
	CONSTRAINT "user_session_contexts_active_lifecycle_chk" CHECK ("user_session_contexts"."revoked_at" is not null or "user_session_contexts"."lifecycle_status" = 'active')
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
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
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"granted_by_type" "actor_type",
	"granted_by_id" uuid,
	CONSTRAINT "role_permissions_grant_actor_chk" CHECK (("role_permissions"."granted_by_type" is null) = ("role_permissions"."granted_by_id" is null))
);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "tenant_status" "tenant_status";--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "tenant_status_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "suspension_reason" varchar(256);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "authentication_disabled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "deleting_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "status" "membership_status";--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "status_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "revoked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "revoked_by_type" "actor_type";--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "revoked_by_id" uuid;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "revocation_reason" varchar(128);--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "accepted_invitation_id" uuid;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "request_id" varchar(128);--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "session_context_id" uuid;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "authority_source" varchar(64);--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "principal_reference_hash" char(64);--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_id_uq" UNIQUE("tenant_id","id");--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_id_uq" UNIQUE("tenant_id","id");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_id_uq" UNIQUE("tenant_id","id");--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenant_role_fk" FOREIGN KEY ("tenant_id","intended_role_id") REFERENCES "public"."roles"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenant_organization_fk" FOREIGN KEY ("tenant_id","organization_id") REFERENCES "public"."organizations"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session_contexts" ADD CONSTRAINT "user_session_contexts_auth_identity_id_auth_identities_id_fk" FOREIGN KEY ("auth_identity_id") REFERENCES "public"."auth_identities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session_contexts" ADD CONSTRAINT "user_session_contexts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session_contexts" ADD CONSTRAINT "user_session_contexts_active_tenant_id_companies_id_fk" FOREIGN KEY ("active_tenant_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session_contexts" ADD CONSTRAINT "user_session_contexts_tenant_membership_fk" FOREIGN KEY ("active_tenant_id","active_membership_id") REFERENCES "public"."memberships"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_role_fk" FOREIGN KEY ("tenant_id","role_id") REFERENCES "public"."roles"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_provider_issuer_subject_uq" ON "auth_identities" USING btree ("provider","issuer","subject");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_primary_user_uq" ON "auth_identities" USING btree ("user_id") WHERE "auth_identities"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "auth_identities_user_idx" ON "auth_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_identities_status_idx" ON "auth_identities" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_token_hash_uq" ON "invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_pending_email_uq" ON "invitations" USING btree ("tenant_id","normalized_email") WHERE "invitations"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "invitations_tenant_status_expiry_idx" ON "invitations" USING btree ("tenant_id","status","expires_at");--> statement-breakpoint
CREATE INDEX "invitations_accepted_user_idx" ON "invitations" USING btree ("accepted_by_user_id");--> statement-breakpoint
CREATE INDEX "invitations_role_idx" ON "invitations" USING btree ("intended_role_id");--> statement-breakpoint
CREATE INDEX "invitations_organization_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_session_contexts_provider_session_hash_uq" ON "user_session_contexts" USING btree ("provider_session_reference_hash");--> statement-breakpoint
CREATE INDEX "user_session_contexts_user_active_idx" ON "user_session_contexts" USING btree ("user_id") WHERE "user_session_contexts"."revoked_at" is null;--> statement-breakpoint
CREATE INDEX "user_session_contexts_tenant_active_idx" ON "user_session_contexts" USING btree ("active_tenant_id") WHERE "user_session_contexts"."revoked_at" is null;--> statement-breakpoint
CREATE INDEX "user_session_contexts_inactivity_expiry_idx" ON "user_session_contexts" USING btree ("inactivity_expires_at");--> statement-breakpoint
CREATE INDEX "user_session_contexts_absolute_expiry_idx" ON "user_session_contexts" USING btree ("absolute_expires_at");--> statement-breakpoint
CREATE INDEX "user_session_contexts_revoked_retention_idx" ON "user_session_contexts" USING btree ("revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_tenant_role_permission_uq" ON "role_permissions" USING btree ("tenant_id","role_id","permission_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_accepted_invitation_id_invitations_id_fk" FOREIGN KEY ("accepted_invitation_id") REFERENCES "public"."invitations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_request_idx" ON "audit_log" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "audit_log_session_idx" ON "audit_log" USING btree ("session_context_id");--> statement-breakpoint
CREATE INDEX "audit_log_principal_idx" ON "audit_log" USING btree ("principal_reference_hash");--> statement-breakpoint
CREATE INDEX "audit_log_tenant_action_time_idx" ON "audit_log" USING btree ("tenant_id","action","occurred_at");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_accepted_invitation_uq" UNIQUE("accepted_invitation_id");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_revocation_actor_chk" CHECK (("memberships"."revoked_by_type" is null) = ("memberships"."revoked_by_id" is null));--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_principal_reference_hash_chk" CHECK ("audit_log"."principal_reference_hash" is null or "audit_log"."principal_reference_hash" ~ '^[0-9a-f]{64}$');--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_authority_source_chk" CHECK ("audit_log"."authority_source" is null or "audit_log"."authority_source" in ('membership', 'platform-admin', 'internal-service', 'system'));
