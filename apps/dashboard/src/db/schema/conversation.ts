/* Conversations and messages — AI conversation history. */
import { pgTable, integer, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenantColumns } from "./_base";
import { agents } from "./agent";

export const conversations = pgTable("conversations", {
  ...tenantColumns,
  agentId: uuid("agent_id").references(() => agents.id),
  subject: text("subject"),
});

export const messages = pgTable("messages", {
  ...tenantColumns,
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count"),
});

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));
