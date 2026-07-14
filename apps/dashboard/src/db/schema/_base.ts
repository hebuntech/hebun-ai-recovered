/*
 * Reusable column contracts. No table manually re-declares these.
 *
 * - rootColumns  : global / platform tables (companies, users, providers, …)
 * - tenantColumns : every tenant-owned table. Adds the mandatory tenantId FK.
 *
 * Actor references (S2). createdBy / updatedBy / deletedBy remain plain `uuid`
 * columns (unchanged — no data loss, no runtime change). Each now has a NULLABLE
 * companion `*_by_type` (actorTypeEnum) column, forming the canonical polymorphic
 * `(actorType, actorId)` reference (Identity §3.9). We deliberately do NOT add a
 * single FK-to-users: agent/system/service actors are not rows in `users`, so a
 * users-FK cannot express them and would create a cross-table cycle. Resolution
 * of the pair to a concrete actor is the Identity domain's job (later stage);
 * the columns are additive, nullable, and require no backfill. tenantId carries
 * the real ownership FK.
 */

import { integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { actorTypeEnum, lifecycleStatusEnum } from "./_enums";
import { companies } from "./company";

export const rootColumns = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid("created_by"),
  /** Companion to createdBy — the actor's type in the polymorphic reference. */
  createdByType: actorTypeEnum("created_by_type"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid("updated_by"),
  /** Companion to updatedBy. */
  updatedByType: actorTypeEnum("updated_by_type"),
  version: integer("version").notNull().default(1),
  lifecycleStatus: lifecycleStatusEnum("lifecycle_status").notNull().default("active"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  /** Soft-delete actor attribution — nullable; set only when the row is deleted. */
  deletedBy: uuid("deleted_by"),
  /** Companion to deletedBy. */
  deletedByType: actorTypeEnum("deleted_by_type"),
};

export const tenantColumns = {
  ...rootColumns,
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => companies.id),
};
