/* Tenant-owned coarse allow-only authorization grants. Resource-level policy
 * expressions and explicit deny semantics are intentionally deferred. */
import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { actorTypeEnum } from "./_enums";
import { companies } from "./company";
import { permissions } from "./permission";
import { roles } from "./role";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    ...tenantColumns,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => companies.id, { onDelete: "restrict" }),
    roleId: uuid("role_id").notNull(),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "restrict" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    grantedByType: actorTypeEnum("granted_by_type"),
    grantedById: uuid("granted_by_id"),
  },
  (t) => [
    uniqueIndex("role_permissions_tenant_role_permission_uq").on(
      t.tenantId,
      t.roleId,
      t.permissionId,
    ),
    index("role_permissions_role_idx").on(t.roleId),
    index("role_permissions_permission_idx").on(t.permissionId),
    foreignKey({
      name: "role_permissions_tenant_role_fk",
      columns: [t.tenantId, t.roleId],
      foreignColumns: [roles.tenantId, roles.id],
    }).onDelete("restrict"),
    check(
      "role_permissions_grant_actor_chk",
      sql`(${t.grantedByType} is null) = (${t.grantedById} is null)`,
    ),
  ],
);
