/* Memories — persistent organizational memory. Optional agent scope. */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { tenantColumns } from "./_base";
import {
  memoryHealthEnum,
  memoryKindEnum,
  memoryLifecycleStatusEnum,
  memoryScopeEnum,
} from "./_enums";
import { agents } from "./agent";

export const memories = pgTable(
  "memories",
  {
    ...tenantColumns,
    agentId: uuid("agent_id").references(() => agents.id),
    kind: memoryKindEnum("kind").notNull().default("episodic"),
    content: text("content").notNull(),
    importance: integer("importance").notNull().default(0),
    sourceCommandId: uuid("source_command_id"),

    /* ── S9 long-term memory foundation (declarative only) ── */
    scope: memoryScopeEnum("scope"),
    namespace: text("namespace"),
    collection: text("collection"),
    provenance: jsonb("provenance"),
    lineage: jsonb("lineage"),
    trust: jsonb("trust"),
    quality: jsonb("quality"),
    promotionMetadata: jsonb("promotion_metadata"),
    retentionMetadata: jsonb("retention_metadata"),
    agingMetadata: jsonb("aging_metadata"),
    correctionMetadata: jsonb("correction_metadata"),
    supersessionMetadata: jsonb("supersession_metadata"),
    storageMetadata: jsonb("storage_metadata"),
    memoryLifecycleStatus: memoryLifecycleStatusEnum("memory_lifecycle_status"),
    memoryHealth: memoryHealthEnum("memory_health"),
    memoryVersion: integer("memory_version").notNull().default(1),
    supersedesMemoryId: uuid("supersedes_memory_id").references(
      (): AnyPgColumn => memories.id,
    ),
  },
  (t) => [
    index("memories_tenant_scope_namespace_idx").on(
      t.tenantId,
      t.scope,
      t.namespace,
    ),
    index("memories_supersedes_memory_id_idx").on(t.supersedesMemoryId),
  ],
);
