/* Notifications — per-tenant delivery surface. */
import { pgTable, text } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { notificationStatusEnum } from "./_enums";

export const notifications = pgTable("notifications", {
  ...tenantColumns,
  title: text("title").notNull(),
  body: text("body"),
  status: notificationStatusEnum("status").notNull().default("unread"),
});
