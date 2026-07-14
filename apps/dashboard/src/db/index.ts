/*
 * Database module — schema foundation only.
 *
 * This exposes the Drizzle schema (tables, enums, relations) for a future
 * SupabasePostgresAdapter to implement the PersistenceAdapter interface against.
 * No client, no connection, no migrations are created in this phase.
 */

export * as schema from "./schema";
