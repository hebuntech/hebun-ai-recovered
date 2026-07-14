/* Registries — the reference CRUD domain. Columns mirror RegistryCrudRecord. */
import { pgTable, integer, text, uniqueIndex } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";

export const registries = pgTable(
  "registries",
  {
    ...tenantColumns,
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    owner: text("owner"),
    health: integer("health").notNull().default(100),
    totalRecords: integer("total_records").notNull().default(0),
  },
  (t) => [uniqueIndex("registries_tenant_slug_uq").on(t.tenantId, t.slug)]
);
