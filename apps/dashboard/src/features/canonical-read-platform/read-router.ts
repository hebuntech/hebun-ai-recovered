export interface ReadRouterObservation {
  readonly routeId: string;
  readonly domain: string;
  readonly authoritativeProvider: string;
  readonly shadowProvider?: string;
  readonly routingDecision: "authoritative-only" | "authoritative-with-shadow";
  readonly rolloutDecision?: string;
  readonly comparisonStatus?: string;
  readonly authoritativeLatencyMs: number;
  readonly totalLatencyMs?: number;
  readonly recordedAt: string;
}

export interface ReadRouterShadowPlan {
  readonly routingDecision: ReadRouterObservation["routingDecision"];
  readonly rolloutDecision?: string;
  readonly invokeShadowParticipant: boolean;
  readonly shadowProvider?: string;
}

let routeSequence = 0;
const latestByDomain = new Map<string, ReadRouterObservation>();

function now(): number {
  const perf = (globalThis as { performance?: { now(): number } }).performance;
  return perf ? perf.now() : Date.now();
}

function nextRouteId(domain: string): string {
  routeSequence += 1;
  return `${domain}-route-${String(routeSequence).padStart(6, "0")}`;
}

function recordObservation(observation: ReadRouterObservation): void {
  latestByDomain.set(observation.domain, observation);
}

export function getLatestReadRouterObservation(
  domain: string,
): ReadRouterObservation | undefined {
  return latestByDomain.get(domain);
}

export async function runReadRouter<Result, ShadowObservation>(params: {
  readonly domain: string;
  readonly authoritativeProvider: string;
  readonly executeAuthoritative: () => Promise<Result>;
  readonly planShadow?: (result: Result) => ReadRouterShadowPlan;
  readonly invokeShadowParticipant?: (
    result: Result,
    handlers: {
      readonly complete: (observation: ShadowObservation) => void;
      readonly fail: (error: unknown) => void;
    },
  ) => void;
  readonly describeShadowObservation?: (
    observation: ShadowObservation,
  ) => string | undefined;
  readonly describeShadowError?: (error: unknown) => string | undefined;
}): Promise<Result> {
  const startedAt = now();
  const result = await params.executeAuthoritative();
  const authoritativeLatencyMs = now() - startedAt;
  const routeId = nextRouteId(params.domain);
  const shadowPlan = params.planShadow?.(result) ?? {
    routingDecision: "authoritative-only" as const,
    invokeShadowParticipant: false,
  };

  recordObservation({
    routeId,
    domain: params.domain,
    authoritativeProvider: params.authoritativeProvider,
    shadowProvider: shadowPlan.shadowProvider,
    routingDecision: shadowPlan.routingDecision,
    rolloutDecision: shadowPlan.rolloutDecision,
    comparisonStatus: shadowPlan.invokeShadowParticipant
      ? shadowPlan.routingDecision === "authoritative-with-shadow"
        ? "pending"
        : "skipped"
      : "skipped",
    authoritativeLatencyMs,
    totalLatencyMs: authoritativeLatencyMs,
    recordedAt: new Date().toISOString(),
  });

  if (shadowPlan.invokeShadowParticipant && params.invokeShadowParticipant) {
    params.invokeShadowParticipant(result, {
      complete: (observation) => {
        recordObservation({
          routeId,
          domain: params.domain,
          authoritativeProvider: params.authoritativeProvider,
          shadowProvider: shadowPlan.shadowProvider,
          routingDecision: shadowPlan.routingDecision,
          rolloutDecision: shadowPlan.rolloutDecision,
          comparisonStatus: params.describeShadowObservation?.(observation),
          authoritativeLatencyMs,
          totalLatencyMs: now() - startedAt,
          recordedAt: new Date().toISOString(),
        });
      },
      fail: (error) => {
        recordObservation({
          routeId,
          domain: params.domain,
          authoritativeProvider: params.authoritativeProvider,
          shadowProvider: shadowPlan.shadowProvider,
          routingDecision: shadowPlan.routingDecision,
          rolloutDecision: shadowPlan.rolloutDecision,
          comparisonStatus:
            params.describeShadowError?.(error) ?? "shadow-error",
          authoritativeLatencyMs,
          totalLatencyMs: now() - startedAt,
          recordedAt: new Date().toISOString(),
        });
      },
    });
  }

  return result;
}
