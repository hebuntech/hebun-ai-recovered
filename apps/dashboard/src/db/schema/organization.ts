/* Organizations — sub-structure under a company (tenant-owned).
 *
 * S5 adds ADDITIVE owner/manager actor pairs + scope metadata (all nullable).
 * No parent-org table and NO Team/Workspace/Subsidiary tables (specified-but-not-
 * implemented until a proven requirement). Lifecycle/version from tenantColumns. */
import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { actorTypeEnum } from "./_enums";

export const organizations = pgTable(
  "organizations",
  {
    ...tenantColumns,
    name: text("name").notNull(),
    slug: text("slug").notNull(),

    /* ── S5 additive ownership (canonical actor pairs; no FK) ── */
    ownerActorType: actorTypeEnum("owner_actor_type"),
    ownerActorId: uuid("owner_actor_id"),
    managerActorType: actorTypeEnum("manager_actor_type"),
    managerActorId: uuid("manager_actor_id"),
    scope: text("scope"),
  },
  (t) => [unique("organizations_tenant_id_id_uq").on(t.tenantId, t.id)],
);
