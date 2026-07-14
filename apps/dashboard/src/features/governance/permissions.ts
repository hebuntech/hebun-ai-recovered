import type {
  PermissionRole,
  PermissionMatrixRow,
  PermissionChange,
  PermissionConflict,
} from "@/features/governance/types";

export const permissionRoles: PermissionRole[] = [
  { id: "role-1", role: "Director", department: "Director", privilege: "high", seats: 2 },
  { id: "role-2", role: "Finance Approver", department: "Finance", privilege: "medium", seats: 4 },
  { id: "role-3", role: "Legal Reviewer", department: "Legal", privilege: "medium", seats: 3 },
  { id: "role-4", role: "Operations Supervisor", department: "Operations", privilege: "baseline", seats: 5 },
  { id: "role-5", role: "HR Admin", department: "HR", privilege: "medium", seats: 3 },
];

export const permissionMatrix: PermissionMatrixRow[] = [
  { capability: "Approve budget overrides", finance: "allow", hr: "deny", legal: "review", operations: "deny", director: "allow" },
  { capability: "Publish policy updates", finance: "deny", hr: "review", legal: "allow", operations: "review", director: "allow" },
  { capability: "Grant tool access", finance: "review", hr: "deny", legal: "review", operations: "deny", director: "allow" },
  { capability: "Override workflow controls", finance: "review", hr: "deny", legal: "review", operations: "allow", director: "allow" },
  { capability: "Access explainability evidence", finance: "allow", hr: "review", legal: "allow", operations: "allow", director: "allow" },
];

export const permissionChanges: PermissionChange[] = [
  { id: "chg-1", actor: "Security Agent", change: "Removed export privilege from Support emergency workflow", when: "21m ago" },
  { id: "chg-2", actor: "Director", change: "Granted temporary approval seat to Finance Director", when: "2h ago" },
  { id: "chg-3", actor: "HR Agent", change: "Requested elevated access for Learning Ops role", when: "5h ago" },
];

export const permissionConflicts: PermissionConflict[] = [
  { id: "conf-1", title: "HR Admin role overlaps policy publication rights", severity: "warning", detail: "Role can request and approve its own department policy update." },
  { id: "conf-2", title: "Support export exception missing secondary reviewer", severity: "error", detail: "One-time data export path bypasses dual review requirement." },
];

export const highPrivilegeAccounts = [
  { id: "acct-1", name: "Director Console", owner: "Director", lastReview: "2d ago" },
  { id: "acct-2", name: "Security Agent Supervisor", owner: "Security Agent", lastReview: "today" },
  { id: "acct-3", name: "Finance Emergency Approver", owner: "Finance Director", lastReview: "today" },
];
