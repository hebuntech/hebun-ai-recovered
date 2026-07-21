import type { AuthenticationResult } from "../types";

export interface AuthenticationServiceRequest {
  readonly requestedTenantId?: string;
}

export interface AuthenticationRequestContext {
  readonly requestId: string;
  readonly correlationId?: string;
}

/** Request-scoped orchestration contract. No implementation is active yet. */
export interface AuthenticationService {
  authenticate(
    request: AuthenticationServiceRequest,
    context: AuthenticationRequestContext,
  ): Promise<AuthenticationResult>;
}
