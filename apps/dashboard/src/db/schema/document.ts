/* Documents — metadata in Postgres; binary lives in Supabase Storage. */
import { pgTable, text } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";

export const documents = pgTable("documents", {
  ...tenantColumns,
  title: text("title").notNull(),
  category: text("category"),
  storagePath: text("storage_path"),
});
