/*
 * Registry CRUD — the reference in-memory data layer for Hebun.
 *
 * Every mutation flows through the Command Bus. In-memory only: no database, no
 * APIs, no persistence. Soft delete only — records are never removed.
 */

export * from "./types";
export * from "./registry-service";
export { getSnapshot, subscribe, resetStore } from "./registry-adapter";
