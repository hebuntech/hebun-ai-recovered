/*
 * Company = tenant root. Every other tenant-owned row references companies.id
 * via tenantColumns. Uses rootColumns (a company is not owned by another tenant).
 */

import { pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rootColumns } from "./_base";
import { organizations } from "./organization";
import { departments } from "./department";
import { agents } from "./agent";
import { registries } from "./registry";
import { tenantStatusEnum } from "./_enums";

export const companies = pgTable(
  "companies",
  {
    ...rootColumns,
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    plan: text("plan").notNull().default("free"),
    tenantStatus: tenantStatusEnum("tenant_status"),
    tenantStatusChangedAt: timestamp("tenant_status_changed_at", { withTimezone: true }),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    suspensionReason: varchar("suspension_reason", { length: 256 }),
    authenticationDisabledAt: timestamp("authentication_disabled_at", {
      withTimezone: true,
    }),
    deletingAt: timestamp("deleting_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("companies_slug_uq").on(t.slug)]
);

/* Ownership relations that are already certain. */
export const companiesRelations = relations(companies, ({ many }) => ({
  organizations: many(organizations),
  departments: many(departments),
  agents: many(agents),
  registries: many(registries),
}));
