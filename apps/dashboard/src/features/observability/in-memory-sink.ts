import type {
  CanonicalSignalSink,
  RoutedCanonicalSignal,
} from "./collection-types";
import { isCanonicalSignal } from "./canonical-signal";
import type { SignalRoute } from "./policy";
import type { CanonicalSignal, CanonicalSignalType, CorrelationRelationshipType, PlatformScope, TenantScope } from "./types";

export type InMemorySinkAppendResult = "stored" | "duplicate";

export interface InMemorySignalQuery {
  readonly tenantId?: string;
  readonly platformAuthority?: string;
  readonly signalType?: CanonicalSignalType;
  readonly from?: string;
  readonly to?: string;
  readonly correlation?: { readonly type: CorrelationRelationshipType; readonly id: string };
}

export class InMemoryAppendOnlySignalSink implements CanonicalSignalSink {
  readonly #signals: CanonicalSignal[] = [];
  readonly #signalIds = new Set<string>();
  readonly route: SignalRoute;
  readonly capacity: number;

  constructor(input: { readonly route: SignalRoute; readonly capacity: number }) {
    if (!Number.isSafeInteger(input.capacity) || input.capacity <= 0) throw new RangeError("Sink capacity must be positive.");
    this.route = input.route;
    this.capacity = input.capacity;
  }

  async append(delivery: RoutedCanonicalSignal): Promise<InMemorySinkAppendResult> {
    if (delivery.route !== this.route || delivery.disposition !== this.route) throw new TypeError("Signal route does not match sink.");
    if (!isCanonicalSignal(delivery.signal) || !Object.isFrozen(delivery.signal)) {
      throw new TypeError("Sink accepts immutable canonical signals only.");
    }
    if (this.#signalIds.has(delivery.signal.signalId)) return "duplicate";
    if (this.#signals.length >= this.capacity) throw new SignalSinkCapacityError();
    this.#signals.push(delivery.signal);
    this.#signalIds.add(delivery.signal.signalId);
    return "stored";
  }

  query(query: InMemorySignalQuery, authorityScope: TenantScope | PlatformScope): readonly CanonicalSignal[] {
    const tenantQuery = query.tenantId !== undefined;
    const platformQuery = query.platformAuthority !== undefined;
    if (tenantQuery === platformQuery) throw new TypeError("Exactly one read scope is required.");
    if (
      (tenantQuery && (authorityScope.kind !== "tenant" || authorityScope.tenantId !== query.tenantId)) ||
      (platformQuery && (authorityScope.kind !== "platform" || authorityScope.authority !== query.platformAuthority))
    ) {
      throw new TypeError("Cross-scope signal read rejected.");
    }
    const from = query.from ? Date.parse(query.from) : Number.NEGATIVE_INFINITY;
    const to = query.to ? Date.parse(query.to) : Number.POSITIVE_INFINITY;
    if (!Number.isFinite(from) && from !== Number.NEGATIVE_INFINITY) throw new TypeError("Invalid time window.");
    if (!Number.isFinite(to) && to !== Number.POSITIVE_INFINITY) throw new TypeError("Invalid time window.");

    return Object.freeze(this.#signals.filter((signal) => {
      if (tenantQuery && (signal.tenantScope.kind !== "tenant" || signal.tenantScope.tenantId !== query.tenantId)) return false;
      if (platformQuery && (signal.platformScope.kind !== "platform" || signal.platformScope.authority !== query.platformAuthority)) return false;
      const eventTime = Date.parse(signal.canonicalEventTime);
      return (!query.signalType || signal.signalType === query.signalType) &&
        eventTime >= from && eventTime <= to &&
        (!query.correlation || signal.correlation.relationships.some((relationship) => relationship.type === query.correlation?.type && relationship.id === query.correlation.id));
    }));
  }

  resetForTests(): void {
    this.#signals.length = 0;
    this.#signalIds.clear();
  }
}

export class SignalSinkCapacityError extends Error {
  constructor() {
    super("Signal sink capacity exhausted.");
    this.name = "SignalSinkCapacityError";
  }
}
