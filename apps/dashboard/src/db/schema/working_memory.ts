/*
 * Working memory — session-scoped temporary agent context.
 *
 * Declarative storage only. No retrieval runtime, no promotion pipeline, and no
 * knowledge authority semantics in this stage.
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import {
  workingMemoryHealthEnum,
  workingMemoryLifecycleStatusEnum,
} from "./_enums";
import { agents } from "./agent";

export const workingMemories = pgTable(
  "working_memories",
  {
    ...tenantColumns,
    agentId: uuid("agent_id").references(() => agents.id),
    sessionKey: text("session_key").notNull(),
    contextType: text("context_type"),
    contextId: uuid("context_id"),
    summary: text("summary"),
    memoryState: jsonb("memory_state"),
    activeContext: jsonb("active_context"),
    constraints: jsonb("constraints"),
    workingMemoryLifecycleStatus: workingMemoryLifecycleStatusEnum(
      "working_memory_lifecycle_status",
    ),
    workingMemoryHealth: workingMemoryHealthEnum("working_memory_health"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
    compressedAt: timestamp("compressed_at", { withTimezone: true }),
    disposedAt: timestamp("disposed_at", { withTimezone: true }),
    workingMemoryVersion: integer("working_memory_version").notNull().default(1),
  },
  (t) => [
    index("working_memories_tenant_session_key_idx").on(t.tenantId, t.sessionKey),
    index("working_memories_agent_id_idx").on(t.agentId),
    index("working_memories_expires_at_idx").on(t.expiresAt),
  ],
);
