import {
  createRequestCorrelationContext,
  type CorrelationRelationshipType,
  type PlatformScope,
  type RequestCorrelationContext,
} from "../observability";

/**
 * The single platform authority identifier for this deployment.
 *
 * Runtime observability is platform-scoped: runtime projection lifecycle is
 * platform activity, not tenant activity, so no tenant identifier is attached
 * and no tenant data can enter these signals. Read-side consumers must present
 * the same authority to read anything back.
 */
export const PLATFORM_AUTHORITY = "hebun-dashboard";

export const RUNTIME_PLATFORM_SCOPE: Extract<PlatformScope, { kind: "platform" }> = Object.freeze({
  kind: "platform",
  authority: PLATFORM_AUTHORITY,
  resolvedBy: "server",
});

/**
 * Builds the platform correlation context for a runtime activity.
 *
 * Correlation identifiers are supplied by the caller from identifiers that
 * already exist in the runtime — never generated randomly here.
 */
export function runtimePlatformCorrelation(
  relationships: readonly { readonly type: CorrelationRelationshipType; readonly id: string; readonly parentId?: string }[],
): RequestCorrelationContext {
  return createRequestCorrelationContext({
    tenantScope: { kind: "none" },
    platformScope: RUNTIME_PLATFORM_SCOPE,
    relationships: relationships.map(({ type, id, parentId }) => ({ type, id, ...(parentId ? { parentId } : {}) })),
  });
}
