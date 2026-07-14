/* Approvals — governance decisions awaiting the Director / governance gate. */
import { pgTable, text } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { approvalStateEnum } from "./_enums";

export const approvals = pgTable("approvals", {
  ...tenantColumns,
  title: text("title").notNull(),
  summary: text("summary"),
  risk: text("risk"),
  requestedBy: text("requested_by"),
  state: approvalStateEnum("state").notNull().default("pending"),
});
