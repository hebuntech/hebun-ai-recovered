/* Departments — belong to a company, optionally to an organization.
 *
 * S5 adds ADDITIVE owner/manager actor pairs (all nullable). Existing
 * organizationId parent link is UNCHANGED. No Team table (specified-but-not-
 * implemented). Lifecycle/version from tenantColumns. */
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { actorTypeEnum } from "./_enums";
import { organizations } from "./organization";

export const departments = pgTable("departments", {
  ...tenantColumns,
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),

  /* ── S5 additive ownership (canonical actor pairs; no FK) ── */
  ownerActorType: actorTypeEnum("owner_actor_type"),
  ownerActorId: uuid("owner_actor_id"),
  managerActorType: actorTypeEnum("manager_actor_type"),
  managerActorId: uuid("manager_actor_id"),
});
