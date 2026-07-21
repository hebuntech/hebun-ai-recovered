import type { DashboardAuthorityScope } from "../director-dashboard-data";

/**
 * The canonical Dashboard authority scope.
 *
 * The dashboard reads as a single platform authority. This is the one
 * definition every dashboard consumer must use — the server adapter and the
 * client board previously declared it separately, which allowed the two to
 * drift apart silently.
 *
 * Platform-scoped only. No tenant scope, no runtime scope, no scope switching.
 */
export const DASHBOARD_PLATFORM_AUTHORITY = "hebun-dashboard";

export const DASHBOARD_SCOPE: DashboardAuthorityScope = Object.freeze({
  kind: "platform",
  authority: DASHBOARD_PLATFORM_AUTHORITY,
  resolvedBy: "server",
});
