/* Telemetry events — append-only metric stream, optionally tied to a command. */
import { pgTable, integer, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { commands } from "./command";

export const telemetryEvents = pgTable("telemetry_events", {
  ...tenantColumns,
  commandId: uuid("command_id").references(() => commands.id),
  category: text("category").notNull(),
  name: text("name").notNull(),
  value: integer("value"),
  durationMs: integer("duration_ms"),
  data: jsonb("data"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});
