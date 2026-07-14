/* Integrations — external services connected by a tenant to a platform provider. */
import { pgTable, jsonb, text, uuid } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { integrationStatusEnum } from "./_enums";
import { providers } from "./provider";

export const integrations = pgTable("integrations", {
  ...tenantColumns,
  providerId: uuid("provider_id").references(() => providers.id),
  name: text("name").notNull(),
  status: integrationStatusEnum("status").notNull().default("pending"),
  scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
});
