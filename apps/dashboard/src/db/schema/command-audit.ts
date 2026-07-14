/* Command audit — append-only trail, one entry per command decision/mutation. */
import { pgTable, boolean, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import { commands } from "./command";

export const commandAudit = pgTable("command_audit", {
  ...tenantColumns,
  commandId: uuid("command_id").notNull().references(() => commands.id),
  action: text("action").notNull(),
  entry: text("entry").notNull(),
  previousState: text("previous_state"),
  newState: text("new_state"),
  simulation: boolean("simulation").notNull().default(true),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});
