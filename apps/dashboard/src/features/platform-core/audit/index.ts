/*
 * platform-core / audit — barrel.
 * Canonical immutable audit record contract (Spec 48 §7.3). Contract only —
 * no sink, no writer, no persistence; does not touch command_audit.
 */
export type { AuditResult, AuditRecord } from "./types";
export { makeAuditRecord } from "./audit-record";
export { toAuditLogInsert } from "./audit-mapping";
export type { AuditLogInsert } from "./audit-mapping";
